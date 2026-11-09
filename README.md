# 🏦 Sistema de Gestión de Cuenta Bancaria Simplificada

Aplicación web **Full-Stack** para gestionar una cuenta bancaria: consulta de saldo, depósitos, retiros, transferencias entre cuentas e historial de movimientos.

**Asignatura:** Ingeniería Web — Unidad de Desarrollo Full-Stack (Node.js + React + MongoDB)

| Capa | Tecnologías |
|---|---|
| Backend | Node.js (ES6+ / ES Modules), Express 5, Mongoose 8, MongoDB local |
| Frontend | React 19 empaquetado con Vite 7, JSX, `useState` / `useEffect`, Tailwind CSS 4 |

---

## 📁 Estructura del repositorio

```
banco-app/
├── server/                     # Backend (API REST)
│   ├── .env.example
│   └── src/
│       ├── index.js            # Punto de entrada (conexión a BD + listen)
│       ├── app.js              # Configuración de Express, CORS, rutas, errores
│       ├── seed.js             # Script seed con cuentas de prueba
│       ├── config/db.js        # Conexión a MongoDB y detección de transacciones
│       ├── models/             # Cuenta.js, Transaccion.js (Mongoose)
│       ├── routes/             # cuentaRoutes.js
│       ├── controllers/        # cuentaController.js (validación de entrada + respuesta)
│       ├── services/           # cuentaService.js (lógica de negocio atómica)
│       ├── middlewares/        # errorHandler.js (400 / 404 / 500)
│       └── utils/              # AppError, validaciones, serializadores
├── client/                     # Frontend (React + Vite + Tailwind)
│   ├── .env.example
│   ├── vite.config.js          # Plugins React + Tailwind y proxy /api
│   └── src/
│       ├── App.jsx             # Componente raíz (estado global de la vista)
│       ├── hooks/useCuenta.js  # Hook: saldo + historial con useState/useEffect
│       ├── services/api.js     # Cliente HTTP (fetch)
│       ├── utils/formato.js    # Formato S/ y fechas, validación de montos
│       └── components/
│           ├── Navbar.jsx
│           ├── SaldoCard.jsx
│           ├── FormOperacion.jsx
│           ├── HistorialTransacciones.jsx
│           └── Alerta.jsx
├── package.json                # Scripts para ejecutar ambos proyectos a la vez
└── README.md
```

---

## ✅ Requisitos previos

- **Node.js 20.6 o superior** (se usa `--env-file` nativo) → `node -v`
- **MongoDB Community Server** corriendo localmente en `mongodb://127.0.0.1:27017`
  - Windows: se instala como servicio (`MongoDB`) y arranca solo. Verificar con `mongosh`.
  - Linux/macOS: `sudo systemctl start mongod` o `brew services start mongodb-community`
- (Opcional) **MongoDB Compass** para ver las colecciones `cuentas` y `transacciones`.

---

## ⚙️ Instalación

```bash
git clone <url-del-repositorio> banco-app
cd banco-app

# 1. Dependencias de backend y frontend
npm run install:all          # equivale a npm install en /server y /client
npm install                  # (raíz) instala concurrently para levantar todo junto

# 2. Variables de entorno
cp server/.env.example server/.env
cp client/.env.example client/.env
```
> En Windows (PowerShell) usa `copy` en lugar de `cp`.

### Variables de entorno

**`server/.env`**

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `PORT` | Puerto de la API | `4000` |
| `MONGODB_URI` | Cadena de conexión a MongoDB local | `mongodb://127.0.0.1:27017/banco_db` |
| `CLIENT_ORIGIN` | Origen permitido por CORS | `http://localhost:5173` |

**`client/.env`**

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_URL` | URL base de la API. Vacío = usar el proxy de Vite | *(vacío)* |
| `VITE_PROXY_TARGET` | Destino del proxy `/api` en desarrollo | `http://localhost:4000` |

---

## 🌱 Inicializar la base de datos (script seed)

```bash
npm run seed                 # desde la raíz  (o: cd server && npm run seed)
```

Borra y recrea las colecciones con **5 cuentas de prueba** y movimientos coherentes con sus saldos:

| Cuenta | Titular | Saldo final aprox. | Uso sugerido en la demo |
|---|---|---|---|
| 1001 | Ana Torres Rojas | S/ 2,610.00 | Cuenta principal |
| 1002 | Luis Ramos Huamán | S/ 1,379.75 | Destino de transferencias |
| 1003 | María Quispe Soto | S/ 906.65 | Transferencias recibidas |
| 1004 | Carlos Paredes Lima | S/ 50.00 | Probar **saldo insuficiente** |
| 1005 | Rosa Mendoza Ccori | S/ 0.00 | Cuenta nueva sin fondos |

---

## ▶️ Ejecutar

**Opción A — todo con un comando (raíz):**
```bash
npm run dev
```

**Opción B — dos terminales:**
```bash
# Terminal 1
cd server && npm run dev     # API en http://localhost:4000/api

# Terminal 2
cd client && npm run dev     # Web en http://localhost:5173
```

Abrir **http://localhost:5173** y elegir una cuenta en el selector de la barra superior.

---

## 🔌 API REST

Base: `http://localhost:4000/api` · Montos en soles (máx. 2 decimales, tope S/ 50,000 por operación).

| Método | Ruta | Body (JSON) | Descripción |
|---|---|---|---|
| GET | `/cuenta/:id` | — | Saldo y datos de la cuenta (`:id` = número de cuenta) |
| POST | `/cuenta/deposito` | `{ "numeroCuenta": "1001", "monto": 150.5, "descripcion": "opcional" }` | Registra un depósito |
| POST | `/cuenta/retiro` | `{ "numeroCuenta": "1001", "monto": 80 }` | Registra un retiro |
| POST | `/cuenta/transferencia` | `{ "cuentaOrigen": "1001", "cuentaDestino": "1002", "monto": 200 }` | Transferencia entre cuentas |
| GET | `/cuenta/:id/historial?limite=20` | — | Últimas transacciones (1–100) |
| GET | `/cuentas` | — | *Auxiliar:* listado para el selector del frontend |
| GET | `/health` | — | *Auxiliar:* estado de la conexión a MongoDB |

**Formato de respuesta**
```json
{ "ok": true, "mensaje": "Depósito realizado con éxito",
  "data": { "cuenta": { "numeroCuenta": "1001", "saldo": 2760.5, "...": "..." },
            "transaccion": { "tipo": "DEPOSITO", "monto": 150.5, "fecha": "..." } } }
```
```json
{ "ok": false, "error": "Saldo insuficiente para realizar el retiro" }
```

**Códigos HTTP**

| Código | Cuándo |
|---|---|
| `200` / `201` | Consulta exitosa / operación registrada |
| `400` | Monto ausente, ≤ 0, no numérico o con más de 2 decimales; número de cuenta inválido; JSON mal formado; transferencia a la misma cuenta; **saldo insuficiente** |
| `404` | Cuenta (origen, destino o consultada) no encontrada; ruta inexistente |
| `500` | Error interno (ej. MongoDB caído) |

### Pruebas rápidas con `curl`
```bash
curl http://localhost:4000/api/cuenta/1001
curl -X POST http://localhost:4000/api/cuenta/deposito -H "Content-Type: application/json" -d "{\"numeroCuenta\":\"1001\",\"monto\":100}"
curl -X POST http://localhost:4000/api/cuenta/retiro -H "Content-Type: application/json" -d "{\"numeroCuenta\":\"1004\",\"monto\":999}"          # 400 saldo insuficiente
curl -X POST http://localhost:4000/api/cuenta/transferencia -H "Content-Type: application/json" -d "{\"cuentaOrigen\":\"1001\",\"cuentaDestino\":\"9999\",\"monto\":10}"  # 404
curl http://localhost:4000/api/cuenta/1001/historial
```

---

## 🔒 Decisiones técnicas

- **Montos en céntimos (enteros):** MongoDB guarda `saldoCentimos` / `montoCentimos` para evitar errores de punto flotante; la API expone soles.
- **Sin saldos negativos, a prueba de concurrencia:** el débito es una sola operación atómica condicional:
  `findOneAndUpdate({ numeroCuenta, saldoCentimos: { $gte: monto } }, { $inc: { saldoCentimos: -monto } })`.
  Si dos retiros llegan a la vez, solo uno puede pasar la condición.
- **Transferencia atómica:** al arrancar, la API detecta si MongoDB es *replica set*.
  - **Replica set:** débito + crédito + registro se ejecutan dentro de una **transacción multi-documento** (`session.withTransaction`): todo o nada.
  - **Standalone (instalación local por defecto):** débito condicional → crédito → registro; si un paso falla se aplica **compensación** (rollback manual) para dejar ambos saldos como estaban.
- **Validación en dos capas:** el frontend valida para dar feedback inmediato; el backend vuelve a validar todo (nunca confía en el cliente).
- **Errores centralizados:** `AppError(mensaje, status)` + middleware `errorHandler` que traduce a 400/404/500. Express 5 propaga errores de funciones `async` automáticamente.
- **Frontend reactivo sin recargar:** tras cada operación la API devuelve la cuenta actualizada y la transacción creada; `useCuenta.aplicarOperacion` actualiza saldo e historial al instante (con animación en la tarjeta de saldo) y el selector de cuentas se resincroniza.

> **Opcional – habilitar transacciones reales en local:** añade en `mongod.cfg` → `replication: { replSetName: "rs0" }`, reinicia el servicio y ejecuta una vez `mongosh --eval "rs.initiate()"`. Al reiniciar la API verás *"Modo atómico: transacciones multi-documento"*.

---

## 🧪 Guion sugerido para la demostración

1. `npm run seed` y mostrar las colecciones en Compass.
2. Cuenta **1001** → depositar S/ 100 → el saldo y el historial cambian sin recargar.
3. Cuenta **1004** → retirar S/ 999 → alerta *"Saldo insuficiente"* (HTTP 400).
4. Cuenta **1001** → transferir S/ 250 a **1002** → cambiar a 1002 en el selector y ver la *transferencia recibida*.
5. Transferir a **9999** → *"La cuenta destino 9999 no existe"* (HTTP 404).
6. Mostrar en Compass el documento nuevo en `transacciones` y los saldos actualizados en `cuentas`.
7. Reducir el ancho de la ventana para mostrar el diseño responsive (el historial pasa de tabla a tarjetas).
