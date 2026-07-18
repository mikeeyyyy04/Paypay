# Paypay

Paypay is split into separate frontend and backend folders.

## Folder Structure

```text
Paypay/
  frontend/          React + TypeScript + Vite admin app
    src/
      auth/          Auth context and protected route
      components/    Shared UI components
      data/          Starter frontend data
      layouts/       Admin shell/navigation
      pages/         Login, dashboard, classes, orders
      api.ts         Backend API client
      types.ts       Shared frontend types
  backend/           Node API server
    data/db.json     Simple JSON database for development
    src/             Server, auth, HTTP helpers, database helpers
```

## Login

The backend includes one development admin account:

- Email: `admin@paypay.local`
- Password: `Admin123!`

## Run

From the project root:

```bash
npm run dev:backend
npm run dev:frontend
```

Or run each app directly:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

The frontend calls `http://localhost:3000/api` by default. Set `VITE_API_BASE_URL` in `frontend/.env` if your backend URL changes.

## Backend Auth API

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

The JSON database is meant for local development and easy debugging. For production, replace it with a real database and hashed passwords.
