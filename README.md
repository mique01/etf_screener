# ETF Rotation Dashboard

Monorepo con backend en FastAPI y frontend en Next.js para monitorear rotación Value/Growth usando ratios de ETFs.

## Estructura

- `backend/`: API FastAPI (yfinance + cálculos de ratio)
- `web/`: Next.js App Router + Recharts

## Backend local

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend disponible en `http://localhost:8000`.

## Frontend local

```bash
cd web
npm i
npm run dev
```

Frontend disponible en `http://localhost:3000`.

Definí la variable de entorno para apuntar al backend:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Deploy backend en Render (Docker)

1. Crear nuevo **Web Service** en Render conectado a este repo.
2. Seleccionar `backend/Dockerfile`.
3. Exponer puerto `8000` (Render lo enruta automáticamente).
4. Deploy.

## Deploy web en Vercel

1. Importar el repo en Vercel.
2. Configurar **Root Directory** = `web/`.
3. Setear `NEXT_PUBLIC_API_BASE_URL` apuntando al backend desplegado en Render.
4. Deploy.

