/**
 * Consent Manager
 *
 * Manages user consent for personalization, analytics, and marketing features
 * in compliance with Korean PIPA (Personal Information Protection Act).
 *
 * Key Features:
 * - Explicit consent (opt-in, not opt-out)
 * - Granular consent scope
 * - Consent versioning
 * - Audit trail
 *
 * @module lib/consent-manager
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/api/supabase';
import { useUserId } from '@/hooks/useUserId';

// ==========================================
// Type Definitions
// ==========================================

/**
 * Consent scope defining what the user has agreed to
 */
export interface ConsentScope {
  /** Consent for personalized features (role-based UX, recommendations) */
  personalization: boolean;

  /** Consent for analytics tracking (page views, events, performance) */
  analytics: boolean;

  /** Consent for marketing communications (email, SMS, push notifications) */
  marketing: boolean;
}

/**
 * Consent record with metadata
 */
export interface ConsentRecord extends ConsentScope {
  /** Version of consent terms */
  version: string;

  /** When consent was given */
  consentedAt: Date | null;
}

/**
 * Consent update options
 */
export interface ConsentUpdateOptions {
  /** Personalization consent */
  personalization?: boolean;

  /** Analytics consent */
  analytics?: boolean;

  /** Marketing consent */
  marketing?: boolean;
}

// ==========================================
// Consent Manager Class
// ==========================================

/**
 * Manages user consent lifecycle
 */
export class ConsentManager {
  private cache: Map<string, ConsentRecord> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes

  /**
   * Get user consent from database or cache
   */
  async getConsent(userId: string): Promise<ConsentRecord> {
    // Check cache first
    const cached = this.getCachedConsent(userId);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const { data, error } = await supabase
      .from('user_preferences')
      .select('personalization_consent, analytics_consent, marketing_consent, consent_version, consented_at')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Failed to fetch consent:', error);
      return this.getDefaultConsent();
    }

    const consent: ConsentRecord = {
      personalization: data.personalization_consent || false,
      analytics: data.analytics_consent || false,
      marketing: data.marketing_consent || false,
      version: data.consent_version || '1.0',
      consentedAt: data.consented_at ? new Date(data.consented_at) : null,
    };

    // Cache the result
    this.setCachedConsent(userId, consent);

    return consent;
  }

  /**
   * Update user consent
   */
  async updateConsent(userId: string, options: ConsentUpdateOptions): Promise<ConsentRecord> {
    const { data, error } = await supabase.rpc('update_user_consent', {
      p_user_id: userId,
      p_personalization_consent: options.personalization,
      p_analytics_consent: options.analytics,
      p_marketing_consent: options.marketing,
    });

    if (error) {
      console.error('Failed to update consent:', error);
      throw new Error('Consent update failed');
    }

    const consent: ConsentRecord = {
      personalization: data.personalization_consent,
      analytics: data.analytics_consent,
      marketing: data.marketing_consent,
      version: data.consent_version,
      consentedAt: data.consented_at ? new Date(data.consented_at) : null,
    };

    // Update cache
    this.setCachedConsent(userId, consent);

    return consent;
  }

  /**
   * Check if user has given consent for a specific scope
   */
  async hasConsent(userId: string, scope: keyof ConsentScope): Promise<boolean> {
    const consent = await this.getConsent(userId);
    return consent[scope] || false;
  }

  /**
   * Require consent - throw error if not consented
   */
  async requireConsent(userId: string, scope: keyof ConsentScope): Promise<void> {
    const consent = await this.getConsent(userId);

    if (!consent[scope]) {
      throw new ConsentRequiredError(scope);
    }
  }

  /**
   * Check if consent needs to be re-obtained (version changed)
   */
  async needsConsentUpdate(userId: string, currentVersion: string): Promise<boolean> {
    const consent = await this.getConsent(userId);
    return consent.version !== currentVersion;
  }

  // ==========================================
  // Private Methods
  // ==========================================

  private getCachedConsent(userId: string): ConsentRecord | null {
    const cached = this.cache.get(userId);
    if (!cached) return null;

    const now = Date.now();
    const timestamp = cached.consentedAt?.getTime() || 0;

    if (now - timestamp > this.cacheExpiry) {
      this.cache.delete(userId);
      return null;
    }

    return cached;
  }

  private setCachedConsent(userId: string, consent: ConsentRecord): void {
    this.cache.set(userId, consent);
  }

  private getDefaultConsent(): ConsentRecord {
    return {
      personalization: false,
      analytics: false,
      marketing: false,
      version: '1.0',
      consentedAt: null,
    };
  }
}

// ==========================================
// Error Classes
// ==========================================

/**
 * Error thrown when consent is required but not given
 */
export class ConsentRequiredError extends Error {
  constructor(public scope: keyof ConsentScope) {
    super(`Consent required for: ${scope}`);
    this.name = 'ConsentRequiredError';
  }
}

// ==========================================
// Singleton Instance
// ==========================================

/**
 * Global consent manager instance
 */
export const consentManager = new ConsentManager();

// ==========================================
// React Hook
// ==========================================

/**
 * React hook for consent management
 */
export function useConsent() {
  const [consent, setConsent] = useState<ConsentRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = useUserId();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    consentManager.getConsent(userId).then(setConsent).finally(() => setLoading(false));
  }, [userId]);

  const updateConsent = useCallback(async (options: ConsentUpdateOptions) => {
    if (!userId) return;

    const updated = await consentManager.updateConsent(userId, options);
    setConsent(updated);
  }, [userId]);

  const hasConsent = useCallback((scope: keyof ConsentScope): boolean => {
    return consent?.[scope] || false;
  }, [consent]);

  return {
    consent,
    loading,
    updateConsent,
    hasConsent,
  };
}
