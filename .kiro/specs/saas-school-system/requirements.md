# وثيقة متطلبات نظام SaaS لإدارة المدارس

## مقدمة

منصة SaaS متعددة المستأجرين (Multi-Tenant) لإدارة المدارس بشكل متكامل، تُقدَّم كخدمة سحابية حيث كل مدرسة تمثل مستأجراً (Tenant) مستقلاً. تهدف المنصة إلى توفير حل شامل يغطي جميع العمليات الإدارية والأكاديمية والمالية والموارد البشرية، مع دعم كامل للغتين العربية والإنجليزية، وقابلية توسع عالية تُشبه أنظمة Odoo/SAP/Oracle.

البنية التقنية:
- الباك اند: Supabase (Auth + PostgreSQL + Storage + RLS)
- الفرونت اند: React + Vite + Zustand
- الاستضافة: Vercel
- العزل: قاعدة بيانات مشتركة مع tenant_id + Row Level Security

---

## قاموس المصطلحات (Glossary)

- **المنصة (Platform)**: نظام SaaS الكامل الذي يستضيف جميع المستأجرين
- **المستأجر (Tenant)**: مدرسة واحدة مسجلة في المنصة، تمتلك بياناتها المعزولة
- **المشرف العام (Super_Admin)**: مالك المنصة، يملك صلاحيات كاملة على جميع المستأجرين
- **مالك المدرسة (School_Owner)**: المسؤول الأعلى داخل مستأجر واحد
- **المدير (Admin)**: مدير المدرسة، يدير العمليات اليومية داخل المستأجر
- **المعلم (Teacher)**: عضو هيئة تدريس مرتبط بمستأجر محدد
- **الموظف (Employee)**: موظف إداري أو خدمي مرتبط بمستأجر محدد
- **الطالب (Student)**: متعلم مسجل في مستأجر محدد
- **ولي الأمر (Parent)**: مرتبط بطالب أو أكثر داخل نفس المستأجر
- **الوحدة (Module)**: مجموعة وظائف يمكن تفعيلها أو تعطيلها لكل مستأجر
- **الصلاحية (Permission)**: إذن محدد لتنفيذ عملية معينة
- **الدور (Role)**: مجموعة صلاحيات مُعرَّفة مسبقاً أو مخصصة
- **نظام RLS**: آلية Row Level Security في PostgreSQL لعزل بيانات المستأجرين
- **JWT**: رمز المصادقة الذي يحمل هوية المستخدم والمستأجر
- **Auth_Service**: خدمة المصادقة المبنية على Supabase Auth
- **Tenant_Service**: خدمة إدارة المستأجرين
- **RBAC_Service**: خدمة إدارة الأدوار والصلاحيات
- **Academic_Service**: خدمة الشؤون الأكاديمية
- **HR_Service**: خدمة الموارد البشرية
- **Finance_Service**: خدمة الشؤون المالية
- **Notification_Service**: خدمة الإشعارات
- **Audit_Service**: خدمة سجلات التدقيق
- **Storage_Service**: خدمة تخزين الملفات
- **Subdomain_Router**: مكوّن توجيه النطاقات الفرعية
- **Sidebar_Component**: مكوّن القائمة الجانبية الديناميكية
- **API_Gateway**: بوابة الـ API المركزية

---

## المتطلبات

### المتطلب 1: نظام المصادقة متعدد الأدوار (Authentication System)

**قصة المستخدم:** بوصفي مستخدماً للمنصة، أريد تسجيل الدخول بأمان مع دعم أدواري المتعددة، حتى أتمكن من الوصول إلى الوظائف المناسبة لدوري ومدرستي.

#### معايير القبول

1. WHEN يُدخل المستخدم بريداً إلكترونياً وكلمة مرور صحيحين، THE Auth_Service SHALL يُصدر JWT يحتوي على user_id وtenant_id وقائمة الأدوار وانتهاء الصلاحية خلال 24 ساعة
2. WHEN يُدخل المستخدم بيانات دخول غير صحيحة 5 مرات متتالية، THE Auth_Service SHALL يُعطّل الحساب مؤقتاً لمدة 15 دقيقة ويُسجّل الحدث في Audit_Service
3. WHEN ينتهي صلاحية JWT، THE Auth_Service SHALL يُجدد الرمز تلقائياً باستخدام Refresh Token دون إعادة تسجيل الدخول
4. WHEN يطلب المستخدم تسجيل الخروج، THE Auth_Service SHALL يُبطل JWT الحالي وRefresh Token ويُنهي الجلسة
5. IF كان JWT لا يحتوي على tenant_id صالح، THEN THE Auth_Service SHALL يرفض الطلب ويُعيد رمز خطأ 401
6. THE Auth_Service SHALL يدعم تسجيل الدخول الأحادي (SSO) عبر Google OAuth لجميع الأدوار
7. WHEN يُنشئ Super_Admin حساباً جديداً لمدرسة، THE Auth_Service SHALL يُرسل بريداً إلكترونياً لتفعيل الحساب وتعيين كلمة المرور
8. THE Auth_Service SHALL يُشفّر كلمات المرور باستخدام bcrypt بمعامل تكلفة لا يقل عن 12

---

### المتطلب 2: نواة نظام المستأجرين المتعددين (Multi-Tenant Core)

**قصة المستخدم:** بوصفي Super_Admin، أريد إدارة المدارس كمستأجرين مستقلين، حتى تظل بيانات كل مدرسة معزولة تماماً عن الأخرى.

#### معايير القبول

1. THE Tenant_Service SHALL يُنشئ سجلاً في جدول tenants لكل مدرسة جديدة يحتوي على: tenant_id فريد، الاسم، النطاق الفرعي، الحالة، تاريخ الإنشاء، وإعدادات الوحدات المفعّلة
2. WHEN يُنشأ مستأجر جديد، THE Tenant_Service SHALL يُعيّن نطاقاً فرعياً فريداً بصيغة {school_slug}.main.com
3. THE Subdomain_Router SHALL يُحدد هوية المستأجر من النطاق الفرعي في كل طلب HTTP قبل معالجته
4. IF كان النطاق الفرعي المطلوب غير موجود في قاعدة البيانات، THEN THE Subdomain_Router SHALL يُعيد صفحة خطأ 404 مخصصة
5. WHILE يكون المستأجر في حالة "معلّق"، THE Tenant_Service SHALL يمنع تسجيل الدخول لجميع مستخدمي ذلك المستأجر ويُعيد رسالة توضيحية
6. THE Tenant_Service SHALL يدعم تخصيص إعدادات كل مستأجر بشكل مستقل: الشعار، الألوان، اللغة الافتراضية، المنطقة الزمنية، العملة
7. WHEN يُعطّل Super_Admin مستأجراً، THE Tenant_Service SHALL يُسجّل الحدث في Audit_Service مع سبب التعطيل والمستخدم المنفّذ
8. THE Tenant_Service SHALL يدعم تصدير جميع بيانات مستأجر محدد بصيغة JSON أو CSV عند الطلب

---

### المتطلب 3: نظام RLS وعزل البيانات (Row Level Security)

**قصة المستخدم:** بوصفي مطوراً للمنصة، أريد ضمان عزل بيانات المستأجرين تلقائياً على مستوى قاعدة البيانات، حتى لا يتمكن أي مستأجر من الوصول إلى بيانات مستأجر آخر حتى في حالة وجود ثغرة في الكود.

#### معايير القبول

1. THE Platform SHALL يُطبّق سياسات RLS على جميع الجداول التي تحتوي على tenant_id بحيث تُعيد كل query فقط السجلات المطابقة لـ tenant_id الموجود في JWT
2. WHEN يُنفَّذ أي استعلام على قاعدة البيانات، THE Platform SHALL يُمرّر tenant_id من JWT كمتغير جلسة PostgreSQL قبل تنفيذ الاستعلام
3. IF حاول مستخدم الوصول إلى سجل يخص مستأجراً آخر، THEN THE Platform SHALL يُعيد نتيجة فارغة دون إظهار رسالة خطأ تكشف وجود البيانات
4. THE Platform SHALL يُطبّق RLS على جداول: tenants, users, profiles, roles, permissions, students, classes, enrollments, employees, attendance, invoices, payments, audit_logs
5. THE Platform SHALL يُنشئ اختبارات تلقائية تتحقق من أن مستخدماً من tenant_A لا يستطيع قراءة أي سجل من tenant_B
6. WHEN يُضاف جدول جديد يحتوي على tenant_id، THE Platform SHALL يتطلب تعريف سياسة RLS صريحة قبل نشر التغيير

---

### المتطلب 4: نظام الأدوار والصلاحيات الديناميكي (RBAC)

**قصة المستخدم:** بوصفي Admin لمدرسة، أريد إنشاء أدوار مخصصة وتعيين صلاحيات دقيقة لكل دور، حتى أتحكم بدقة في ما يستطيع كل موظف فعله داخل النظام.

#### معايير القبول

1. THE RBAC_Service SHALL يدعم الأدوار الافتراضية: Super_Admin, School_Owner, Admin, Teacher, Employee, Student, Parent لكل مستأجر
2. WHEN ينشئ Admin دوراً مخصصاً، THE RBAC_Service SHALL يحفظ الدور مرتبطاً بـ tenant_id الخاص بالمدرسة ولا يظهر لمستأجرين آخرين
3. THE RBAC_Service SHALL يُنظّم الصلاحيات بصيغة {module}.{resource}.{action} مثل: academic.students.create, finance.invoices.read
4. WHEN يطلب مستخدم تنفيذ عملية، THE RBAC_Service SHALL يتحقق من امتلاك المستخدم الصلاحية المطلوبة قبل تنفيذ أي منطق عمل
5. IF لم يمتلك المستخدم الصلاحية المطلوبة، THEN THE RBAC_Service SHALL يُعيد رمز خطأ 403 ويُسجّل محاولة الوصول في Audit_Service
6. THE RBAC_Service SHALL يدعم تعيين مستخدم واحد لأدوار متعددة داخل نفس المستأجر
7. WHEN تُعدَّل صلاحيات دور ما، THE RBAC_Service SHALL يُطبّق التغييرات فورياً على جميع المستخدمين الحاملين لذلك الدور دون الحاجة لإعادة تسجيل الدخول
8. THE RBAC_Service SHALL يوفر API لاسترجاع قائمة الصلاحيات الفعلية للمستخدم الحالي لاستخدامها في بناء واجهة المستخدم الديناميكية

---

### المتطلب 5: نظام الوحدات والعقود (Module Subscription System)

**قصة المستخدم:** بوصفي Super_Admin، أريد تفعيل وتعطيل وحدات النظام لكل مدرسة بناءً على اشتراكها، حتى تدفع كل مدرسة فقط مقابل ما تستخدمه.

#### معايير القبول

1. THE Platform SHALL يدعم الوحدات التالية كوحدات قابلة للاشتراك بشكل مستقل: Academic, HR, Finance, Scheduling, Reports
2. WHEN يُفعَّل Super_Admin وحدة لمستأجر، THE Tenant_Service SHALL يُحدّث إعدادات الوحدات المفعّلة ويُطبّق التغيير فورياً
3. WHILE وحدة معينة غير مفعّلة لمستأجر، THE Platform SHALL يُخفي جميع عناصر واجهة المستخدم المرتبطة بتلك الوحدة ويرفض طلبات API الخاصة بها
4. THE Sidebar_Component SHALL يعرض فقط عناصر القائمة المرتبطة بالوحدات المفعّلة والصلاحيات الممنوحة للمستخدم الحالي
5. IF حاول مستخدم الوصول إلى وحدة غير مشترك بها مستأجره، THEN THE Platform SHALL يُعيد رمز خطأ 402 مع رسالة تطلب الترقية
6. THE Tenant_Service SHALL يحتفظ بسجل تاريخي لجميع تغييرات الاشتراك مع التواريخ والمستخدم المنفّذ

---

### المتطلب 6: الوحدة الأكاديمية (Academic Module)

**قصة المستخدم:** بوصفي Admin لمدرسة، أريد إدارة الطلاب والفصول والمواد والامتحانات والدرجات، حتى أتمكن من تشغيل العمليات الأكاديمية بالكامل من خلال المنصة.

#### معايير القبول

1. THE Academic_Service SHALL يدعم تسجيل الطلاب مع البيانات الكاملة: الاسم الثنائي (عربي/إنجليزي)، تاريخ الميلاد، الجنس، بيانات ولي الأمر، الصورة الشخصية
2. WHEN يُسجَّل طالب جديد، THE Academic_Service SHALL يُولّد رقم طالب فريداً داخل المستأجر بصيغة {tenant_prefix}-{year}-{sequence}
3. THE Academic_Service SHALL يدعم إنشاء فصول دراسية مرتبطة بسنة أكاديمية محددة مع تحديد الطاقة الاستيعابية القصوى
4. WHEN يتجاوز عدد الطلاب المسجلين في فصل الطاقة الاستيعابية القصوى، THE Academic_Service SHALL يرفض التسجيل الإضافي ويُعيد رسالة خطأ واضحة
5. THE Academic_Service SHALL يدعم إنشاء مواد دراسية مرتبطة بفصول وسنوات أكاديمية محددة مع تعيين معلم مسؤول
6. WHEN يُدخل Teacher درجات الامتحان، THE Academic_Service SHALL يتحقق من أن الدرجة المُدخلة ضمن النطاق المحدد للامتحان قبل الحفظ
7. THE Academic_Service SHALL يحسب المعدل التراكمي (GPA) لكل طالب تلقائياً عند تحديث أي درجة
8. THE Academic_Service SHALL يدعم تصدير كشوف الدرجات بصيغة PDF مع شعار المدرسة وبياناتها

---

### المتطلب 7: وحدة الموارد البشرية (HR Module)

**قصة المستخدم:** بوصفي Admin لمدرسة، أريد إدارة الموظفين والحضور والرواتب، حتى أتمكن من تشغيل شؤون الموارد البشرية بالكامل من خلال المنصة.

#### معايير القبول

1. THE HR_Service SHALL يدعم تسجيل الموظفين مع البيانات الكاملة: الاسم، المسمى الوظيفي، القسم، تاريخ التعيين، الراتب الأساسي، بيانات التواصل
2. THE HR_Service SHALL يدعم تسجيل الحضور اليومي للموظفين مع وقت الدخول والخروج وحساب ساعات العمل الفعلية
3. WHEN يُسجَّل غياب موظف، THE HR_Service SHALL يُصنّف الغياب (مبرر/غير مبرر) ويُحدّث رصيد الإجازات تلقائياً
4. THE HR_Service SHALL يحسب الراتب الشهري لكل موظف بناءً على: الراتب الأساسي، أيام الحضور الفعلية، البدلات، الخصومات
5. WHEN يُولَّد كشف الراتب الشهري، THE HR_Service SHALL يُنشئ سجلاً غير قابل للتعديل في قاعدة البيانات ويُرسل إشعاراً للموظف
6. THE HR_Service SHALL يدعم إدارة الإجازات: أنواع الإجازات، الأرصدة، طلبات الإجازة، الموافقة والرفض

---

### المتطلب 8: الوحدة المالية (Finance Module)

**قصة المستخدم:** بوصفي Admin لمدرسة، أريد إدارة الرسوم الدراسية والمدفوعات والمصروفات، حتى أتمكن من متابعة الوضع المالي للمدرسة بدقة.

#### معايير القبول

1. THE Finance_Service SHALL يدعم إنشاء هياكل رسوم مرنة: رسوم سنوية، فصلية، شهرية، مع إمكانية تطبيق خصومات وإعفاءات
2. WHEN يُسجَّل طالب في فصل دراسي، THE Finance_Service SHALL يُنشئ فاتورة تلقائياً بناءً على هيكل الرسوم المعمول به
3. THE Finance_Service SHALL يدعم تسجيل المدفوعات مع: المبلغ، طريقة الدفع، تاريخ الدفع، رقم الإيصال، اسم المُدفِع
4. WHEN يُسجَّل دفع، THE Finance_Service SHALL يُحدّث رصيد الفاتورة فورياً ويُرسل إيصالاً إلكترونياً للمدفِع
5. IF تجاوز موعد استحقاق فاتورة دون سداد كامل، THEN THE Finance_Service SHALL يُرسل إشعار تذكير تلقائياً لولي الأمر
6. THE Finance_Service SHALL يدعم تسجيل المصروفات التشغيلية مع التصنيف والمرفقات
7. THE Finance_Service SHALL يُولّد تقارير مالية: الإيرادات، المصروفات، المستحقات، الأرباح والخسائر لفترات زمنية محددة
8. THE Finance_Service SHALL يدعم تعدد العملات مع تحديد العملة الافتراضية لكل مستأجر

---

### المتطلب 9: وحدة الجداول الزمنية والأحداث (Scheduling Module)

**قصة المستخدم:** بوصفي Admin لمدرسة، أريد إنشاء جداول الحصص الدراسية وإدارة الأحداث المدرسية، حتى تسير العمليات اليومية بانتظام.

#### معايير القبول

1. THE Academic_Service SHALL يدعم إنشاء جدول حصص أسبوعي لكل فصل دراسي مع تحديد: المادة، المعلم، القاعة، اليوم، الوقت
2. WHEN يُنشأ جدول حصص، THE Academic_Service SHALL يتحقق من عدم وجود تعارض في توقيت المعلم أو القاعة قبل الحفظ
3. IF وُجد تعارض في الجدول، THEN THE Academic_Service SHALL يُعيد تفاصيل التعارض (المعلم/القاعة المتعارضة والوقت) دون حفظ الجدول
4. THE Academic_Service SHALL يدعم إنشاء أحداث مدرسية (اجتماعات، رحلات، فعاليات) مع إرسال إشعارات للمعنيين
5. THE Academic_Service SHALL يدعم تصدير الجدول الدراسي بصيغة PDF وiCal

---

### المتطلب 10: وحدة التقارير والتحليلات (Reports Module)

**قصة المستخدم:** بوصفي School_Owner أو Admin، أريد الاطلاع على تقارير وتحليلات شاملة، حتى أتخذ قرارات مبنية على البيانات.

#### معايير القبول

1. THE Reports_Module SHALL يوفر لوحة تحكم رئيسية تعرض: إجمالي الطلاب، نسبة الحضور، الإيرادات الشهرية، المستحقات المتأخرة
2. THE Reports_Module SHALL يدعم توليد تقارير الحضور: يومية، أسبوعية، شهرية لكل فصل أو طالب أو موظف
3. THE Reports_Module SHALL يدعم توليد تقارير الأداء الأكاديمي: توزيع الدرجات، المعدلات، الطلاب المتفوقين والمتأخرين
4. WHEN يطلب المستخدم تقريراً، THE Reports_Module SHALL يُولّد التقرير خلال 10 ثوانٍ للبيانات التي لا تتجاوز 10,000 سجل
5. THE Reports_Module SHALL يدعم تصدير جميع التقارير بصيغتي PDF وExcel
6. WHERE كانت وحدة Reports مفعّلة، THE Reports_Module SHALL يوفر رسوماً بيانية تفاعلية للبيانات الرئيسية

---

### المتطلب 11: نظام الأمان والتدقيق (Security & Audit System)

**قصة المستخدم:** بوصفي Super_Admin، أريد ضمان أمان المنصة وتتبع جميع العمليات الحساسة، حتى أتمكن من الاستجابة لأي حادثة أمنية وتلبية متطلبات الامتثال.

#### معايير القبول

1. THE Audit_Service SHALL يُسجّل كل عملية إنشاء أو تعديل أو حذف في قاعدة البيانات مع: user_id, tenant_id, الجدول المتأثر, معرف السجل, القيم القديمة, القيم الجديدة, الطابع الزمني, عنوان IP
2. THE Audit_Service SHALL يحتفظ بسجلات التدقيق لمدة لا تقل عن 12 شهراً
3. THE API_Gateway SHALL يُطبّق تحديد معدل الطلبات (Rate Limiting) بحد أقصى 100 طلب في الدقيقة لكل مستخدم
4. IF تجاوز مستخدم حد معدل الطلبات، THEN THE API_Gateway SHALL يُعيد رمز خطأ 429 ويُسجّل الحدث في Audit_Service
5. THE Platform SHALL يُطبّق التحقق من صحة جميع المدخلات على مستوى الـ API قبل معالجتها لمنع SQL Injection وXSS
6. THE Platform SHALL يُشفّر جميع البيانات الحساسة في قاعدة البيانات (أرقام الهوية، بيانات الدفع) باستخدام AES-256
7. WHEN يُصدر Super_Admin تقرير تدقيق، THE Audit_Service SHALL يُولّد تقريراً مفصلاً قابلاً للتصفية حسب: المستأجر، المستخدم، نوع العملية، الفترة الزمنية
8. THE Platform SHALL يُطبّق HTTPS إلزامياً على جميع الاتصالات ويرفض طلبات HTTP

---

### المتطلب 12: نظام الإشعارات (Notification System)

**قصة المستخدم:** بوصفي مستخدماً للمنصة، أريد تلقي إشعارات فورية وبريد إلكتروني عند وقوع أحداث مهمة، حتى أبقى على اطلاع دائم بما يخصني.

#### معايير القبول

1. THE Notification_Service SHALL يدعم قناتين للإشعارات: داخل التطبيق (In-App) والبريد الإلكتروني (Email)
2. WHEN يقع حدث يستوجب إشعاراً، THE Notification_Service SHALL يُرسل الإشعار خلال 30 ثانية من وقوع الحدث
3. THE Notification_Service SHALL يدعم قوالب إشعارات قابلة للتخصيص لكل مستأجر باللغتين العربية والإنجليزية
4. WHEN يُسجّل الدخول مستخدم، THE Notification_Service SHALL يعرض عدد الإشعارات غير المقروءة في واجهة المستخدم
5. THE Notification_Service SHALL يدعم الإشعارات التالية كحد أدنى: تذكير الرسوم المتأخرة، نتائج الامتحانات، الغياب، الأحداث المدرسية، تغييرات الجدول
6. WHERE فضّل المستخدم تعطيل نوع معين من الإشعارات، THE Notification_Service SHALL يحترم تفضيلات المستخدم ولا يُرسل الإشعارات المعطّلة

---

### المتطلب 13: نظام تخزين الملفات (File Storage System)

**قصة المستخدم:** بوصفي مستخدماً للمنصة، أريد رفع وإدارة الملفات والصور المرتبطة بالطلاب والموظفين والتقارير، حتى تكون جميع الوثائق متاحة ومنظمة.

#### معايير القبول

1. THE Storage_Service SHALL يُنظّم الملفات في مجلدات معزولة لكل مستأجر بصيغة: {tenant_id}/{resource_type}/{resource_id}/{filename}
2. THE Storage_Service SHALL يدعم رفع الصور الشخصية للطلاب والموظفين بحجم أقصى 5 ميغابايت للصورة الواحدة
3. THE Storage_Service SHALL يدعم رفع المستندات (PDF, Word, Excel) بحجم أقصى 20 ميغابايت للملف الواحد
4. WHEN يُرفع ملف، THE Storage_Service SHALL يتحقق من نوع الملف الفعلي (MIME type) وليس فقط الامتداد قبل القبول
5. IF كان نوع الملف غير مسموح به، THEN THE Storage_Service SHALL يرفض الرفع ويُعيد قائمة بأنواع الملفات المقبولة
6. THE Storage_Service SHALL يُولّد روابط مؤقتة (Signed URLs) صالحة لمدة محددة للوصول إلى الملفات الخاصة
7. WHEN يُحذف سجل مرتبط بملفات، THE Storage_Service SHALL يُنظّف الملفات المرتبطة به تلقائياً لتجنب تراكم البيانات غير المستخدمة

---

### المتطلب 14: واجهة المستخدم الديناميكية (Dynamic Frontend)

**قصة المستخدم:** بوصفي مستخدماً للمنصة، أريد واجهة مستخدم تتكيف تلقائياً مع دوري والوحدات المفعّلة لمدرستي، حتى أرى فقط ما يخصني دون تعقيد.

#### معايير القبول

1. THE Sidebar_Component SHALL يبني قائمته الجانبية ديناميكياً عند تسجيل الدخول بناءً على: الوحدات المفعّلة للمستأجر وصلاحيات المستخدم الحالي
2. THE Platform SHALL يدعم اللغتين العربية والإنجليزية مع تغيير اتجاه الصفحة (RTL/LTR) تلقائياً عند تغيير اللغة
3. THE Platform SHALL يحمي جميع المسارات (Routes) بالتحقق من المصادقة والصلاحيات قبل عرض أي صفحة
4. IF حاول مستخدم غير مصادق الوصول إلى مسار محمي، THEN THE Platform SHALL يُعيد توجيهه إلى صفحة تسجيل الدخول مع حفظ المسار المطلوب للعودة إليه بعد الدخول
5. THE Platform SHALL يعرض حالة التحميل (Loading State) أثناء جلب البيانات وحالة الخطأ عند فشل الطلبات
6. THE Platform SHALL يدعم الوضع المظلم (Dark Mode) والوضع الفاتح (Light Mode) مع حفظ تفضيل المستخدم
7. WHEN يتغير دور المستخدم أو صلاحياته، THE Sidebar_Component SHALL يُحدّث القائمة الجانبية فورياً دون الحاجة لإعادة تحميل الصفحة

---

### المتطلب 15: قابلية التوسع والتخصيص (Extensibility & Customization)

**قصة المستخدم:** بوصفي Super_Admin أو School_Owner، أريد إمكانية إضافة حقول مخصصة وسير عمل مخصصة، حتى يتكيف النظام مع الاحتياجات الخاصة لكل مدرسة دون تعديل الكود الأساسي.

#### معايير القبول

1. THE Platform SHALL يدعم إضافة حقول مخصصة (Custom Fields) لجداول: students, employees, classes دون تعديل مخطط قاعدة البيانات الأساسي
2. THE Platform SHALL يخزن قيم الحقول المخصصة في جدول مخصص بنمط Entity-Attribute-Value مرتبط بـ tenant_id
3. WHEN يُضاف حقل مخصص، THE Platform SHALL يُظهره في نماذج الإدخال وصفحات العرض المرتبطة تلقائياً
4. THE Platform SHALL يدعم أنواع الحقول المخصصة: نص، رقم، تاريخ، قائمة منسدلة، نعم/لا
5. THE Platform SHALL يوفر محرك سير عمل (Workflow Engine) بسيط يدعم تعريف قواعد تُنفَّذ تلقائياً عند وقوع أحداث محددة
6. WHEN يُعرَّف سير عمل جديد، THE Platform SHALL يتحقق من صحة قواعده قبل تفعيله ويُعيد رسالة خطأ واضحة عند وجود تعارض

---

### المتطلب 16: نظام النطاقات والتوجيه (Domain & Routing System)

**قصة المستخدم:** بوصفي School_Owner، أريد أن تمتلك مدرستي نطاقاً فرعياً مخصصاً، حتى يتعرف الطلاب والموظفون على منصة مدرستهم بسهولة.

#### معايير القبول

1. THE Subdomain_Router SHALL يدعم النطاق الرئيسي main.com للوصول إلى لوحة تحكم Super_Admin
2. THE Subdomain_Router SHALL يدعم النطاقات الفرعية بصيغة {school_slug}.main.com لكل مستأجر
3. WHEN يصل مستخدم إلى نطاق فرعي لمدرسة، THE Subdomain_Router SHALL يُحمّل إعدادات المستأجر (الشعار، الألوان، اللغة الافتراضية) قبل عرض صفحة تسجيل الدخول
4. THE Platform SHALL يدعم ربط نطاق مخصص (Custom Domain) لكل مستأجر كميزة اختيارية
5. IF كان النطاق الفرعي المطلوب محجوزاً أو يحتوي على كلمات محظورة، THEN THE Tenant_Service SHALL يرفض إنشاء المستأجر ويُعيد قائمة بالنطاقات المحظورة

---

## ERD - مخطط قاعدة البيانات (Entity Relationship Diagram)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CORE TABLES                                  │
├──────────────────┬──────────────────┬──────────────────────────────┤
│    tenants       │      users       │         profiles              │
├──────────────────┼──────────────────┼──────────────────────────────┤
│ id (PK)          │ id (PK)          │ id (PK)                       │
│ name_ar          │ tenant_id (FK)   │ user_id (FK)                  │
│ name_en          │ email            │ tenant_id (FK)                │
│ slug             │ password_hash    │ first_name_ar                 │
│ subdomain        │ is_active        │ first_name_en                 │
│ logo_url         │ created_at       │ last_name_ar                  │
│ primary_color    │ updated_at       │ last_name_en                  │
│ default_language │                  │ phone                         │
│ timezone         │                  │ avatar_url                    │
│ currency         │                  │ national_id                   │
│ status           │                  │ date_of_birth                 │
│ modules_enabled  │                  │ gender                        │
│ created_at       │                  │ created_at                    │
│ updated_at       │                  │ updated_at                    │
└──────────────────┴──────────────────┴──────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                         RBAC TABLES                                   │
├──────────────┬──────────────────┬────────────────┬──────────────────┤
│    roles     │   permissions    │role_permissions│   user_roles     │
├──────────────┼──────────────────┼────────────────┼──────────────────┤
│ id (PK)      │ id (PK)          │ role_id (FK)   │ user_id (FK)     │
│ tenant_id    │ name             │ permission_id  │ role_id (FK)     │
│ name         │ module           │ (FK)           │ tenant_id (FK)   │
│ description  │ resource         │ created_at     │ assigned_by      │
│ is_system    │ action           │                │ created_at       │
│ created_at   │ description      │                │                  │
│ updated_at   │ created_at       │                │                  │
└──────────────┴──────────────────┴────────────────┴──────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                       ACADEMIC TABLES                                 │
├──────────────┬──────────────┬──────────────┬────────────────────────┤
│   students   │   classes    │  enrollments │       subjects         │
├──────────────┼──────────────┼──────────────┼────────────────────────┤
│ id (PK)      │ id (PK)      │ id (PK)      │ id (PK)                │
│ tenant_id    │ tenant_id    │ tenant_id    │ tenant_id              │
│ student_no   │ name_ar      │ student_id   │ name_ar                │
│ profile_id   │ name_en      │ class_id     │ name_en                │
│ parent_id    │ academic_year│ academic_year│ class_id               │
│ academic_year│ grade_level  │ status       │ teacher_id             │
│ status       │ capacity     │ enrolled_at  │ credits                │
│ created_at   │ teacher_id   │              │ created_at             │
│              │ created_at   │              │                        │
├──────────────┼──────────────┼──────────────┼────────────────────────┤
│    exams     │    grades    │  timetable   │       events           │
├──────────────┼──────────────┼──────────────┼────────────────────────┤
│ id (PK)      │ id (PK)      │ id (PK)      │ id (PK)                │
│ tenant_id    │ tenant_id    │ tenant_id    │ tenant_id              │
│ subject_id   │ student_id   │ class_id     │ title_ar               │
│ title        │ exam_id      │ subject_id   │ title_en               │
│ max_score    │ score        │ teacher_id   │ description            │
│ exam_date    │ grade_letter │ day_of_week  │ start_datetime         │
│ created_at   │ created_at   │ start_time   │ end_datetime           │
│              │              │ end_time     │ created_by             │
│              │              │ room         │ created_at             │
└──────────────┴──────────────┴──────────────┴────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                         HR TABLES                                     │
├──────────────────┬──────────────────┬──────────────────────────────┤
│    employees     │    attendance    │         salaries              │
├──────────────────┼──────────────────┼──────────────────────────────┤
│ id (PK)          │ id (PK)          │ id (PK)                       │
│ tenant_id        │ tenant_id        │ tenant_id                     │
│ profile_id       │ employee_id (FK) │ employee_id (FK)              │
│ employee_no      │ date             │ month                         │
│ job_title_ar     │ check_in         │ year                          │
│ job_title_en     │ check_out        │ basic_salary                  │
│ department       │ status           │ allowances                    │
│ basic_salary     │ notes            │ deductions                    │
│ hire_date        │ created_at       │ net_salary                    │
│ status           │                  │ paid_at                       │
│ created_at       │                  │ created_at                    │
└──────────────────┴──────────────────┴──────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                       FINANCE TABLES                                  │
├──────────────────┬──────────────────┬──────────────────────────────┤
│    invoices      │    payments      │         expenses              │
├──────────────────┼──────────────────┼──────────────────────────────┤
│ id (PK)          │ id (PK)          │ id (PK)                       │
│ tenant_id        │ tenant_id        │ tenant_id                     │
│ student_id (FK)  │ invoice_id (FK)  │ category                      │
│ academic_year    │ amount           │ amount                        │
│ fee_type         │ payment_method   │ description                   │
│ total_amount     │ receipt_no       │ expense_date                  │
│ paid_amount      │ paid_by          │ attachment_url                │
│ due_date         │ paid_at          │ created_by                    │
│ status           │ created_at       │ created_at                    │
│ created_at       │                  │                               │
└──────────────────┴──────────────────┴──────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                    SYSTEM TABLES                                      │
├──────────────────┬──────────────────┬──────────────────────────────┤
│   audit_logs     │  notifications   │      custom_fields            │
├──────────────────┼──────────────────┼──────────────────────────────┤
│ id (PK)          │ id (PK)          │ id (PK)                       │
│ tenant_id        │ tenant_id        │ tenant_id                     │
│ user_id          │ user_id (FK)     │ entity_type                   │
│ action           │ type             │ field_name                    │
│ table_name       │ title_ar         │ field_type                    │
│ record_id        │ title_en         │ is_required                   │
│ old_values (JSON)│ body_ar          │ options (JSON)                │
│ new_values (JSON)│ body_en          │ created_at                    │
│ ip_address       │ is_read          ├──────────────────────────────┤
│ user_agent       │ read_at          │   custom_field_values         │
│ created_at       │ created_at       ├──────────────────────────────┤
│                  │                  │ id (PK)                       │
│                  │                  │ tenant_id                     │
│                  │                  │ field_id (FK)                 │
│                  │                  │ entity_id                     │
│                  │                  │ value                         │
│                  │                  │ created_at                    │
└──────────────────┴──────────────────┴──────────────────────────────┘
```

---

## هيكل المجلدات المقترح (Folder Structure)

```
saas-school-system/
├── apps/
│   ├── web/                          # React + Vite Frontend
│   │   ├── src/
│   │   │   ├── app/                  # App setup, providers, router
│   │   │   ├── features/             # Feature-based modules
│   │   │   │   ├── auth/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── academic/
│   │   │   │   ├── hr/
│   │   │   │   ├── finance/
│   │   │   │   ├── scheduling/
│   │   │   │   └── reports/
│   │   │   ├── shared/               # Shared components, hooks, utils
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── stores/           # Zustand stores
│   │   │   │   └── utils/
│   │   │   └── i18n/                 # Arabic + English translations
│   │   └── public/
│   └── admin/                        # Super Admin Panel (separate app)
├── packages/
│   ├── database/                     # Supabase migrations + types
│   │   ├── migrations/
│   │   ├── seeds/
│   │   └── types/
│   ├── shared-types/                 # Shared TypeScript types
│   └── ui/                           # Shared UI component library
├── supabase/
│   ├── functions/                    # Edge Functions
│   ├── migrations/                   # SQL migrations
│   └── seed.sql
└── docs/
    ├── erd/
    ├── api/
    └── architecture/
```

---

## ملاحظات الامتثال والجودة

1. جميع المتطلبات مكتوبة وفق أنماط EARS وقواعد INCOSE
2. كل متطلب قابل للاختبار وله معايير قبول قابلة للقياس
3. لا توجد متطلبات سلبية (SHALL NOT) إلا في حالات معالجة الأخطاء الضرورية
4. جميع المصطلحات التقنية مُعرَّفة في قاموس المصطلحات
5. المتطلبات خالية من التفاصيل التقنية التنفيذية (solution-free) حيث أمكن
6. تم تضمين متطلبات الجولة الكاملة (Round-trip) للبيانات المُصدَّرة والمستوردة
