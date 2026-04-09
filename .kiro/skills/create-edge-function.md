# Skill: إنشاء Edge Function جديدة

## متى تستخدم هذا الـ Skill؟
عند الحاجة لمنطق server-side لا يمكن تنفيذه في الـ frontend.

## إنشاء Function جديدة
```bash
# إنشاء المجلد والملف
mkdir supabase/functions/{function-name}
touch supabase/functions/{function-name}/index.ts
```

## القالب الكامل
```typescript
// supabase/functions/{function-name}/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. التحقق من الـ Authorization
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. إنشاء Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 3. التحقق من المستخدم
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. قراءة الـ payload
    const payload = await req.json()

    // 5. منطق العمل هنا
    // ...

    // 6. الرد بنجاح
    return new Response(
      JSON.stringify({ success: true, data: {} }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

## تشغيل محلياً (بدون Docker)
```bash
# تشغيل function واحدة
supabase functions serve {function-name} --env-file .env.local

# تشغيل جميع الـ functions
supabase functions serve --env-file .env.local

# اختبار بـ curl
curl -X POST http://localhost:54321/functions/v1/{function-name} \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

## نشر للإنتاج
```bash
supabase functions deploy {function-name}

# نشر جميع الـ functions
supabase functions deploy
```

## إضافة Secrets
```bash
supabase secrets set MY_SECRET=value
supabase secrets list
```

## استدعاء من الـ Frontend
```typescript
const { data, error } = await supabase.functions.invoke('{function-name}', {
  body: { key: 'value' },
})
```
