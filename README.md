# Finanse 💰

Dashboard financiero personal — React + Node.js + Express + MongoDB Atlas

## Estructura del proyecto

```
finanse/
├── backend/          # API REST (Node.js + Express + MongoDB)
│   ├── src/
│   │   ├── config/       database.js, seeds.js
│   │   ├── controllers/  income, expense, summary
│   │   ├── middleware/   auth (JWT), errorHandler, validate
│   │   ├── models/       Income, Expense, User
│   │   ├── routes/       income, expenses, summary
│   │   └── utils/        apiResponse, dateHelpers
│   ├── .env              ← configura tu MONGO_URI aquí
│   └── package.json
│
└── frontend/         # App React (sin build — se carga directo en browser)
    ├── src/
    │   ├── App.jsx         componente principal + hook useFinance
    │   ├── api/            client.js, finance.js
    │   ├── hooks/          useFinance.js
    │   └── utils/          format.js
    └── index.html
```

---

## Setup rápido

### 1. Clona el repo
```bash
git clone https://github.com/TU_USUARIO/finanse.git
cd finanse
```

### 2. Configura el backend
```bash
cd backend
cp .env.example .env   # edita MONGO_URI con tu URL de MongoDB Atlas
npm install
npm run dev
# → ✅ MongoDB conectado
# → Server running on port 3000
```

### 3. Carga datos de prueba (opcional)
```bash
node src/config/seeds.js
```

### 4. Abre el frontend
Abre `frontend/index.html` directo en tu navegador, o sirve con:
```bash
cd frontend
npx serve . -p 5173
```

---

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/summary?year=&month=` | Resumen mensual + balance automático |
| GET | `/api/v1/income` | Lista de ingresos |
| POST | `/api/v1/income` | Crear ingreso |
| DELETE | `/api/v1/income/:id` | Eliminar ingreso |
| GET | `/api/v1/expenses` | Lista de gastos |
| POST | `/api/v1/expenses` | Crear gasto |
| DELETE | `/api/v1/expenses/:id` | Eliminar gasto |
| GET | `/api/v1/expenses/categories` | Categorías disponibles |
| GET | `/health` | Health check |

---

## Variables de entorno (backend/.env)

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/finance_db?retryWrites=true&w=majority
JWT_SECRET=tu_clave_secreta_aqui
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
API_VERSION=v1
```

---

## Tecnologías

**Backend:** Node.js · Express · MongoDB · Mongoose · express-validator · helmet · cors · compression · express-rate-limit

**Frontend:** React 18 · Chart.js · Fetch API · CSS-in-JS

**Auth (preparada):** JWT · bcryptjs — scaffold listo, descomenta `protect` en las rutas para activar
