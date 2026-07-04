/**
 * Role Detection System
 *
 * Detects and manages user roles (employer vs worker) for toss-contract-app.
 * Uses multi-factor signals for accurate role detection.
 *
 * @module lib/role-detection
 */

import { supabase } from '@/api/supabase';

// ==========================================
// Type Definitions
// ==========================================

/**
 * User role type
 */
export type UserRole = 'employer' | 'worker';

/**
 * Signals for role detection
 */
export interface RoleSignals {
  /** User's declared role from signup flow */
  selfDeclared?: UserRole;

  /** Account type from profile metadata */
  accountType?: 'individual' | 'business';

  /** Company size (0 = individual, 1+ = has employees) */
  companySize?: number;

  /** Recent activity pattern */
  activityPattern?: 'creates_contracts' | 'signs_contracts' | 'mixed';

  /** Number of contracts created */
  contractsCreated?: number;

  /** Number of contracts signed */
  contractsSigned?: number;
}

/**
 * Role detection result with confidence
 */
export interface RoleDetectionResult {
  /** Detected role */
  role: UserRole;

  /** Confidence level (0-1) */
  confidence: number;

  /** Signals used for detection */
  signals: RoleSignals;

  /** Reason for the detection */
  reason: string;
}

// ==========================================
// Role Detection Class
// ==========================================

/**
 * Detects user role based on multiple signals
 */
export class RoleDetector {
  /**
   * Detect role from signals
   */
  detect(signals: RoleSignals): RoleDetectionResult {
    // Priority 1: Self-declared role (highest confidence)
    if (signals.selfDeclared) {
      return {
        role: signals.selfDeclared,
        confidence: 1.0,
        signals,
        reason: 'User self-declared during signup',
      };
    }

    // Priority 2: Account type from profile
    if (signals.accountType === 'business') {
      return {
        role: 'employer',
        confidence: 0.9,
        signals,
        reason: 'Business account type detected',
      };
    }

    if (signals.accountType === 'individual') {
      // Still could be employer, check other signals
      if (signals.companySize && signals.companySize > 1) {
        return {
          role: 'employer',
          confidence: 0.7,
          signals,
          reason: 'Individual account with multiple employees',
        };
      }
    }

    // Priority 3: Company size
    if (signals.companySize !== undefined) {
      if (signals.companySize > 1) {
        return {
          role: 'employer',
          confidence: 0.8,
          signals,
          reason: `Company size: ${signals.companySize} employees`,
        };
      }
    }

    // Priority 4: Activity pattern
    if (signals.activityPattern) {
      if (signals.activityPattern === 'creates_contracts') {
        return {
          role: 'employer',
          confidence: 0.9,
          signals,
          reason: 'Activity pattern: creates contracts',
        };
      }

      if (signals.activityPattern === 'signs_contracts') {
        return {
          role: 'worker',
          confidence: 0.9,
          signals,
          reason: 'Activity pattern: signs contracts',
        };
      }
    }

    // Priority 5: Contract counts
    if (signals.contractsCreated !== undefined || signals.contractsSigned !== undefined) {
      const created = signals.contractsCreated || 0;
      const signed = signals.contractsSigned || 0;

      if (created > 0 && signed === 0) {
        return {
          role: 'employer',
          confidence: 0.8,
          signals,
          reason: `Created ${created} contracts, signed none`,
        };
      }

      if (signed > 0 && created === 0) {
        return {
          role: 'worker',
          confidence: 0.8,
          signals,
          reason: `Signed ${signed} contracts, created none`,
        };
      }

      if (created > signed) {
        return {
          role: 'employer',
          confidence: 0.7,
          signals,
          reason: `More contracts created (${created}) than signed (${signed})`,
        };
      }

      if (signed > created) {
        return {
          role: 'worker',
          confidence: 0.7,
          signals,
          reason: `More contracts signed (${signed}) than created (${created})`,
        };
      }
    }

    // Default: Worker (safer default)
    return {
      role: 'worker',
      confidence: 0.5,
      signals,
      reason: 'No strong signals detected, defaulting to worker',
    };
  }

  /**
   * Analyze user activity pattern
   */
  async analyzeActivityPattern(userId: string): Promise<RoleSignals> {
    const { data: createdContracts } = await supabase
      .from('contracts')
      .select('id', { count: 'exact' })
      .eq('employer_id', userId);

    const { data: signedContracts } = await supabase
      .from('contract_workers')
      .select('contract_id', { count: 'exact' })
      .eq('worker_id', userId)
      .eq('status', 'signed');

    const contractsCreated = createdContracts?.length || 0;
    const contractsSigned = signedContracts?.length || 0;

    let activityPattern: RoleSignals['activityPattern'] = 'mixed';

    if (contractsCreated > 0 && contractsSigned === 0) {
      activityPattern = 'creates_contracts';
    } else if (contractsSigned > 0 && contractsCreated === 0) {
      activityPattern = 'signs_contracts';
    }

    return {
      contractsCreated,
      contractsSigned,
      activityPattern,
    };
  }

  /**
   * Fetch role signals from database
   */
  async fetchSignals(userId: string): Promise<RoleSignals> {
    const signals: RoleSignals = {};

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type, company_size')
      .eq('id', userId)
      .single();

    if (profile) {
      signals.accountType = profile.account_type;
      signals.companySize = profile.company_size;
    }

    // Analyze activity pattern
    const activitySignals = await this.analyzeActivityPattern(userId);
    Object.assign(signals, activitySignals);

    // Fetch user preferences
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (preferences) {
      signals.selfDeclared = preferences.role;
    }

    return signals;
  }

  /**
   * Detect and update user role
   */
  async detectAndUpdate(userId: string): Promise<RoleDetectionResult> {
    // Fetch signals
    const signals = await this.fetchSignals(userId);

    // Detect role
    const result = this.detect(signals);

    // Update in database if confidence is high enough
    if (result.confidence >= 0.7) {
      await supabase.rpc('update_user_role', {
        p_user_id: userId,
        p_role: result.role,
      });
    }

    return result;
  }
}

// ==========================================
// Singleton Instance
// ==========================================

export const roleDetector = new RoleDetector();

// ==========================================
// React Hook
// ==========================================

/**
 * React hook for role detection
 */
export function useRoleDetection() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const userId = useUserId();

  const detectRole = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const result = await roleDetector.detectAndUpdate(userId);
      setRole(result.role);
      setConfidence(result.confidence);
    } catch (error) {
      console.error('Role detection failed:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    detectRole();
  }, [detectRole]);

  return {
    role,
    confidence,
    loading,
    detectRole,
  };
}

// Import helpers
import { useState, useEffect, useCallback } from 'react';
import { useUserId } from '@/hooks/useUserId';

/**
 * React hook for getting current user role (cached from preferences)
 */
export function useUserRole(): UserRole | null {
  const userId = useUserId();
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Get from user_preferences
    supabase
      .from('user_preferences')
      .select('role')
      .eq('user_id', userId)
      .single()
      .then(({ data }: { data: { role: UserRole } | null }) => {
        if (data) setRole(data.role);
      });
  }, [userId]);

  return role;
}

/**
 * React hook to check if user is employer
 */
export function useIsEmployer(): boolean {
  const role = useUserRole();
  return role === 'employer';
}

/**
 * React hook to check if user is worker
 */
export function useIsWorker(): boolean {
  const role = useUserRole();
  return role === 'worker';
}
