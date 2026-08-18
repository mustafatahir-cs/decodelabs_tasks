# Deployment Notes

## Project 2 Deployment

During the internship, ClarityLoop Project 2 was deployed as a Node.js backend service on Railway.

Previously used live API base:

`https://clarityloop-api-production.up.railway.app`

## Local Deployment

```bash
npm install
npm start
```

Default port:

`5000`

## Railway-style Deployment Requirements

- Node.js runtime
- `npm install`
- Start command: `npm start`
- Environment variable: `PORT` supplied by the hosting platform
- Writable/persistent file storage should not be assumed for production JSON persistence

## Important Limitation

Project 2 uses `data/decisions.json` for lightweight persistence. On some cloud platforms, local filesystem changes may be ephemeral. This is acceptable for demonstrating the Project 2 backend API concept, while Project 3 solves persistence more formally through SQL Server.
