# Guía de conexión a MongoDB Atlas

## Paso 1 — Crea tu cluster en Atlas (gratis)

1. Ve a https://cloud.mongodb.com
2. Crea una cuenta o inicia sesión
3. Click en **"Build a Database"** → elige **M0 Free**
4. Elige región (cualquiera cercana a México)
5. Dale un nombre al cluster (ej: `finance-cluster`)

## Paso 2 — Crea un usuario de base de datos

1. En el panel izquierdo → **Database Access**
2. Click **"Add New Database User"**
3. Método: **Password**
4. Escribe un usuario y contraseña (guárdalos, los necesitas)
5. Role: **"Read and Write to any database"**
6. Click **Add User**

## Paso 3 — Permite tu IP

1. En el panel izquierdo → **Network Access**
2. Click **"Add IP Address"**
3. Para desarrollo: click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **Confirm**

## Paso 4 — Obtén tu URI de conexión

1. En tu cluster → click **"Connect"**
2. Elige **"Connect your application"**
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copia la URI, se ve así:
   ```
   mongodb+srv://miusuario:mipassword@finance-cluster.abc123.mongodb.net/?retryWrites=true&w=majority
   ```

## Paso 5 — Configura tu .env

Abre el archivo `.env` y reemplaza la línea MONGO_URI:

```env
MONGO_URI=mongodb+srv://miusuario:mipassword@finance-cluster.abc123.mongodb.net/finance_db?retryWrites=true&w=majority
```

**Importante:** agrega `/finance_db` antes del `?` para que use esa base de datos.

## Paso 6 — Arranca el servidor

```bash
npm install
npm run dev
```

Deberías ver:
```
✅ MongoDB conectado
Server running on port 3000 [development]
```

## Paso 7 — Carga datos de prueba (opcional)

```bash
node src/config/seeds.js
```

Esto crea ingresos y gastos de ejemplo para abril 2026.

## Paso 8 — Prueba la conexión

```bash
curl http://localhost:3000/health
# {"status":"ok","environment":"development","timestamp":"..."}

curl "http://localhost:3000/api/v1/summary?year=2026&month=4"
# Devuelve el resumen del mes
```


