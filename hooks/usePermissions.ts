// web/hooks/usePermissions.ts

import { AdminUser } from '../types';

export interface Permissions {
  canViewDashboard: boolean;
  canViewPositions: boolean;
  canManagePositions: boolean;
  canViewCandidates: boolean;
  canManageCandidates: boolean;
  canViewUsers: boolean;
  canManageUsers: boolean;
  canViewAuditLog: boolean;
  canEditSettings: boolean;
  canManageRoles: boolean;
  canViewSettings: boolean;
}

export const usePermissions = (user: AdminUser | null): Permissions => {
  const permissions = new Set(user?.permissions ?? []);

  return {
    canViewDashboard: permissions.has('dashboard:view'),
    canViewPositions: permissions.has('positions:view'),
    canManagePositions: permissions.has('positions:manage'),
    canViewCandidates: permissions.has('candidates:view'),
    canManageCandidates: permissions.has('candidates:manage'),
    canViewUsers: permissions.has('admins:view'),
    canManageUsers: permissions.has('admins:manage'),
    canViewAuditLog: permissions.has('audit:view'),
    canEditSettings: permissions.has('settings:manage'),
    canManageRoles: permissions.has('roles:manage'),
    canViewSettings: permissions.has('settings:manage') || permissions.has('roles:manage'),
  };
};
