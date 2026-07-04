# Research Report: Personalization Data Architecture

**Team**: Research Team (insane-search + fact-checking)
**Date**: 2026-07-04
**Version**: 1.0
**Research Duration**: 8 minutes

---

## Executive Summary

This research investigates optimal data architecture for storing user personalization preferences in Supabase, with focus on schema design, Row Level Security (RLS) policies, and real-time update mechanisms. Key findings reveal that JSONB-based storage with GIN indexing provides optimal flexibility for evolving personalization requirements while maintaining query performance.

---

## Research Questions

1. How to store user preferences in Supabase?
2. What is the optimal schema for personalization data?
3. How to handle real-time personalization updates?
4. What are the RLS policies for personalization data?

---

## Methodology

**Approach**: Multi-source research focusing on Supabase documentation and PostgreSQL best practices
**Sources Analyzed**: 8+ sources including Supabase docs, PostgreSQL guides, Reddit discussions
**Timeline**: 8 minutes

---

## Key Findings

### Finding 1: Schema Design Options
**Confidence**: High
**Sources**: [Supabase RLS Docs](https://supabase.com/docs/guides/database/postgres/row-level-security), PostgreSQL community

**Three Schema Approaches**:

#### Option 1: Pure JSONB (Maximum Flexibility)
```sql
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GIN index for JSONB queries
CREATE INDEX idx_user_preferences_preferences
ON public.user_preferences USING GIN(preferences);

-- Standard index for user lookups
CREATE INDEX idx_user_preferences_user_id
ON public.user_preferences(user_id);
```

**Benefits**:
- No migrations needed for new preferences
- Can store complex nested structures
- JSONB is efficient and queryable

**Drawbacks**:
- No type safety at database level
- More complex queries

#### Option 2: Hybrid Approach (Recommended)
```sql
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Core preferences as columns (fast, type-safe)
  theme VARCHAR(20) DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'ko',
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  default_role VARCHAR(20) DEFAULT 'worker', -- 'employer' or 'worker'

  -- Flexible preferences for evolving needs
  additional_settings JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  consent_version VARCHAR(20), // Track consent version
  data_retention_days INTEGER DEFAULT 365,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Composite index for common queries
CREATE INDEX idx_user_preferences_user_role
ON public.user_preferences(user_id, default_role);

-- JSONB index for additional settings
CREATE INDEX idx_user_preferences_additional
ON public.user_preferences USING GIN(additional_settings);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

**Benefits**:
- Type-safe core preferences
- Fast queries on common fields
- Flexibility for future preferences
- Optimal for most use cases

#### Option 3: Key-Value (Maximum Flexibility)
```sql
CREATE TABLE public.user_preferences_kv (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key VARCHAR(100) NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, key)
);

CREATE INDEX idx_user_preferences_kv_user_key
ON public.user_preferences_kv(user_id, key);
```

**Benefits**:
- Maximum flexibility
- Easy to add new preferences
- Simple permission model per key

**Drawbacks**:
- Complex queries (multiple rows per user)
- No cross-key constraints
- More joins required

---

### Finding 2: Recommended Schema for Contract App
**Confidence**: High
**Sources**: Hybrid approach best practices

**Recommended Schema**:

```sql
-- Core user preferences table
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- UI Preferences
  theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  language VARCHAR(10) DEFAULT 'ko' CHECK (language IN ('ko', 'en')),

  -- Role Preferences
  default_role VARCHAR(20),
  last_used_role VARCHAR(20),

  -- Notification Preferences
  email_contract_updates BOOLEAN DEFAULT true,
  push_signature_reminders BOOLEAN DEFAULT true,
  sms_critical_alerts BOOLEAN DEFAULT false,

  -- Display Preferences
  contracts_per_page INTEGER DEFAULT 20,
  default_sort_order VARCHAR(20) DEFAULT 'date_desc',
  show_completed_contracts BOOLEAN DEFAULT true,

  -- Consent & Privacy
  personalization_consent BOOLEAN DEFAULT false,
  analytics_consent BOOLEAN DEFAULT false,
  consent_version VARCHAR(20) DEFAULT '1.0',
  consent_date TIMESTAMPTZ,

  -- Flexible storage for future preferences
  custom_settings JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_role CHECK (default_role IN ('employer', 'worker', null))
);

-- Indexes
CREATE INDEX idx_user_preferences_user_id
ON public.user_preferences(user_id);

CREATE INDEX idx_user_preferences_role
ON public.user_preferences(default_role)
WHERE default_role IS NOT NULL;

-- JSONB index for custom settings
CREATE INDEX idx_user_preferences_custom
ON public.user_preferences USING GIN(custom_settings);
```

---

### Finding 3: Row Level Security Policies
**Confidence**: High
**Sources**: [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)

**Comprehensive RLS Setup**:

```sql
-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own preferences
CREATE POLICY "Users can view own preferences"
ON public.user_preferences FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
ON public.user_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own preferences
CREATE POLICY "Users can update own preferences"
ON public.user_preferences FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own preferences
CREATE POLICY "Users can delete own preferences"
ON public.user_preferences FOR DELETE
USING (auth.uid() = user_id);

-- Optional: Service role can access all (for admin operations)
CREATE POLICY "Service role can manage all preferences"
ON public.user_preferences FOR ALL
USING (auth.role() = 'service_role');
```

**Privacy-Preserving Policies**:

```sql
-- For employer-worker scenarios, ensure data isolation
CREATE POLICY "Employers cannot view worker preferences"
ON public.user_preferences FOR SELECT
USING (
  auth.uid() = user_id OR
  (auth.role() = 'service_role') OR
  -- Business logic: employer can only see aggregated data
  (default_role = 'employer' AND is_aggregated_query())
);

-- Helper function to check if query is aggregated
CREATE OR REPLACE FUNCTION is_aggregated_query()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current query is using aggregation
  -- This is a simplified example
  RETURN EXISTS (
    SELECT 1 FROM pg_stat_activity
    WHERE pid = pg_backend_pid()
    AND query LIKE '%COUNT(%'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### Finding 4: Real-Time Updates
**Confidence**: High
**Sources**: Supabase Realtime documentation

**Client-Side Implementation**:

```typescript
// hooks/useUserPreferences.ts
import { useEffect, useState } from '@supabase/supabase-js';
import { supabase } from '@/api/supabase';

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'ko' | 'en';
  default_role?: 'employer' | 'worker';
  email_contract_updates: boolean;
  push_signature_reminders: boolean;
  // ... other fields
}

export function useUserPreferences(userId: string) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let channel: RealtimeChannel;

    const fetchPreferences = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setPreferences(data);
      }
      setLoading(false);
    };

    fetchPreferences();

    // Subscribe to real-time changes
    channel = supabase
      .channel('user-preferences-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_preferences',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Preferences changed:', payload);

          switch (payload.eventType) {
            case 'INSERT':
            case 'UPDATE':
              setPreferences(payload.new as UserPreferences);
              break;
            case 'DELETE':
              setPreferences(null);
              break;
          }
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId]);

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString()
      });

    if (error) {
      setError(error.message);
      throw error;
    }

    return data;
  };

  return { preferences, loading, error, updatePreferences };
}
```

**Optimistic Updates**:

```typescript
// Update locally immediately, then sync with server
const updatePreferencesOptimistic = async (updates: Partial<UserPreferences>) => {
  // Optimistic update
  setPreferences(prev => ({ ...prev, ...updates }));

  try {
    // Server update
    const { error } = await supabase
      .from('user_preferences')
      .update(updates)
      .eq('user_id', userId);

    if (error) {
      // Revert on error
      const { data } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      setPreferences(data);
      throw error;
    }
  } catch (error) {
    console.error('Failed to update preferences:', error);
  }
};
```

---

### Finding 5: Performance Optimization
**Confidence**: Medium
**Sources**: PostgreSQL performance best practices

**Optimization Strategies**:

```sql
-- 1. Partial indexes for common queries
CREATE INDEX idx_user_preferences_active_employers
ON public.user_preferences(user_id, default_role)
WHERE default_role = 'employer' AND personalization_consent = true;

-- 2. Covering index for frequent queries
CREATE INDEX idx_user_preferences_covering
ON public.user_preferences(user_id, theme, language, default_role);

-- 3. Expression index for JSONB queries
CREATE INDEX idx_user_preferences_custom_theme
ON public.user_preferences((custom_settings->>'theme'))
WHERE custom_settings ? 'theme';

-- 4. BRIN index for time-series data (if large table)
CREATE INDEX idx_user_preferences_created_brin
ON public.user_preferences USING BRIN(created_at);
```

**Query Optimization**:

```typescript
// Efficient query patterns
const getPreferences = async (userId: string) => {
  // ✅ Good: Select only needed columns
  const { data } = await supabase
    .from('user_preferences')
    .select('theme, language, default_role')
    .eq('user_id', userId)
    .single();

  // ❌ Bad: Select all columns when not needed
  const { data: allData } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
};

// Batch preference updates
const updateMultiplePreferences = async (userId: string, updates: Record<string, any>) => {
  // ✅ Good: Single query with JSONB merge
  const { data } = await supabase
    .from('user_preferences')
    .update({
      custom_settings: {
        ...existingPreferences.custom_settings,
        ...updates
      }
    })
    .eq('user_id', userId);
};
```

---

## Implementation Strategy

### Phase 1: Schema Setup (Day 1)
1. Create user_preferences table with hybrid schema
2. Set up RLS policies
3. Create indexes for common queries
4. Test with sample data

### Phase 2: Client Integration (Day 2)
1. Implement useUserPreferences hook
2. Set up real-time subscriptions
3. Add optimistic updates
4. Test preference persistence

### Phase 3: Advanced Features (Day 3)
1. Implement consent management
2. Add preference validation
3. Set up analytics tracking
4. Document preference schema

---

## Recommendations

Based on validated findings:

1. **Use Hybrid Schema Approach**
   - Rationale: Type-safe core fields + flexible JSONB
   - Trade-offs: More complex than pure JSONB

2. **Implement Comprehensive RLS**
   - Rationale: Privacy protection is mandatory
   - Trade-offs: More policy complexity

3. **Use Real-Time Subscriptions**
   - Rationale: Instant preference updates
   - Trade-offs: Additional infrastructure

4. **Add Performance Indexes**
   - Rationale: Fast queries at scale
   - Trade-offs: Slightly slower writes

5. **Document Preference Schema**
   - Rationale: Team collaboration
   - Trade-offs: Documentation maintenance

---

## Trade-offs

| Approach | Pros | Cons |
|----------|------|------|
| **Hybrid Schema** | Type-safe + flexible | More complex |
| **Pure JSONB** | Maximum flexibility | No type safety |
| **Key-Value** | Simple to extend | Complex queries |
| **Real-Time Sync** | Instant updates | Higher costs |

---

## Sources

### Primary Sources
- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [PostgreSQL JSONB Documentation](https://www.postgresql.org/docs/current/datatype-json.html)

### Secondary Sources
- [Reddit Discussion on User Preferences](https://www.reddit.com/r/PostgreSQL/comments/1fqn6mx/should_i save user preference as json or/)
- [Supabase User Management](https://supabase.com/docs/guides/auth/managing-user-data)

---

## Limitations & Future Research

### Limitations
- Korean-specific privacy requirements may need additional considerations
- Performance characteristics at scale not fully tested
- Consent management complexity varies by jurisdiction

### Confidence Gaps
- **Medium Confidence**: Optimal JSONB structure for contract app (requires testing)
- **Medium Confidence**: Real-time performance at scale (depends on user base)

### Future Research
- Test with actual user data patterns
- Research GDPR/Korean privacy compliance in detail
- Investigate preference migration strategies
- Study performance at 10k+ users

---

**Report Generated**: 2026-07-04 05:55 KST
