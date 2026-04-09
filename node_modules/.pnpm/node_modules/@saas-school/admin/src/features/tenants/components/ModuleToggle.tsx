import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AVAILABLE_MODULES, tenantService } from '../services/tenant.service'
import { Button } from '../../../shared/components/ui/Button'

interface ModuleToggleProps {
  tenantId: string
  enabledModules: string[]
  onClose: () => void
}

export function ModuleToggle({ tenantId, enabledModules, onClose }: ModuleToggleProps) {
  const { i18n } = useTranslation('common')
  const isAr = i18n.language === 'ar'
  const qc = useQueryClient()
  const [selected, setSelected] = useState<string[]>(enabledModules)

  const mutation = useMutation({
    mutationFn: () => tenantService.updateModules(tenantId, selected),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenants'] })
      onClose()
    },
  })

  const toggle = (key: string) =>
    setSelected((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key])

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-2">
        {AVAILABLE_MODULES.map((mod) => {
          const active = selected.includes(mod.key)
          return (
            <button
              key={mod.key}
              onClick={() => toggle(mod.key)}
              className={[
                'flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition',
                active
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600',
              ].join(' ')}
            >
              <span>{isAr ? mod.labelAr : mod.labelEn}</span>
              <span className={[
                'w-5 h-5 rounded-full border-2 flex items-center justify-center transition',
                active ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600',
              ].join(' ')}>
                {active && <span className="w-2 h-2 rounded-full bg-white" />}
              </span>
            </button>
          )
        })}
      </div>

      {mutation.isError && (
        <p className="text-sm text-red-500">{(mutation.error as Error).message}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={onClose}>إلغاء</Button>
        <Button size="sm" loading={mutation.isPending} onClick={() => mutation.mutate()}>حفظ</Button>
      </div>
    </div>
  )
}
