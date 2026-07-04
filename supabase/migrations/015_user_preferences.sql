-- Migration 015: User Preferences Table
-- This migration creates the user_preferences table to support personalization
-- and consent management in compliance with Korean PIPA (Personal Information Protection Act)

-- =============================================
-- Table: user_preferences
-- Purpose: Store user preferences, consent, and personalization settings
-- =============================================

CREATE TABLE IF NOT EXISTS user_preferences (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User Reference
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Role Detection
  role TEXT NOT NULL CHECK (role IN ('employer', 'worker')) DEFAULT 'worker',

  -- UI Preferences
  default_view TEXT CHECK (default_view IN ('dashboard', 'contracts', 'analytics', 'pending')),
  theme TEXT CHECK (theme IN ('light', 'dark', 'auto')) DEFAULT 'auto',
  language TEXT CHECK (language IN ('ko', 'en')) DEFAULT 'ko',

  -- Dashboard Preferences
  dashboard_layout TEXT CHECK (dashboard_layout IN ('grid', 'list')) DEFAULT 'grid',
  show_quick_actions BOOLEAN DEFAULT true,
  show_tutorial BOOLEAN DEFAULT true,

  -- Notification Preferences
  notification_channels TEXT[] DEFAULT '{push}',
  notification_time TEXT CHECK (notification_time IN ('morning', 'afternoon', 'evening', 'anytime')),
  notification_frequency TEXT CHECK (notification_frequency IN ('immediate', 'digest', 'daily')) DEFAULT 'immediate',

  -- Employer-specific Preferences
  employer_default_contract_template UUID REFERENCES contract_templates(id),
  employer_show_analytics BOOLEAN DEFAULT true,
  employer_auto_reminders BOOLEAN DEFAULT true,
  employer_reminder_days_before INTEGER DEFAULT 3,

  -- Worker-specific Preferences
  worker_show_payment_status BOOLEAN DEFAULT true,
  worker_show_schedule_calendar BOOLEAN DEFAULT true,
  worker_enable_sms_notifications BOOLEAN DEFAULT false,

  -- Feature Flags
  beta_features TEXT[] DEFAULT '{}',
  dismissed_announcements TEXT[] DEFAULT '{}',

  -- Consent Management (PIPA Compliance)
  personalization_consent BOOLEAN DEFAULT false,
  analytics_consent BOOLEAN DEFAULT false,
  marketing_consent BOOLEAN DEFAULT false,
  consent_version TEXT DEFAULT '1.0',
  consented_at TIMESTAMPTZ,

  -- Privacy Settings
  data_retention_days INTEGER DEFAULT 365,
  allow_anonymous_usage_data BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(user_id)
);

-- =============================================
-- Indexes
-- =============================================

-- Role-based queries
CREATE INDEX IF NOT EXISTS idx_user_preferences_role ON user_preferences(role);

-- Consent queries
CREATE INDEX IF NOT EXISTS idx_user_preferences_personalization_consent ON user_preferences(personalization_consent);
CREATE INDEX IF NOT EXISTS idx_user_preferences_analytics_consent ON user_preferences(analytics_consent);

-- User lookup
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Composite index for personalization queries
CREATE INDEX IF NOT EXISTS idx_user_preferences_role_consent ON user_preferences(role, personalization_consent);

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Service role can access all preferences (for backend operations)
CREATE POLICY "Service role can access all preferences"
  ON user_preferences FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================
-- Triggers
-- =============================================

-- Trigger: Update updated_at timestamp
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Helper Functions
-- =============================================

-- Function: Get or create user preferences
CREATE OR REPLACE FUNCTION get_or_create_user_preferences(p_user_id UUID)
RETURNS user_preferences
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_preferences user_preferences;
BEGIN
  -- Try to get existing preferences
  SELECT * INTO v_preferences
  FROM user_preferences
  WHERE user_id = p_user_id;

  -- If not found, create default preferences
  IF NOT FOUND THEN
    INSERT INTO user_preferences (
      user_id,
      role,
      theme,
      language,
      dashboard_layout,
      notification_channels
    ) VALUES (
      p_user_id,
      'worker',  -- Default to worker for safety
      'auto',
      'ko',
      'grid',
      '{push}'
    )
    RETURNING * INTO v_preferences;
  END IF;

  RETURN v_preferences;
END;
$$;

-- Function: Update user role based on signals
CREATE OR REPLACE FUNCTION update_user_role(
  p_user_id UUID,
  p_role TEXT
)
RETURNS user_preferences
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_preferences user_preferences;
BEGIN
  -- Validate role
  IF p_role NOT IN ('employer', 'worker') THEN
    RAISE EXCEPTION 'Invalid role: %', p_role;
  END IF;

  -- Update role
  UPDATE user_preferences
  SET
    role = p_role,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING * INTO v_preferences;

  -- If no preferences exist, create with role
  IF NOT FOUND THEN
    INSERT INTO user_preferences (user_id, role)
    VALUES (p_user_id, p_role)
    RETURNING * INTO v_preferences;
  END IF;

  RETURN v_preferences;
END;
$$;

-- Function: Update consent
CREATE OR REPLACE FUNCTION update_user_consent(
  p_user_id UUID,
  p_personalization_consent BOOLEAN DEFAULT NULL,
  p_analytics_consent BOOLEAN DEFAULT NULL,
  p_marketing_consent BOOLEAN DEFAULT NULL
)
RETURNS user_preferences
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_preferences user_preferences;
BEGIN
  -- Update consent fields
  UPDATE user_preferences
  SET
    personalization_consent = COALESCE(p_personalization_consent, personalization_consent),
    analytics_consent = COALESCE(p_analytics_consent, analytics_consent),
    marketing_consent = COALESCE(p_marketing_consent, marketing_consent),
    consent_version = '1.0',
    consented_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING * INTO v_preferences;

  -- If no preferences exist, create with consent
  IF NOT FOUND THEN
    INSERT INTO user_preferences (
      user_id,
      personalization_consent,
      analytics_consent,
      marketing_consent,
      consent_version,
      consented_at
    ) VALUES (
      p_user_id,
      COALESCE(p_personalization_consent, false),
      COALESCE(p_analytics_consent, false),
      COALESCE(p_marketing_consent, false),
      '1.0',
      NOW()
    )
    RETURNING * INTO v_preferences;
  END IF;

  RETURN v_preferences;
END;
$$;

-- =============================================
-- Comments for Documentation
-- =============================================

COMMENT ON TABLE user_preferences IS 'User preferences and consent management for personalization';

COMMENT ON COLUMN user_preferences.id IS 'Unique identifier for the preference record';
COMMENT ON COLUMN user_preferences.user_id IS 'Reference to auth.users(id)';
COMMENT ON COLUMN user_preferences.role IS 'User role: employer or worker';
COMMENT ON COLUMN user_preferences.default_view IS 'Default dashboard view';
COMMENT ON COLUMN user_preferences.theme IS 'UI theme preference';
COMMENT ON COLUMN user_preferences.language IS 'Language preference';
COMMENT ON COLUMN user_preferences.personalization_consent IS 'Consent for personalization features (PIPA)';
COMMENT ON COLUMN user_preferences.analytics_consent IS 'Consent for analytics tracking (PIPA)';
COMMENT ON COLUMN user_preferences.marketing_consent IS 'Consent for marketing communications (PIPA)';
COMMENT ON COLUMN user_preferences.consent_version IS 'Version of consent terms agreed to';
COMMENT ON COLUMN user_preferences.consented_at IS 'Timestamp of consent agreement';
