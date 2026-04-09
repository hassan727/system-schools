# قواعد الأمان - Security Rules

## القواعد الإلزامية التي لا تُكسر أبداً

### 1. RLS أولاً دائماً
- لا تكتب كود يعتمد على الفلترة في الـ frontend أو service layer فقط
- RLS هي خط الدفاع الأخير — يجب أن تعمل حتى لو كان الكود مكسوراً
- كل جدول جديد = RLS policy جديدة قبل أي شيء آخر

### 2. JWT Claims المطلوبة
كل JWT يجب أن يحتوي على:
```json
{
  "sub": "user_id",
  "tenant_id": "uuid",
  "tenant_slug": "school-name",
  "roles": ["admin", "teacher"],
  "permissions": ["academic.students.read", "academic.grades.create"]
}
```
- إذا لم يوجد `tenant_id` في JWT → ارفض الطلب (401)

### 3. صيغة الصلاحيات
```
{module}.{resource}.{action}
```
أمثلة صحيحة:
- `academic.students.create`
- `finance.invoices.read`
- `hr.salaries.approve`
- `system.audit_logs.read`

### 4. التحقق من المدخلات
- استخدم **Zod** دائماً للتحقق من المدخلات قبل أي عملية
- لا تثق بأي بيانات قادمة من الـ frontend
- تحقق من MIME type الفعلي للملفات (ليس الامتداد فقط)

### 5. Audit Log إلزامي
العمليات التالية يجب أن تُسجَّل في `audit_logs`:
- إنشاء/تعديل/حذف أي سجل حساس
- تسجيل الدخول والخروج
- محاولات الوصول المرفوضة (403)
- تغيير الصلاحيات والأدوار

### 6. Rate Limiting
- 100 طلب/دقيقة لكل مستخدم
- 5 محاولات دخول فاشلة → قفل الحساب 15 دقيقة

### 7. Storage Security
- الملفات منظمة: `{tenant_id}/{resource_type}/{resource_id}/{filename}`
- استخدم Signed URLs للملفات الخاصة (صالحة لساعة فقط)
- الحجم الأقصى: صور 5MB، مستندات 20MB

### 8. HTTPS إلزامي
- ارفض أي طلب HTTP
- Security Headers في vercel.json: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
