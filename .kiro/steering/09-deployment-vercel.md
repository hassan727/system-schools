# النشر على Vercel - Deployment Guide

## هيكل النشر
```
Frontend (apps/web)     → Vercel
Super Admin (apps/admin) → Vercel (مشروع منفصل أو subdomain)
Backend                 → Supabase (managed)
```

## Subdomain Strategy
```
main.com              → Super Admin Panel
*.main.com            → School Tenants
school-a.main.com     → مدرسة A
school-b.main.com     → مدرسة B
```

## vercel.json الإلزامي
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" }
      ]
    }
  ]
}
```

## DNS Configuration
```
A     main.com          → 76.76.21.21
CNAME *.main.com        → cname.vercel-dns.com
```

## Environment Variables في Vercel
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_APP_DOMAIN=main.com
```

## Middleware لاستخراج Subdomain
```typescript
// middleware.ts في root المشروع
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const subdomain = hostname.split('.')[0]
  // إضافة subdomain كـ header لكل request
  const response = NextResponse.next()
  response.headers.set('x-tenant-subdomain', subdomain)
  return response
}
```

## Supabase Production Checklist
- [ ] تطبيق جميع migrations: `supabase db push`
- [ ] نشر جميع Edge Functions: `supabase functions deploy`
- [ ] تفعيل Custom JWT Hook في Dashboard
- [ ] إعداد Storage buckets: avatars, documents, logos
- [ ] تفعيل Realtime على جدول notifications
- [ ] إعداد SMTP للبريد الإلكتروني
