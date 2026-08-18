# Windows Setup Guide

This project is designed to work with the same local Microsoft SQL Server setup used in ClarityLoop Project 3.

## First-Time Setup

### 1. Confirm SQL Server is running

Open SQL Server Management Studio and verify you can connect to your local SQL Server instance.

### 2. Confirm the database

The expected database is:

```text
ClarityLoopDB
```

If it does not exist, run:

```text
database/ClarityLoopDB_Schema.sql
```

### 3. Install backend packages

Open Command Prompt in the project folder:

```bat
cd backend
npm install
copy .env.example .env
npm run db:test
```

You should see a successful SQL Server connection.

### 4. Install frontend packages

Open another Command Prompt:

```bat
cd frontend
npm install
copy .env.example .env
```

### 5. Start both sides

You can now double-click:

```text
start-dev.bat
```

or start manually.

Backend:

```bat
cd backend
npm start
```

Frontend:

```bat
cd frontend
npm run dev
```

### 6. Open the dashboard

Normally:

```text
http://localhost:5173
```

The health pill should change from **Service Offline** to **API · DB Connected**.

## If the API is still offline

Check:

- SQL Server service is running
- `ClarityLoopDB` exists
- ODBC Driver 18 is installed
- backend terminal shows `ClarityLoop DB API running on http://localhost:5000`
- `http://localhost:5000/api/health` opens in the browser
- frontend `.env` has `VITE_API_BASE_URL=http://localhost:5000`

## If CORS blocks the request

For local testing, backend `.env` can use:

```env
CORS_ORIGIN=*
```

Restart the backend after changing `.env`.

For final use, prefer explicit frontend origins rather than `*`.
