# Finance API

REST API for personal finance management built with Node.js, Express, and MongoDB.

## Stack

- **Runtime**: Node.js 18+
- **Framework**: Express 4
- **Database**: MongoDB via Mongoose
- **Validation**: express-validator
- **Auth-ready**: JWT (bcryptjs + jsonwebtoken — scaffolded, not yet wired to routes)

---

## Project structure

```
src/
├── config/
│   ├── database.js      # Mongoose connection + event listeners
│   └── seeds.js         # Dev seed script
├── controllers/
│   ├── incomeController.js
│   ├── expenseController.js
│   └── summaryController.js   # Aggregation pipeline → monthly summary
├── middleware/
│   ├── auth.js          # JWT protect() — ready to attach to routes
│   ├── errorHandler.js  # Global error handler (last in chain)
│   └── validate.js      # express-validator result formatter
├── models/
│   ├── Income.js
│   ├── Expense.js
│   └── User.js          # Scaffolded for future auth
├── routes/
│   ├── incomeRoutes.js
│   ├── expenseRoutes.js
│   └── summaryRoutes.js
├── utils/
│   ├── apiResponse.js   # success / created / error / notFound helpers
│   └── dateHelpers.js   # getMonthRange, monthLabel
├── app.js               # Express setup, middleware, route mounting
└── server.js            # Entry point, DB connect, graceful shutdown
```

---

## Setup

```bash
cp .env.example .env      # fill in your MONGODB_URI and JWT_SECRET
npm install
npm run dev               # nodemon hot-reload
node src/config/seeds.js  # optional: populate with sample data
```

---

## API Reference

Base path: `/api/v1`

### Income

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/income` | Create income record |
| `GET` | `/income` | List income (filters: year, month, source, page, limit) |
| `DELETE` | `/income/:id` | Delete a record |

**POST /income body**
```json
{
  "amount": 55000,
  "description": "Salario mensual",
  "source": "salary",
  "date": "2026-04-01",
  "notes": "Opcional"
}
```

### Expenses

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/expenses` | Create expense |
| `GET` | `/expenses` | List expenses (filters: year, month, category, isRecurring, page, limit) |
| `GET` | `/expenses/categories` | Returns valid category enum |
| `DELETE` | `/expenses/:id` | Delete a record |

**POST /expenses body**
```json
{
  "amount": 18000,
  "description": "Renta departamento",
  "category": "housing",
  "date": "2026-04-01",
  "isRecurring": true
}
```

Valid categories: `housing`, `food`, `transport`, `health`, `entertainment`, `education`, `clothing`, `utilities`, `savings`, `other`

### Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/summary?year=2026&month=4` | Full monthly summary |

**Response shape**
```json
{
  "status": "success",
  "data": {
    "period": { "year": 2026, "month": 4, "label": "April 2026" },
    "summary": {
      "totalIncome": 75000,
      "totalExpenses": 32800,
      "balance": 42200,
      "savingsRate": 56.27,
      "status": "positive"
    },
    "income": { "count": 3, "bySource": [...] },
    "expenses": { "count": 7, "byCategory": [...], "topCategory": "housing" }
  }
}
```

---

## Enabling Auth

1. Create a `POST /auth/register` and `POST /auth/login` route (User model is ready)
2. Login returns a signed JWT
3. Add `protect` middleware to any route:
   ```js
   router.post('/', protect, createIncomeRules, validate, createIncome);
   ```
4. Controllers already read `req.user?.id` — they'll scope queries per user automatically

---

## Error response shape

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    { "field": "amount", "message": "Amount must be a positive number" }
  ]
}
```
