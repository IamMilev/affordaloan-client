# Localization Plan: Affordaloan Client

## Overview

This plan outlines the implementation of internationalization (i18n) support for the Affordaloan loan calculator application, enabling multiple language support starting with Bulgarian (bg) and English (en).

---

## Recommended Approach: next-intl

**Library:** [next-intl](https://next-intl-docs.vercel.app/) - purpose-built for Next.js App Router

### Why next-intl?
- First-class Next.js App Router support
- Server Component compatible
- Type-safe translations with TypeScript
- Small bundle size
- Built-in number/date/currency formatting
- Easy pluralization rules

---

## Implementation Plan

### Phase 1: Setup & Infrastructure

#### 1.1 Install Dependencies
```bash
pnpm add next-intl
```

#### 1.2 Create Translation Files Structure
```
/messages
  /bg.json        # Bulgarian (default)
  /en.json        # English
  /de.json        # German (future)
  /ro.json        # Romanian (future)
```

#### 1.3 Configure next-intl
Create `i18n.ts` configuration:
```typescript
// i18n.ts
export const locales = ['bg', 'en'] as const;
export const defaultLocale = 'bg' as const;
export type Locale = (typeof locales)[number];
```

#### 1.4 Update Next.js Config
```typescript
// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
```

---

### Phase 2: Route Structure

#### Option A: URL Prefix (Recommended)
```
/bg/          → Bulgarian version
/en/          → English version
/             → Redirects to /bg (default)
```

**Pros:** SEO-friendly, shareable URLs, clear language context
**Cons:** Requires route restructuring

#### Option B: Cookie/Header Based
```
/             → Language detected from browser/cookie
```

**Pros:** Cleaner URLs
**Cons:** Less SEO-friendly, harder to share specific language versions

**Recommendation:** Option A with URL prefix

#### App Router Structure
```
/app
  /[locale]
    /layout.tsx       # Locale provider wrapper
    /page.tsx         # Main page with LoanCalculatorFlow
  /api               # API routes (unchanged)
```

---

### Phase 3: Translation Keys Structure

#### 3.1 Translation File Example (`/messages/bg.json`)
```json
{
  "common": {
    "continue": "Продължи",
    "back": "Назад",
    "loading": "Зареждане...",
    "error": "Грешка",
    "currency": "€",
    "months": "месеца",
    "month": "месец",
    "years": "год.",
    "and": "и"
  },
  "step1": {
    "title": "Колко голям кредит можеш да си позволиш?",
    "subtitle": "Открий възможностите си за финансиране бързо и лесно",
    "loanType": {
      "label": "Тип кредит",
      "mortgage": "Ипотечен кредит",
      "consumer": "Потребителски кредит"
    },
    "loanAmount": {
      "label": "Размер на кредита"
    },
    "income": {
      "label": "Месечни доходи (нето)",
      "placeholder": "Напр. 2,500 €"
    },
    "term": {
      "label": "Срок на погасяване"
    }
  },
  "step2": {
    "title": "Допълнителна информация",
    "subtitle": "Помогни ни да изчислим точно твоите разходи",
    "contact": {
      "title": "Твоите данни",
      "name": "Име",
      "email": "Имейл",
      "namePlaceholder": "Вашето име",
      "emailPlaceholder": "example@email.com",
      "emailError": "Моля, въведете валиден имейл адрес",
      "privacyNote": "Твоите данни са защитени и няма да бъдат споделяни с трети страни"
    },
    "debt": {
      "title": "Месечна сума на активни задълженията",
      "label": "Месечна сума на задълженията"
    },
    "property": {
      "title": "Стойност на имота",
      "currentValue": "Текуща стойност",
      "change": "Промени",
      "confirm": "Потвърди"
    },
    "monthlyExpenses": {
      "title": "Месечни Разходи",
      "payment": "Месечна вноска",
      "otherDebts": "Други Задължения",
      "interestRate": "Лихвен процент",
      "term": "Срок"
    },
    "upfrontCosts": {
      "title": "Първоначални разходи",
      "downPayment": "Аванс (10%)",
      "notaryFees": "Нотариални такси (4%)",
      "insurance": "Застраховка",
      "municipalityFee": "Общинска такса"
    },
    "latePayment": {
      "title": "Последици от забавено плащане",
      "description": "Виж колко струва забавянето на плащанията",
      "monthsLabel": "Месеци забава",
      "paymentX": "Месечна вноска x {count}",
      "penalty": "Наказателна лихва",
      "totalDue": "Обща сума",
      "criticalWarning": "КРИТИЧНО ПРЕДУПРЕЖДЕНИЕ!",
      "criticalText": "При забава над 6 месеца банката има право да започне процедура по изземване на имота!",
      "generalWarning": "При многократни забави може да се стигне до изискване на пълна сума и съдебно производство.",
      "creditBureauWarning": "Забавите над 3 месеца се докладват в КИБ (Кредитен информационен бюро)."
    },
    "submitButton": "Виж резултатите"
  },
  "step3": {
    "title": "Анализ и препоръка",
    "titlePersonalized": "{name}, ето твоят анализ",
    "subtitle": "Ето какво установихме за твоята ситуация",
    "loanAmount": "Сума на кредита",
    "incomePercentage": "Процент от дохода",
    "recommendation": {
      "title": "Нашата препоръка",
      "excellent": {
        "message": "Отлично! Този кредит е напълно по силите ти.",
        "advice1": "Месечната вноска е под 30% от доходите ти - това е идеално съотношение",
        "advice2": "Ще имаш достатъчно средства за спестявания и непредвидени разходи",
        "advice3": "Банката с голяма вероятност ще одобри този кредит",
        "advice4": "Можеш да помислиш и за по-кратък срок, за да намалиш лихвите"
      },
      "good": {
        "message": "Добре! Този кредит е разумен избор за теб.",
        "advice1": "Месечната вноска е между 30-40% от доходите ти - приемливо съотношение",
        "advice2": "Ще можеш удобно да си плащаш вноските",
        "advice3": "Препоръчваме да имаш резервен фонд за непредвидени ситуации",
        "advice4": "Внимавай с допълнителни кредити през този период"
      },
      "risky": {
        "message": "Внимание! Този кредит може да е предизвикателство.",
        "advice1": "Месечната вноска е между 40-50% от доходите ти - това е рисковано",
        "advice2": "Ще имаш ограничени средства за други разходи",
        "advice3": "Помисли за увеличаване на срока или намаляване на сумата",
        "advice4": "Уверена, че няма да има промени в доходите ти?",
        "advice5": "Банката може да изиска допълнителни обезпечения"
      },
      "notRecommended": {
        "message": "Не препоръчваме! Този кредит е твърде рискован.",
        "advice1": "Месечната вноска е над 50% от доходите ти - това е много високо",
        "advice2": "Голям риск от неплащане и финансови проблеми",
        "advice3": "Банката най-вероятно ще отхвърли заявката",
        "advice4": "Помисли за намаляване на сумата или удължаване на срока",
        "advice5": "Или опитай да увеличиш доходите си преди да кандидатстваш"
      },
      "adviceTitle": "Нашите съвети",
      "paymentDescription": "Месечната вноска ще бъде {payment} от твоите {income} доход",
      "includesDebts": "(включително {debt} активни задължения)"
    }
  },
  "progress": {
    "step1": "Основна информация",
    "step2": "Детайли",
    "step3": "Резултат"
  },
  "loanPreview": {
    "monthlyPayment": "Месечна вноска",
    "affordable": "В граници на достъпност",
    "notAffordable": "Над препоръчаното",
    "incomePercentage": "% от доходите",
    "totalPayment": "Общо плащане"
  },
  "trust": {
    "dataProtected": "Данните ти са защитени",
    "accurateCalculations": "Точни изчисления",
    "fastResult": "Бърз резултат",
    "freeConsultation": "Безплатна консултация",
    "fastResponse": "Бърз отговор"
  }
}
```

#### 3.2 English Translation (`/messages/en.json`)
```json
{
  "common": {
    "continue": "Continue",
    "back": "Back",
    "loading": "Loading...",
    "error": "Error",
    "currency": "€",
    "months": "months",
    "month": "month",
    "years": "years",
    "and": "and"
  },
  "step1": {
    "title": "How much loan can you afford?",
    "subtitle": "Discover your financing options quickly and easily",
    "loanType": {
      "label": "Loan Type",
      "mortgage": "Mortgage",
      "consumer": "Consumer Loan"
    },
    "loanAmount": {
      "label": "Loan Amount"
    },
    "income": {
      "label": "Monthly Income (net)",
      "placeholder": "e.g. 2,500 €"
    },
    "term": {
      "label": "Repayment Term"
    }
  }
  // ... rest of translations
}
```

---

### Phase 4: Component Updates

#### 4.1 Create Translation Hook Usage
```typescript
// In components:
import { useTranslations } from 'next-intl';

function LoanCalculatorStep1() {
  const t = useTranslations('step1');

  return (
    <h1>{t('title')}</h1>
  );
}
```

#### 4.2 Number/Currency Formatting
```typescript
import { useFormatter } from 'next-intl';

function PriceDisplay({ amount }: { amount: number }) {
  const format = useFormatter();

  return (
    <span>
      {format.number(amount, { style: 'currency', currency: 'EUR' })}
    </span>
  );
}
```

---

### Phase 5: Language Switcher Component

```typescript
// components/LanguageSwitcher/LanguageSwitcher.tsx
'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales } from '@/i18n';

const languageNames: Record<string, string> = {
  bg: 'БГ',
  en: 'EN',
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <div className="flex gap-2">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleChange(loc)}
          className={`px-3 py-1 rounded ${
            locale === loc
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {languageNames[loc]}
        </button>
      ))}
    </div>
  );
}
```

---

### Phase 6: Files to Modify

| File | Changes Required |
|------|-----------------|
| `next.config.ts` | Add next-intl plugin |
| `app/layout.tsx` | Move to `app/[locale]/layout.tsx` |
| `app/page.tsx` | Move to `app/[locale]/page.tsx` |
| `components/LoanCalculatorStep1/` | Add `useTranslations` hook |
| `components/LoanCalculatorStep2/` | Add `useTranslations` hook |
| `components/LoanCalculatorStep3/` | Add `useTranslations` hook |
| `components/ProgressIndicator/` | Add `useTranslations` hook |
| `components/LoanTypeSelector/` | Add `useTranslations` hook |
| `components/LoanAmountSlider/` | Add `useTranslations` hook |
| `components/IncomeInput/` | Add `useTranslations` hook |
| `components/TermSelector/` | Add `useTranslations` hook |
| `components/LoanPreviewCard/` | Add `useTranslations` hook |
| `components/Slider/Slider.tsx` | Add `useTranslations` hook |

---

### Phase 7: Migration Steps

1. **Install next-intl** and configure
2. **Create message files** for bg (copy existing strings)
3. **Restructure routes** to use `[locale]` param
4. **Update one component** at a time (start with Step1)
5. **Add language switcher** to header/footer
6. **Create English translations**
7. **Test all flows** in both languages
8. **SEO: Add hreflang tags** for language versions

---

### Phase 8: Future Considerations

#### Additional Languages
- German (de) - for Austrian/German market
- Romanian (ro) - neighboring country
- Greek (el) - neighboring country

#### RTL Support
If adding Arabic or Hebrew in future, consider:
- CSS logical properties
- RTL-aware components

#### Translation Management
For scaling:
- Consider [Crowdin](https://crowdin.com/) or [Lokalise](https://lokalise.com/)
- Implement translation CI/CD pipeline

---

## Estimated Effort

| Phase | Effort |
|-------|--------|
| Phase 1: Setup | 2-3 hours |
| Phase 2: Route Structure | 1-2 hours |
| Phase 3: Translation Files | 2-3 hours |
| Phase 4: Component Updates | 4-6 hours |
| Phase 5: Language Switcher | 1 hour |
| Phase 6-7: Testing & Polish | 2-3 hours |
| **Total** | **12-18 hours** |

---

## Next Steps

1. Approve this plan
2. Create a new branch `feature/i18n`
3. Begin Phase 1 implementation
