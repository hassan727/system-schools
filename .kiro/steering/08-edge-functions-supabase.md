# Supabase Edge Functions - قواعد العمل

## ⚠️ قاعدة أساسية: بدون Docker
```bash
# تشغيل محلي
supabase functions serve --env-file .env.local

# تشغيل function واحدة
supabase functions serve send-notification --env-file .env.local

# نشر
supabase functions deploy send-notification

# تطبيق migrations
supabase db push

# ربط المشروع
supabase link --project-ref YOUR_PROJECT_REF
```

## الـ Functions الموجودة
| Function | المسار | الغرض |
|----------|--------|-------|
| `custom-jwt-claims` | `supabase/functions/custom-jwt-claims/` | إضافة tenant_id والأدوار للـ JWT |
| `audit-log` | `supabase/functions/audit-log/` | تسجيل الأحداث الحساسة |
| `send-notification` | `supabase/functions/send-notification/` | إشعارات داخلية + بريد |
| `generate-invoice` | `supabase/functions/generate-invoice/` | توليد فاتورة PDF |
| `generate-report` | `supabase/functions/generate-report/` | توليد تقارير |
| `check-overdue-invoices` | `supabase/functions/check-overdue-invoices/` | cron يومي للفواتير المتأخرة |

## هيكل كل Function
```typescript
// supabase/functions/{name}/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req: Request) => {
  // 1. التحقق من الـ method
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // 2. إنشاء Supabase client بـ service role
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // 3. منطق العمل
  const payload = await req.json()

  // 4. الرد
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
```

## متغيرات البيئة المطلوبة
```bash
# .env.local
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_xxxx
PDF_SERVICE_URL=https://...

# Vite (frontend)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_APP_DOMAIN=main.com
```

## Supabase Realtime (للإشعارات الفورية)
```typescript
// الاشتراك في إشعارات المستخدم الحالي
const channel = supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`,
  }, (payload) => {
    // إضافة الإشعار للـ store
    notificationStore.addNotification(payload.new)
  })
  .subscribe()
```
