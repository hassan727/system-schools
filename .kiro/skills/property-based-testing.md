# Skill: كتابة Property-Based Tests

## متى تستخدم هذا الـ Skill؟
عند التحقق من صحة الحسابات، عزل البيانات، أو أي خاصية يجب أن تصح دائماً.

## الإعداد
```bash
pnpm add -D fast-check vitest
```

## قالب الاختبار
```typescript
// src/features/{module}/tests/{resource}.property.test.ts
import { describe, it } from 'vitest'
import * as fc from 'fast-check'

describe('{Resource} Properties', () => {
  it('P{N}: وصف الخاصية', () => {
    fc.assert(
      fc.property(
        // المولّدات (Arbitraries)
        fc.float({ min: 0, max: 100, noNaN: true }),
        fc.string({ minLength: 1, maxLength: 50 }),
        
        // دالة الاختبار
        (value, name) => {
          // الخاصية يجب أن تصح دائماً
          const result = myFunction(value, name)
          return result >= 0 && result <= 100
        }
      ),
      { numRuns: 1000 } // عدد التشغيلات
    )
  })
})
```

## الخصائص المطلوبة في المشروع (P1-P16)

### عزل البيانات (P1-P3)
```typescript
// P1: مستخدم من tenant_A لا يرى بيانات tenant_B
it('P1: عزل البيانات بين المستأجرين', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.uuid(), fc.uuid(),
      async (tenantA, tenantB) => {
        fc.pre(tenantA !== tenantB)
        const results = await queryWithTenant('students', tenantA)
        return results.every(r => r.tenant_id === tenantA)
      }
    ), { numRuns: 50 }
  )
})
```

### RBAC (P4-P7)
```typescript
// P4: صيغة الصلاحيات صحيحة
it('P4: صيغة {module}.{resource}.{action}', () => {
  fc.assert(
    fc.property(
      fc.constantFrom(...ALL_PERMISSIONS),
      (permission) => {
        const parts = permission.split('.')
        return parts.length === 3 && parts.every(p => p.length > 0)
      }
    )
  )
})
```

### الحسابات المالية (P8-P11)
```typescript
// P8: رصيد الفاتورة لا يكون سالباً
it('P8: رصيد الفاتورة = الإجمالي - الخصم - المدفوع ≥ 0', () => {
  fc.assert(
    fc.property(
      fc.float({ min: 100, max: 100000, noNaN: true }),
      fc.float({ min: 0, max: 0.5, noNaN: true }), // discount ratio
      fc.float({ min: 0, max: 1, noNaN: true }),    // paid ratio
      (total, discountRatio, paidRatio) => {
        const discount = total * discountRatio
        const net = total - discount
        const paid = net * paidRatio
        const balance = net - paid
        return balance >= -0.01 // تسامح للأرقام العشرية
      }
    ), { numRuns: 1000 }
  )
})
```

### GPA (P12-P15)
```typescript
// P12: GPA دائماً بين 0.0 و 4.0
it('P12: GPA في النطاق [0.0, 4.0]', () => {
  fc.assert(
    fc.property(
      fc.array(
        fc.record({
          score: fc.float({ min: 0, max: 100, noNaN: true }),
          maxScore: fc.constant(100),
          credits: fc.float({ min: 0.5, max: 4, noNaN: true }),
        }),
        { minLength: 1, maxLength: 20 }
      ),
      (grades) => {
        const gpa = calculateGPA(grades)
        return gpa >= 0.0 && gpa <= 4.0
      }
    ), { numRuns: 1000 }
  )
})
```

## تشغيل الاختبارات
```bash
# تشغيل مرة واحدة (بدون watch mode)
pnpm vitest run

# تشغيل ملف محدد
pnpm vitest run src/features/finance/tests/invoice.property.test.ts

# مع تقرير التغطية
pnpm vitest run --coverage
```

## نصائح
- `numRuns: 1000` للحسابات الرياضية
- `numRuns: 50-100` للاختبارات التي تتصل بقاعدة البيانات
- استخدم `fc.pre(condition)` لتصفية الحالات غير الصالحة
- استخدم `fc.constantFrom(...array)` لاختيار من قائمة محددة
