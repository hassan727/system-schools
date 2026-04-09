import { useAuthStore } from '../stores/auth.store'

/**
 * Hook للتحقق من صلاحيات المستخدم الحالي
 */
export function usePermissions() {
  const user = useAuthStore((state) => state.user)

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    if (user.roles.includes('super_admin')) return true
    return user.permissions.includes(permission)
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(hasPermission)
  }

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(hasPermission)
  }

  const hasRole = (role: string): boolean => {
    if (!user) return false
    return user.roles.includes(role)
  }

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(hasRole)
  }

  const isSuperAdmin = (): boolean => hasRole('super_admin')

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    isSuperAdmin,
    permissions: user?.permissions ?? [],
    roles: user?.roles ?? [],
  }
}
