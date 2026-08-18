# ClarityLoop Frontend

React + Vite + TypeScript frontend for ClarityLoop Project 4.

## Run locally

```bash
npm install
copy .env.example .env
npm run dev
```

Default frontend URL:

```text
http://localhost:5173
```

The frontend expects the ClarityLoop REST API at the URL configured by `VITE_API_BASE_URL`.

## Main Areas

- Overview dashboard
- Decisions workspace
- New Decision form
- Insights
- Activity
- API/database status handling
- Responsive navigation and mobile layouts

All persistent decision data is read and modified through the ClarityLoop REST API.
