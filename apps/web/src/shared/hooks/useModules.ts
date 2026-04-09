import { useTenantStore, type TenantModules } from '../stores/tenant.store'

/**
 * Hook للتحقق من الوحدات المفعّلة للمستأجر الحالي
 */
export function useModules() {
  const { tenantConfig, isModuleEnabled } = useTenantStore()

  const modules = tenantConfig?.modulesEnabled ?? {
    academic: false,
    hr: false,
    finance: false,
    scheduling: false,
    reports: false,
  }

  const enabledModules = (Object.keys(modules) as Array<keyof TenantModules>).filter(
    (key) => modules[key] === true
  )

  return {
    isModuleEnabled,
    modules,
    enabledModules,
    hasAnyModule: enabledModules.length > 0,
  }
}
