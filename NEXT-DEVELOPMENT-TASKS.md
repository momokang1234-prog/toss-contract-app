# Next Development Tasks — toss-contract-app

**Phase**: Integration Week 2
**Based on**: IMPLEMENTATION-ROADMAP.md
**Status**: Ready to Start

---

## 📋 Phase 2: Integration (Week 2)

### Task 1: Consent Management UI

**Goal**: Create user-facing consent interface

**Components to Create**:

1. **`src/components/consent/ConsentForm.tsx`**
   ```typescript
   // Onboarding consent selection
   - Personalization consent (role-based UX)
   - Analytics consent (usage tracking)
   - Marketing consent (optional)
   - Consent version display
   - PIPA compliance notice
   ```

2. **`src/components/consent/ConsentBanner.tsx`**
   ```typescript
   // Bottom banner for delayed consent request
   - Slide-up animation
   - Accept/Decline buttons
   - Learn more link
   - Dismiss with remember choice
   ```

3. **`src/pages/user/ConsentPreferencesPage.tsx`**
   ```typescript
   // Full consent management page
   - All consent toggles
   - Consent history/timeline
   - Data retention settings
   - Export data option
   ```

**Integration Points**:
- After Toss login (`LoginPage.tsx`)
- Settings page link
- Dashboard prompt

---

### Task 2: Role Selection UI

**Goal**: Allow users to select/update their role

**Components to Create**:

1. **`src/components/role/RoleSelectionDialog.tsx`**
   ```typescript
   // Modal for role selection
   - Employer option (with description)
   - Worker option (with description)
   - Helper text explaining difference
   - Skip for now option
   ```

2. **`src/components/role/RoleSwitcher.tsx`**
   ```typescript
   // Dev-only role switcher for testing
   - Environment check (dev only)
   - Quick role toggle
   - Reset preferences button
   ```

**Integration Points**:
- New user signup (after login)
- Settings page
- Dev mode (bottom-right fixed)

---

### Task 3: Personalized Dashboard Components

**Goal**: Apply role-based personalization to dashboards

**Components to Create**:

1. **`src/components/dashboard/EmployerDashboard.tsx`**
   ```typescript
   // Employer-specific dashboard
   - Analytics overview (contracts count, completion rate)
   - Quick actions: Create contract, View pending, Send reminders
   - Recent contracts list
   - Pending approvals section
   - Performance metrics chart
   ```

2. **`src/components/dashboard/WorkerDashboard.tsx`**
   ```typescript
   // Worker-specific dashboard
   - Pending contracts (highlighted)
   - Quick actions: View pending, Sign contract, Update profile
   - Contract history
   - Payment status section
   - Simplified mobile layout
   ```

3. **`src/components/dashboard/QuickActions.tsx`**
   ```typescript
   // Role-based quick actions
   - Dynamic action list based on role
   - Grid layout (desktop) / List layout (mobile)
   - Icon + Label + Badge
   ```

**Integration Points**:
- `src/pages/employer/DashboardPage.tsx`
- `src/pages/worker/DashboardPage.tsx` (create if needed)
- Mobile responsive

---

### Task 4: Integration & Testing

**Goal**: Verify all features work together

**Test Scenarios**:

1. **Consent Flow**
   - [ ] New user sees consent form after login
   - [ ] Can accept/decline each consent type
   - [ ] Consent state persists across sessions
   - [ ] Declining personalization shows default UX
   - [ ] Analytics only tracks when consented

2. **Role Detection**
   - [ ] New user can select role
   - [ ] Existing user role is preserved
   - [ ] Role switcher works (dev only)
   - [ ] Dashboard shows correct role UI

3. **Personalization**
   - [ ] Employer sees management tools
   - [ ] Worker sees signing tools
   - [ ] Mobile simplifies UI for workers
   - [ ] Analytics show for employers (10+ contracts)
   - [ ] Pending contracts highlighted for workers

4. **Privacy**
   - [ ] No tracking without consent
   - [ ] Consent can be updated anytime
   - [ ] Data respects consent scope
   - [ ] Default experience works without consent

---

## 🎯 Implementation Order

### Day 1-2: Consent UI
- Create `ConsentForm.tsx`
- Create `ConsentBanner.tsx`
- Create `ConsentPreferencesPage.tsx`
- Integrate with login flow

### Day 3-4: Role Selection
- Create `RoleSelectionDialog.tsx`
- Create `RoleSwitcher.tsx` (dev)
- Update signup flow
- Test role persistence

### Day 5-6: Personalized Dashboards
- Create `EmployerDashboard.tsx`
- Create `WorkerDashboard.tsx`
- Create `QuickActions.tsx`
- Update existing dashboard pages

### Day 7: Testing & Polish
- End-to-end testing
- Bug fixes
- Performance check
- Documentation update

---

## 📁 File Structure (New)

```
src/
├── components/
│   ├── consent/
│   │   ├── ConsentForm.tsx
│   │   ├── ConsentBanner.tsx
│   │   └── ConsentPreferences.tsx
│   ├── role/
│   │   ├── RoleSelectionDialog.tsx
│   │   └── RoleSwitcher.tsx
│   └── dashboard/
│       ├── EmployerDashboard.tsx
│       ├── WorkerDashboard.tsx
│       └── QuickActions.tsx
├── pages/
│   ├── user/
│   │   ├── ConsentPreferencesPage.tsx
│   │   └── SettingsPage.tsx (update)
│   ├── employer/
│   │   └── DashboardPage.tsx (update)
│   └── worker/
│       └── DashboardPage.tsx (create or update)
└── hooks/
    ├── useConsent.ts (already in consent-manager.ts)
    └── usePersonalization.ts (already in personalization-engine.ts)
```

---

## 🔧 Quick Start Commands

```bash
# Create component directories
mkdir -p src/components/consent
mkdir -p src/components/role
mkdir -p src/components/dashboard
mkdir -p src/pages/user

# Push database migration
supabase db push

# Start dev server
npm run dev

# Run type check
npm run typecheck

# Run tests
npm run test
```

---

## 📊 Success Criteria

**Must Have** (Week 2):
- [ ] Consent UI integrated into login flow
- [ ] Role selection working for new users
- [ ] Employer/Worker dashboards differentiated
- [ ] All consent scenarios tested

**Should Have** (Week 2):
- [ ] Consent preferences page
- [ ] Mobile-optimized worker dashboard
- [ ] Dev role switcher
- [ ] Analytics verification

**Could Have** (Week 3+):
- [ ] A/B testing framework
- [ ] Advanced analytics dashboard
- [ ] Behavioral triggers
- [ ] Personalization metrics

---

**Last Updated**: 2026-07-04
**Next Review**: End of Week 2
