# Backend Architecture

## Request Flow

```text
Client / Postman
      |
      v
Express Route
      |
      v
Validation
      |
      v
Decision Service
      |
      +---- Read / Write JSON
      |
      v
Structured JSON Response
```

## Main Layers

### API Layer
`app.js` defines HTTP routes, request handling, response status codes and 404 handling.

### Service Layer
`src/decisionService.js` contains reusable logic for:

- decision validation
- review validation
- filtering
- insights calculation
- reading JSON data
- writing JSON data

### Persistence Layer
`data/decisions.json` stores decision records locally.

## Design Choice

JSON persistence was appropriate for Project 2 because the assignment focused on backend API concepts before database integration. Project 3 later replaces this persistence layer with SQL Server.
