import type { ReactNode } from 'react'
import { usePermissions } from '../../hooks/usePermissions'

interface PermissionGuardProps {
  /** الصلاحية المطلوبة بصيغة {module}.{resource}.{action} */
  permission: string
  /** محتوى بديل عند غياب الصلاحية (اختياري) */
  fallback?: ReactNode
  children: ReactNode
}

/**
 * يعرض children فقط إذا كان المستخدم يملك الصلاحية المطلوبة
 */
export function PermissionGuard({ permission, fallback = null, children }: PermissionGuardProps) {
  const { hasPermission } = usePermissions()

  if (!hasPermission(permission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
