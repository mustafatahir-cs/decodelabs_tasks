# Project 4 API Integration

## Frontend Service Layer

All browser requests are centralized in:

```text
frontend/src/services/api.ts
```

The service uses the Fetch API and `async` / `await`.

## Data Flow

```text
User Action
   ↓
React Component
   ↓
API service
   ↓
Express route
   ↓
SQL Server
   ↓
JSON response
   ↓
Normalized Decision object
   ↓
Dynamic UI update
```

## Decision Payload

The frontend sends:

```json
{
  "title": "Choose my next backend topic",
  "context": "I completed database integration.",
  "reasoning": "Authentication is the next logical step.",
  "confidence": 88,
  "options": [
    "Learn authentication",
    "Learn caching",
    "Learn WebSockets"
  ],
  "selectedOption": "Learn authentication",
  "tags": ["backend", "learning"],
  "reviewDate": "2026-09-01",
  "reviewStatus": "pending"
}
```

## Backend Response

The Project 4 backend now returns a complete decision graph, including its related SQL Server options and tags:

```json
{
  "id": "GUID",
  "title": "Choose my next backend topic",
  "context": "I completed database integration.",
  "reasoning": "Authentication is the next logical step.",
  "confidence": 88,
  "options": [
    {
      "id": "GUID",
      "label": "Learn authentication",
      "isSelected": true
    }
  ],
  "selectedOption": "Learn authentication",
  "tags": ["backend", "learning"],
  "reviewDate": "2026-09-01",
  "reviewStatus": "pending",
  "createdAt": "2026-08-18T10:00:00.000Z",
  "updatedAt": "2026-08-18T10:00:00.000Z"
}
```

## Integration Improvements Over Project 3

Project 3 already supported SQL Server CRUD, but its list response returned only columns from the `Decisions` table. Project 4 needs enough related data to render options, tags and selected choices in the UI, so the API now assembles these relational records into one JSON decision object.

The UPDATE route also refreshes the related options and tags transactionally so edits made in the frontend remain consistent in SQL Server.
