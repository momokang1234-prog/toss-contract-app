export type UserRole = 'employer' | 'worker' | 'unknown';

export interface UserProfile {
  userKey: string;
  role: UserRole;
  name: string;
  phone: string;
  ci?: string;
  email?: string;
  createdAt: string;
}
