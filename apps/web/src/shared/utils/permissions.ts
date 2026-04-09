import { useAuthStore } from '../stores/auth.store'

/**
 * التحقق من صلاحية معينة للمستخدم الحالي
 * Super Admin يملك كل الصلاحيات تلقائياً
 */
export function hasPermission(permission: string): boolean {
  const user = useAuthStore.getState().user
  if (!user) return false
  if (user.roles.includes('super_admin')) return true
  return user.permissions.includes(permission)
}

/**
 * التحقق من دور معين للمستخدم الحالي
 */
export function hasRole(role: string): boolean {
  const user = useAuthStore.getState().user
  if (!user) return false
  return user.roles.includes(role)
}

/**
 * التحقق من امتلاك أي صلاحية من قائمة صلاحيات
 */
export function hasAnyPermission(permissions: string[]): boolean {
  return permissions.some((p) => hasPermission(p))
}

/**
 * التحقق من امتلاك جميع الصلاحيات في القائمة
 */
export function hasAllPermissions(permissions: string[]): boolean {
  return permissions.every((p) => hasPermission(p))
}

/**
 * التحقق من صيغة الصلاحية: {module}.{resource}.{action}
 */
export function isValidPermissionFormat(permission: string): boolean {
  const parts = permission.split('.')
  return parts.length === 3 && parts.every((p) => p.length > 0)
}
