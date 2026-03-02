export type AppRole = 'ADMIN' | 'OPERADOR' | 'VISUALIZADOR';

export function hasRole(roles: AppRole[], role: AppRole): boolean {
  return roles.includes(role);
}

export function isAdmin(roles: AppRole[]): boolean {
  return hasRole(roles, 'ADMIN');
}

export function canEdit(roles: AppRole[]): boolean {
  return hasRole(roles, 'ADMIN') || hasRole(roles, 'OPERADOR');
}
