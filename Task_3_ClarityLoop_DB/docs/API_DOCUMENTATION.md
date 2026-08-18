# API Documentation

Base URL: `http://localhost:5000`

## Health
`GET /api/health`

## Read All Decisions
`GET /api/v1/decisions`

Success: `200 OK`

## Create Decision
`POST /api/v1/decisions`

Example:
```json
{
  "title": "Choose my next backend learning topic",
  "context": "I have connected Node.js with SQL Server and want to continue improving backend development.",
  "reasoning": "Learning authentication after database integration will help me understand complete backend application flow.",
  "confidence": 88,
  "reviewDate": "2026-08-20",
  "options": ["Learn authentication", "Learn caching", "Learn WebSockets"],
  "selectedOption": "Learn authentication",
  "tags": ["backend", "learning"]
}
```

Success: `201 Created`

## Update Decision
`PUT /api/v1/decisions/:id`

Success: `200 OK`

Unknown record: `404 Not Found`

## Delete Decision
`DELETE /api/v1/decisions/:id`

Success: `200 OK`

Related options, reviews, and decision-tag rows are removed through cascading foreign keys.

## Validation
Invalid confidence values return `400 Bad Request`.

The backend uses parameterized SQL inputs and transactions for proper data handling.
