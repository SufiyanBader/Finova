# Finova — AI-Powered Personal Finance Platform

> Full-stack Next.js 15 finance app with AI receipt scanning, budget alerts,
> recurring transactions, and monthly report emails.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database | PostgreSQL via Supabase + Prisma ORM |
| Auth | Clerk |
| Background Jobs | Inngest |
| Security | Arcjet (shield, bot detection, rate limiting) |
| Email | Resend + React Email |
| AI | Google Gemini 1.5 Flash |
| Date Utils | date-fns |

---

## Project Structure

```
finova/
├── prisma/
│   └── schema.prisma          # DB schema – User, Account, Transaction, Budget
├── lib/
│   ├── prisma.js              # Singleton PrismaClient
│   ├── arcjet.js              # Token-bucket rate limiter
│   ├── check-user.js          # Clerk → DB user sync
│   └── inngest/
│       ├── client.js          # Inngest client
│       └── functions.js       # 4 background job functions
├── actions/
│   ├── dashboard.js           # createAccount, getUserAccounts, getDashboardData
│   ├── accounts.js            # getAccountWithTransactions, bulkDeleteTransactions
│   ├── transaction.js         # CRUD + Gemini receipt scanner
│   ├── budget.js              # getCurrentBudget, updateBudget
│   └── send-email.js          # Resend wrapper
├── app/
│   └── api/
│       ├── inngest/route.js   # Inngest serve endpoint (GET/POST/PUT)
│       └── seed/route.js      # Dev-only data seeder
├── emails/
│   └── template.jsx           # React Email – budget alert + monthly report
├── middleware.js               # Arcjet + Clerk composed middleware
├── next.config.mjs
├── jsconfig.json
└── .env.example
```

---

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd finova
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in every variable in `.env.local` (see table below).

### 3. Set up the database

```bash
npx prisma migrate dev --name create_models
npx prisma generate
```

### 4. Run development servers

```bash
# Terminal 1 – Next.js
npm run dev

# Terminal 2 – Inngest dev server
npx inngest-cli@latest dev
```

### 5. Seed sample data (optional)

1. Open `app/api/seed/route.js`
2. Replace `ACCOUNT_ID` and `USER_ID` with real values from your DB
3. Visit `http://localhost:3000/api/seed`

### 6. Check Inngest dashboard

Open `http://localhost:8288` to monitor background jobs.

---

## Environment Variables

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Supabase → Project Settings → Database → Connection Pooling URL |
| `DIRECT_URL` | Supabase → Project Settings → Database → Direct Connection URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys |
| `ARCJET_KEY` | arcjet.com → Dashboard |
| `INNGEST_EVENT_KEY` | Inngest Dashboard → Event Keys |
| `INNGEST_SIGNING_KEY` | Inngest Dashboard → Signing Keys |
| `RESEND_API_KEY` | resend.com → API Keys |
| `GEMINI_API_KEY` | Google AI Studio → API Keys |

---

## Background Jobs

| Function | Trigger | Description |
|---|---|---|
| `checkBudgetAlert` | Cron – every 6 h | Emails user when ≥ 80 % of monthly budget is used (once per month) |
| `triggerRecurringTransactions` | Cron – daily midnight | Finds due recurring transactions and fires processing events |
| `processRecurringTransaction` | Event – `transaction.recurring.process` | Creates new transaction occurrence, updates balance (throttled 10/min per user) |
| `generateMonthlyReports` | Cron – 1st of month | Generates Gemini AI insights and emails a full monthly report to every user |

---

## API Data Shapes

### `getUserAccounts()` → `Account[]`
```js
{
  id: string, name: string, type: "CURRENT" | "SAVINGS",
  balance: number, isDefault: boolean, userId: string,
  createdAt: Date, _count: { transactions: number }
}
```

### `getAccountWithTransactions(accountId)` → `Account & { transactions: Transaction[] }`
```js
{
  // ...account fields above
  transactions: [{
    id, type, amount: number, description, date,
    category, isRecurring, recurringInterval,
    nextRecurringDate, accountId, userId
  }]
}
```

### `getCurrentBudget(accountId)` → `{ budget, currentExpenses }`
```js
{
  budget: { id, amount: number, lastAlertSent, userId } | null,
  currentExpenses: number
}
```

### `createTransaction(data)` → `{ success, data }`
```js
{
  success: true,
  data: {
    id, type, amount: number, description, date,
    category, accountId, userId,
    isRecurring, recurringInterval, nextRecurringDate
  }
}
```

### `scanReceipt(file)` → Receipt data
```js
{
  amount: number, date: string,       // ISO 8601
  description: string, category: string, merchantName: string
}
```

---

## Security Notes

- All server actions validate auth via Clerk at the top of every function
- `createTransaction` is rate-limited to 10 requests/user/hour via Arcjet
- The middleware shields every non-static route from bots and suspicious traffic
- The `/api/seed` endpoint returns 403 in production
- All Decimal database values are serialized before crossing the server/client boundary
- Every mutation calls `revalidatePath` to keep cached data fresh

---

## Useful Commands

```bash
npm run db:migrate      # Run pending migrations
npm run db:generate     # Regenerate Prisma client
npm run db:studio       # Open Prisma Studio (visual DB browser)
npm run db:reset        # Reset DB and re-run all migrations (dev only)
npm run email           # Preview emails at localhost:3000 (react-email)
```
