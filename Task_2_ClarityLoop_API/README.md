# Task 2 — ClarityLoop Decision Journal API

**DecodeLabs Full Stack Development Internship — Backend API Development**

ClarityLoop Project 2 is a backend REST API developed with **Node.js and Express.js** for recording decisions, reviewing outcomes, filtering decision history, and generating confidence-versus-outcome insights.

## Key Features

- REST API architecture
- JSON request and response handling
- JSON file persistence
- Decision creation and retrieval
- Decision filtering by category and date
- Outcome review endpoint
- Confidence-versus-outcome insights
- Server-side validation
- Structured HTTP error responses
- Postman collection
- Automated tests

## Technology Stack

- Node.js
- Express.js
- JSON
- Postman
- Node Test Runner
- Git / GitHub

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/` | API information |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/v1/decisions` | Retrieve decisions |
| `GET` | `/api/v1/decisions/:id` | Retrieve one decision |
| `POST` | `/api/v1/decisions` | Create a decision |
| `POST` | `/api/v1/decisions/:id/review` | Add an outcome review |
| `GET` | `/api/v1/insights` | Generate decision insights |

## Local Setup

```bash
npm install
npm start
```

Default local URL:

```text
http://localhost:5000
```

## Run Tests

```bash
npm test
```

The final test suite contains **8 passing tests**.

## Persistence

Project 2 intentionally uses JSON file persistence because the milestone focuses on backend API fundamentals. Task 3 later replaces this file-based persistence with Microsoft SQL Server.

## Folder Structure

```text
Task_2_ClarityLoop_API/
├── app.js
├── data/
├── docs/
├── postman/
├── report/
├── screenshots/
├── src/
├── tests/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Report

[`Mustafa_Tahir_Project_2_Report.pdf`](report/Mustafa_Tahir_Project_2_Report.pdf)

## Developer

**Mustafa Tahir**  
Full Stack Development Intern — DecodeLabs  
2026
