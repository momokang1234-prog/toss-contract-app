/**
 * useUserId Hook
 *
 * React hook to get the current user's ID from authentication context
 *
 * @module hooks/useUserId
 */

import { useContext } from 'react';
import { AuthContext, type AuthState } from '@/contexts/AuthContext';

/**
 * Get current user ID
 *
 * Returns the user ID from authentication context, or null if not authenticated
 */
export function useUserId(): string | null {
  const authContext = useContext(AuthContext) as AuthState | null;

  if (!authContext || !authContext.isAuthenticated) {
    return null;
  }

  // Try to get user ID from Supabase auth
  // For now, return userKey as the ID (adjust based on your auth implementation)
  const userProfile = authContext.userProfile;
  return userProfile?.userKey || null;
}

/**
 * Check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const authContext = useContext(AuthContext) as AuthState | null;
  return authContext?.isAuthenticated || false;
}

/**
 * Get current user role
 */
export function useCurrentUserRole(): 'employer' | 'worker' | null {
  const authContext = useContext(AuthContext) as AuthState | null;
  return authContext?.userRole || null;
}
