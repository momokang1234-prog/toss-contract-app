/**
 * Personalization Engine
 *
 * Applies personalized UX based on user role, preferences, and consent.
 * Respects privacy regulations (PIPA) and requires explicit consent.
 *
 * @module lib/personalization-engine
 */

import { supabase } from '@/api/supabase';
import { consentManager } from './consent-manager';
import type { UserRole } from './role-detection';

// ==========================================
// Type Definitions
// ==========================================

/**
 * User preferences from database
 */
export interface UserPreferences {
  id: string;
  user_id: string;
  role: UserRole;
  default_view?: string;
  theme?: 'light' | 'dark' | 'auto';
  language?: 'ko' | 'en';
  dashboard_layout?: 'grid' | 'list';
  show_quick_actions?: boolean;
  show_tutorial?: boolean;
  notification_channels?: string[];
  notification_time?: 'morning' | 'afternoon' | 'evening' | 'anytime';
  notification_frequency?: 'immediate' | 'digest' | 'daily';

  // Employer-specific
  employer_default_contract_template?: string;
  employer_show_analytics?: boolean;
  employer_auto_reminders?: boolean;
  employer_reminder_days_before?: number;

  // Worker-specific
  worker_show_payment_status?: boolean;
  worker_show_schedule_calendar?: boolean;
  worker_enable_sms_notifications?: boolean;

  // Consent
  personalization_consent?: boolean;
  analytics_consent?: boolean;
  marketing_consent?: boolean;

  // Derived metrics (not stored, computed at runtime)
  contracts_count?: number;
  pending_contracts?: number;
  device_type?: 'mobile' | 'desktop';
}

/**
 * Personalization action to apply
 */
export type PersonalizationAction =
  | 'show-advanced-analytics'
  | 'highlight-pending-contracts'
  | 'simplify-ui'
  | 'show-management-tools'
  | 'show-signing-tools'
  | 'show-payment-status'
  | 'show-schedule-calendar'
  | 'use-default-experience';

/**
 * Personalization result
 */
export interface PersonalizationResult {
  /** Actions to apply */
  actions: PersonalizationAction[];

  /** UI preferences */
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: 'ko' | 'en';
    layout: 'grid' | 'list';
    showQuickActions: boolean;
    showTutorial: boolean;
  };

  /** Dashboard configuration */
  dashboard: {
    defaultView: string;
    showAnalytics: boolean;
    showPaymentStatus: boolean;
    showScheduleCalendar: boolean;
  };

  /** Notification settings */
  notifications: {
    channels: string[];
    time: 'morning' | 'afternoon' | 'evening' | 'anytime';
    frequency: 'immediate' | 'digest' | 'daily';
    autoReminders: boolean;
    reminderDaysBefore: number;
  };
}

// ==========================================
// Personalization Rule
// ==========================================

interface PersonalizationRule {
  /** Rule name for debugging */
  name: string;

  /** Trigger condition */
  trigger: (prefs: UserPreferences) => boolean;

  /** Action to apply when triggered */
  action: PersonalizationAction;

  /** Priority (lower = higher priority) */
  priority: number;
}

// ==========================================
// Personalization Engine Class
// ==========================================

export class PersonalizationEngine {
  private rules: PersonalizationRule[] = [
    // ==========================
    // Privacy Rules (Highest Priority)
    // ==========================
    {
      name: 'Privacy - No consent',
      trigger: (prefs) => !prefs.personalization_consent,
      action: 'use-default-experience',
      priority: 10,
    },

    // ==========================
    // Employer Rules
    // ==========================
    {
      name: 'Employer - Advanced analytics',
      trigger: (prefs) =>
        prefs.role === 'employer' &&
        (prefs.personalization_consent || false) &&
        prefs.employer_show_analytics !== false &&
        (prefs.contracts_count || 0) > 10,
      action: 'show-advanced-analytics',
      priority: 1,
    },

    {
      name: 'Employer - Management tools',
      trigger: (prefs) =>
        prefs.role === 'employer' && (prefs.personalization_consent || false),
      action: 'show-management-tools',
      priority: 2,
    },

    // ==========================
    // Worker Rules
    // ==========================
    {
      name: 'Worker - Highlight pending',
      trigger: (prefs) =>
        prefs.role === 'worker' &&
        (prefs.personalization_consent || false) &&
        (prefs.pending_contracts || 0) > 0,
      action: 'highlight-pending-contracts',
      priority: 1,
    },

    {
      name: 'Worker - Signing tools',
      trigger: (prefs) =>
        prefs.role === 'worker' && (prefs.personalization_consent || false),
      action: 'show-signing-tools',
      priority: 2,
    },

    {
      name: 'Worker - Simplify mobile UI',
      trigger: (prefs) =>
        prefs.role === 'worker' &&
        (prefs.personalization_consent || false) &&
        prefs.device_type === 'mobile',
      action: 'simplify-ui',
      priority: 3,
    },

    {
      name: 'Worker - Show payment status',
      trigger: (prefs) =>
        prefs.role === 'worker' &&
        (prefs.personalization_consent || false) &&
        prefs.worker_show_payment_status !== false,
      action: 'show-payment-status',
      priority: 3,
    },

    {
      name: 'Worker - Show schedule calendar',
      trigger: (prefs) =>
        prefs.role === 'worker' &&
        (prefs.personalization_consent || false) &&
        prefs.worker_show_schedule_calendar !== false,
      action: 'show-schedule-calendar',
      priority: 4,
    },
  ];

  /**
   * Apply personalization for a user
   */
  async apply(userId: string): Promise<PersonalizationResult> {
    // Get user preferences
    const prefs = await this.getUserPreferences(userId);

    // Check consent first
    if (!prefs.personalization_consent) {
      return this.getDefaultExperience();
    }

    // Apply rules
    const actions = this.applyRules(prefs);

    // Build personalization result
    return this.buildResult(actions, prefs);
  }

  /**
   * Apply rules and return sorted actions
   */
  private applyRules(prefs: UserPreferences): PersonalizationAction[] {
    return this.rules
      .filter(rule => rule.trigger(prefs))
      .sort((a, b) => a.priority - b.priority)
      .map(rule => rule.action);
  }

  /**
   * Build personalization result from actions and preferences
   */
  private buildResult(actions: PersonalizationAction[], prefs: UserPreferences): PersonalizationResult {
    const hasAction = (action: PersonalizationAction) => actions.includes(action);

    return {
      actions,
      ui: {
        theme: prefs.theme || 'auto',
        language: prefs.language || 'ko',
        layout: prefs.dashboard_layout || 'grid',
        showQuickActions: prefs.show_quick_actions !== false,
        showTutorial: prefs.show_tutorial !== false,
      },
      dashboard: {
        defaultView: prefs.default_view || (prefs.role === 'employer' ? 'contracts' : 'pending'),
        showAnalytics: hasAction('show-advanced-analytics'),
        showPaymentStatus: hasAction('show-payment-status'),
        showScheduleCalendar: hasAction('show-schedule-calendar'),
      },
      notifications: {
        channels: prefs.notification_channels || ['push'],
        time: prefs.notification_time || 'anytime',
        frequency: prefs.notification_frequency || 'immediate',
        autoReminders: prefs.employer_auto_reminders !== false,
        reminderDaysBefore: prefs.employer_reminder_days_before || 3,
      },
    };
  }

  /**
   * Get user preferences with derived metrics
   */
  private async getUserPreferences(userId: string): Promise<UserPreferences> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return this.getDefaultPreferences();
    }

    // Add derived metrics
    const prefs: UserPreferences = {
      ...data,
      contracts_count: await this.getContractCount(userId),
      pending_contracts: await this.getPendingContractCount(userId),
      device_type: this.getDeviceType(),
    };

    return prefs;
  }

  /**
   * Get default experience (no personalization)
   */
  private getDefaultExperience(): PersonalizationResult {
    return {
      actions: ['use-default-experience'],
      ui: {
        theme: 'auto',
        language: 'ko',
        layout: 'grid',
        showQuickActions: true,
        showTutorial: true,
      },
      dashboard: {
        defaultView: 'dashboard',
        showAnalytics: false,
        showPaymentStatus: false,
        showScheduleCalendar: false,
      },
      notifications: {
        channels: ['push'],
        time: 'anytime',
        frequency: 'immediate',
        autoReminders: false,
        reminderDaysBefore: 3,
      },
    };
  }

  /**
   * Get default preferences
   */
  private getDefaultPreferences(): UserPreferences {
    return {
      id: '',
      user_id: '',
      role: 'worker',
      theme: 'auto',
      language: 'ko',
      dashboard_layout: 'grid',
      show_quick_actions: true,
      show_tutorial: true,
      notification_channels: ['push'],
      personalization_consent: false,
      analytics_consent: false,
      marketing_consent: false,
      contracts_count: 0,
      pending_contracts: 0,
      device_type: this.getDeviceType(),
    };
  }

  /**
   * Get contract count for user
   */
  private async getContractCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from('contracts')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', userId);

    return count || 0;
  }

  /**
   * Get pending contract count for user
   */
  private async getPendingContractCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from('contract_workers')
      .select('*', { count: 'exact', head: true })
      .eq('worker_id', userId)
      .in('status', ['pending', 'sent']);

    return count || 0;
  }

  /**
   * Detect device type
   */
  private getDeviceType(): 'mobile' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';

    const userAgent = window.navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    return isMobile ? 'mobile' : 'desktop';
  }
}

// ==========================================
// Singleton Instance
// ==========================================

export const personalizationEngine = new PersonalizationEngine();

// ==========================================
// React Hook
// ==========================================

/**
 * React hook for personalization
 */
export function usePersonalization() {
  const [personalization, setPersonalization] = useState<PersonalizationResult | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = useUserId();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    personalizationEngine.apply(userId).then(setPersonalization).finally(() => setLoading(false));
  }, [userId]);

  return {
    personalization,
    loading,
  };
}

// Import helpers
import { useState, useEffect } from 'react';
import { useUserId } from '@/hooks/useUserId';

/**
 * React hook to check if a personalization action is active
 */
export function useHasPersonalizationAction(action: PersonalizationAction): boolean {
  const { personalization } = usePersonalization();
  return personalization?.actions.includes(action) || false;
}
