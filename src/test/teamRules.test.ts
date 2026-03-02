import { describe, expect, it } from 'vitest';
import { isLastAdminDemotionOrRemoval, isSameUser, normalizeInviteEmail } from '@/lib/teamRules';

describe('team rules', () => {
  it('normalizes invite email', () => {
    expect(normalizeInviteEmail('  Foo.Bar@Example.COM  ')).toBe('foo.bar@example.com');
  });

  it('checks same user safely', () => {
    expect(isSameUser('u1', 'u1')).toBe(true);
    expect(isSameUser('u1', 'u2')).toBe(false);
    expect(isSameUser(null, 'u2')).toBe(false);
  });

  it('detects last admin demotion/removal', () => {
    expect(isLastAdminDemotionOrRemoval(1, ['ADMIN'])).toBe(true);
    expect(isLastAdminDemotionOrRemoval(1, ['ADMIN'], 'OPERADOR')).toBe(true);
    expect(isLastAdminDemotionOrRemoval(1, ['ADMIN'], 'ADMIN')).toBe(false);
    expect(isLastAdminDemotionOrRemoval(2, ['ADMIN'], 'OPERADOR')).toBe(false);
    expect(isLastAdminDemotionOrRemoval(1, ['OPERADOR'], 'VISUALIZADOR')).toBe(false);
  });
});
