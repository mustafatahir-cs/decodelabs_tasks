# API Documentation

Base URL (local):

`http://localhost:5000`

Previously deployed Project 2 service:

`https://clarityloop-api-production.up.railway.app`

## 1. Health Check

**GET** `/api/health`

Purpose: confirm that the API process is running.

Typical response:

```json
{
  "success": true,
  "message": "ClarityLoop API is healthy.",
  "timestamp": "2026-08-10T12:00:00.000Z"
}
```

Status: `200 OK`

## 2. Retrieve Decisions

**GET** `/api/v1/decisions`

Optional query parameters:

- `category`
- `from`
- `to`

Example:

`GET /api/v1/decisions?category=backend`

Status: `200 OK`

## 3. Retrieve Decision by ID

**GET** `/api/v1/decisions/:id`

Success: `200 OK`

Unknown record: `404 Not Found`

## 4. Create Decision

**POST** `/api/v1/decisions`

Example body:

```json
{
  "title": "Choose next backend topic",
  "category": "backend",
  "context": "I want to continue improving backend development.",
  "options": [
    "Authentication",
    "Caching",
    "WebSockets"
  ],
  "selectedOption": "Authentication",
  "reasoning": "Authentication is the best next step.",
  "confidence": 88
}
```

Success: `201 Created`

Validation errors: `400 Bad Request`

## 5. Add Outcome Review

**POST** `/api/v1/decisions/:id/review`

Example body:

```json
{
  "outcome": "positive",
  "outcomeScore": 9,
  "actualOutcome": "The selected option worked well.",
  "lessonLearned": "The original reasoning was accurate."
}
```

Success: `200 OK`

## 6. Insights

**GET** `/api/v1/insights`

Returns:

- total decisions
- reviewed decisions
- average confidence
- average outcome score
- confidence-outcome gap
- outcome breakdown

## Error Handling

Unknown routes return:

```json
{
  "success": false,
  "message": "Route not found."
}
```

Status: `404 Not Found`
