import type { AppRole } from '@/lib/permissions';

export function normalizeInviteEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isSameUser(currentUserId: string | null | undefined, targetUserId: string): boolean {
  return !!currentUserId && currentUserId === targetUserId;
}

export function isLastAdminDemotionOrRemoval(
  adminCount: number,
  targetRoles: AppRole[],
  nextRole?: AppRole,
): boolean {
  const targetIsAdmin = targetRoles.includes('ADMIN');
  if (!targetIsAdmin) return false;
  if (adminCount > 1) return false;
  return !nextRole || nextRole !== 'ADMIN';
}
