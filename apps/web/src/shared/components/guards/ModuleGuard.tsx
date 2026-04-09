import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTenantStore, type TenantModules } from '../../stores/tenant.store'

interface ModuleGuardProps {
  /** اسم الوحدة المطلوبة */
  module: keyof TenantModules
  /** محتوى بديل عند عدم تفعيل الوحدة (اختياري) */
  fallback?: ReactNode
  /** إعادة التوجيه لصفحة الترقية بدلاً من عرض fallback */
  redirectToUpgrade?: boolean
  children: ReactNode
}

/**
 * يعرض children فقط إذا كانت الوحدة مفعّلة للمستأجر الحالي
 * إذا لم تكن مفعّلة → يعرض fallback أو يوجه لصفحة الترقية
 */
export function ModuleGuard({
  module,
  fallback = null,
  redirectToUpgrade = false,
  children,
}: ModuleGuardProps) {
  const { isModuleEnabled } = useTenantStore()
  const navigate = useNavigate()

  if (!isModuleEnabled(module)) {
    if (redirectToUpgrade) {
      navigate(`/upgrade?module=${module}`, { replace: true })
      return null
    }
    return <>{fallback}</>
  }

  return <>{children}</>
}
