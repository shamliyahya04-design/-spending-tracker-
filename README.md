# 💸 Spending Tracker
## 📱 Android (APK)

This project also builds as a native Android app via **Capacitor**.

```bash
npm run build          # generates static export in out/
npx cap add android    # first time only
npx cap sync android
cd android && ./gradlew assembleDebug
```

Requires: `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, and `output: 'export'` in `next.config.js`
A **premium, production-ready personal spending tracker** — beautiful, fast, responsive, accessible, and built to feel like a commercial fintech product. Inspired by the polish of Apple, Linear, Notion, Stripe, and Arc.

> Built with Next.js (App Router), React, TypeScript, Tailwind CSS, Recharts, Zustand, React Hook Form + Zod, Framer Motion, and Lucide.

---

## ✨ Highlights

- **Premium design system**
- — glassmorphism, soft shadows, rounded geometry, perfect spacing, light/dark/system themes.
- **Bilingual & RTL** — full **English** and **Arabic** localization with correct right-to-left layout.
- **Multi-currency** — USD, EUR, GBP, SAR, AED, YER, JPY with locale-aware formatting (adding a currency = one entry).
- **Realistic demo data** — ~4 months of generated transactions so every chart and table looks alive out of the box.
- **Clean architecture** — strict separation of types, data, state, calculations, validation, and UI.
- **Fully typed** — strict TypeScript end-to-end.

## 🧩 Features

| Area | What you get |
| --- | --- |
| **Dashboard** | 5 animated summary cards with sparklines & % change, spending trend, income vs expense, category donut, weekly bars, budget progress, cash flow, smart insights, recent activity |
| **Transactions** | Powerful table: search, type/category filters, multi-column sort, pagination, bulk select & delete, duplicate, favorite, CSV + Excel export |
| **Add/Edit** | Validated form (RHF + Zod): type, amount, category, date/time, merchant, method, recurrence, status, notes, tags, favorite |
| **Budgets** | Monthly/weekly, global or per-category, live progress, warning & over-budget states |
| **Goals** | Savings goals with animated progress rings, contribute/withdraw, deadlines |
| **Categories** | Default catalog + custom create/edit, icon & color pickers, income/expense sections |
| **Calendar** | Heat-mapped month grid of daily spending; click a day to see its transactions |
| **Reports** | Week/month/year/custom ranges, summary stats, charts, CSV/Excel export |
| **Settings** | Theme, language, currency, date format, notification toggles, backup/restore (JSON), reset |
| **Global search** | ⌘K palette searching merchant, notes, category, tags, amount |
| **Notifications** | Budget alerts, recurring reminders, milestones, reports |
| **States** | Loading skeletons, empty states, error boundary, 404 |

## 🛠 Tech Stack

- **Next.js 14** (App Router, patched) · **React 18** · **TypeScript** (strict)
- **Tailwind CSS** + `tailwindcss-animate`
- **Recharts** (analytics) · **Framer Motion** (animations)
- **Zustand** (state, persisted to `localStorage`)
- **React Hook Form** + **Zod** (forms & validation)
- **date-fns** (dates, i18n locales) · **Lucide** (icons) · **next-themes**

> Note: shadcn/ui-style primitives are implemented locally (in `src/components/ui`) so the project is fully self-contained — no external registry dependency, no Radix runtime. They're drop-in compatible in spirit.

## 📁 Architecture

```
spending-tracker/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout, fonts, providers
│   │   ├── page.tsx            # Dashboard
│   │   ├── transactions/       # Transactions table
│   │   ├── budgets/            # Budget management
│   │   ├── goals/              # Savings goals
│   │   ├── categories/         # Category management
│   │   ├── calendar/           # Calendar view
│   │   ├── reports/            # Reports & export
│   │   ├── settings/           # Preferences
│   │   ├── loading.tsx         # Route loading (skeletons)
│   │   ├── error.tsx           # Error boundary
│   │   ├── not-found.tsx       # 404
│   │   └── globals.css         # Design tokens (CSS variables)
│   ├── components/
│   │   ├── ui/                 # Reusable primitives (button, card, dialog…)
│   │   ├── layout/             # App shell, sidebar, topbar, search, toggles
│   │   ├── charts/             # Recharts wrappers + sparklines
│   │   ├── dashboard/          # Summary cards, insights
│   │   ├── goals/              # Progress ring
│   │   └── transactions/       # Table, row, dialog
│   └── lib/
│       ├── types.ts            # Single source of truth: domain types
│       ├── constants.ts        # Default categories, icons, colors
│       ├── currencies.ts       # Currency registry + conversion
│       ├── data.ts             # Deterministic seed data generator
│       ├── store.ts            # Zustand store (persisted)
│       ├── calculations.ts     # Pure analytics (summaries, series, budgets)
│       ├── validation.ts       # Zod schemas
│       ├── form-options.ts     # Select options (methods, recurrence)
│       ├── i18n.ts             # EN/AR dictionary + translate()
│       ├── hooks.ts            # useI18n(), useSettings()
│       └── utils.ts            # cn(), formatting, CSV/Excel export
```

**Layering principle:** UI → hooks → store → calculations → types. Business logic is pure and fully decoupled from components, so it's trivial to test or to swap the data source later.

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev
# → http://localhost:3000

# 3. Production build & start
npm run build
npm run start
```

Requires **Node 18.18+** (developed on Node 20).

## 🎨 Design System

Theming is driven by **HSL CSS variables** in `globals.css` and mapped through `tailwind.config.ts`. Switching the theme toggles a `dark` class on `<html>` (via `next-themes`); charts read the same variables so they re-theme automatically.

- Light, Dark, and System modes
- Reusable tokens: `primary`, `positive`, `destructive`, `chart-1..6`, `card`, `muted`…
- Utility classes: `.glass`, `.card-premium`, `.shimmer`, `.tabular`

## 🌍 Localization & RTL

- Dictionary in `src/lib/i18n.ts`; `t("key", { params })` resolves the active language.
- `<html dir>` and `lang` sync automatically — Arabic flips the whole layout to RTL.
- Logical properties (`ps-`, `pe-`, `start-`, `end-`, `ms-auto`) are used throughout so components work identically in both directions.
- Date/time formatting uses `date-fns` locales (`arSA`, `enUS`).

## 💱 Multi-Currency

All amounts are stored in **USD** as the base and converted for display via static demo rates in `currencies.ts`. In production, `convertFromUSD` is the single seam to replace with a live FX service.

## 💾 Data & Persistence

State lives in a **Zustand** store persisted to `localStorage` under `spending-tracker-store`. The Settings screen lets users **backup** (download JSON), **restore** (upload JSON), **export**, or **reset** to demo data.

## ♿ Accessibility

- WCAG-minded contrast in both themes
- Keyboard navigation: `⌘K`/`Ctrl+K` search, `Esc` to close dialogs, focus management on modals
- `aria-label`s, `role="switch"`, `role="progressbar"`, visible focus rings
- Semantic HTML and labeled form fields

## ⚡ Performance

- Static prerendering for all routes (✓ at build time)
- Memoized selectors & `useMemo` for derived analytics
- CSS-variable theming (no runtime theme cost), self-contained primitives
- `tabular-nums` for jitter-free financial figures

## 🔭 Roadmap (architected for)

The clean data layer makes these straightforward to add later:
Authentication · Cloud sync · Bank API (Plaid) · AI spending insights · OCR receipt scanning · Investment tracking · Family/shared accounts · Subscription detection · PWA/offline · Push notifications

## ☁️ Deployment

This is a standard Next.js app — deploy anywhere that supports Node.

**Vercel (recommended):**
1. Push the repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Deploy (zero config needed).

**Other:** `npm run build && npm run start` on any Node host, or use the `next build` static/Docker outputs.

## 📜 License

MIT — free to use, modify, and ship.
