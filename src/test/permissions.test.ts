import { describe, expect, it } from 'vitest';
import { canEdit, hasRole, isAdmin, type AppRole } from '@/lib/permissions';

describe('permissions helpers', () => {
  it('checks role presence', () => {
    const roles: AppRole[] = ['OPERADOR'];
    expect(hasRole(roles, 'OPERADOR')).toBe(true);
    expect(hasRole(roles, 'ADMIN')).toBe(false);
  });

  it('detects admin role', () => {
    expect(isAdmin(['ADMIN'])).toBe(true);
    expect(isAdmin(['OPERADOR'])).toBe(false);
  });

  it('allows edit for admin and operador only', () => {
    expect(canEdit(['ADMIN'])).toBe(true);
    expect(canEdit(['OPERADOR'])).toBe(true);
    expect(canEdit(['VISUALIZADOR'])).toBe(false);
  });
});
