# ClarityLoop DB — Persistent Decision Intelligence API

**Decode Labs Full Stack Development Internship — Project 3: Database Integration**

ClarityLoop DB is a database-backed REST API built with **Node.js, Express.js, and Microsoft SQL Server**. It upgrades an earlier decision-tracking backend from file-based storage to relational persistent storage and demonstrates database design, CRUD operations, parameterized queries, transactions, validation, and API testing.

## Key Features

- Microsoft SQL Server relational database
- Full CRUD for decisions
- Parameterized SQL queries
- Transaction-based creation of related records
- Input validation and HTTP error responses
- One-to-many, one-to-one, and many-to-many relationships
- Postman collection for API testing
- SQL scripts for schema, seed data, and verification
- Screenshots documenting successful database and API tests

## Technology Stack

- Node.js
- Express.js
- Microsoft SQL Server
- SQL Server Management Studio (SSMS)
- `mssql`
- `msnodesqlv8`
- ODBC Driver 18 for SQL Server
- Postman
- Git / GitHub

## Database Relationships

```text
Decisions
   │
   ├── 1 : Many ── DecisionOptions
   │
   ├── 1 : 1 ───── Reviews
   │
   └── Many : Many ── DecisionTags ── Tags
```

## API Endpoints

| Operation | Method | Endpoint |
|---|---|---|
| Health Check | GET | `/api/health` |
| Create Decision | POST | `/api/v1/decisions` |
| Read Decisions | GET | `/api/v1/decisions` |
| Update Decision | PUT | `/api/v1/decisions/:id` |
| Delete Decision | DELETE | `/api/v1/decisions/:id` |

## Repository Structure

```text
Task_3_ClarityLoop_DB/
├── database/
│   ├── ClarityLoopDB_Schema.sql
│   ├── ClarityLoopDB_TestData.sql
│   └── ClarityLoopDB_Verification.sql
├── docs/
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_DESIGN.md
│   └── PROJECT_SUMMARY.md
├── postman/
│   └── ClarityLoop_DB_API_Project3.postman_collection.json
├── screenshots/
│   ├── P3_SS_01_Database_Tables.png
│   ├── P3_SS_02_Test_Data_Relationships.png
│   ├── P3_SS_03_Node_SQLServer_Connection.png
│   ├── P3_SS_04_API_Health_SQLServer.png
│   ├── P3_SS_05_CRUD_Read.png
│   ├── P3_SS_06_CRUD_Create.png
│   ├── P3_SS_07_CRUD_Read_After_Create.png
│   ├── P3_SS_08_CRUD_Update.png
│   ├── P3_SS_09_CRUD_Delete.png
│   ├── P3_SS_10_CRUD_Delete_Verification.png
│   └── P3_SS_11_Validation_400.png
├── src/
│   └── db.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
├── test-db.js
└── README.md
```

## Setup

### 1. Create the database

Open **SQL Server Management Studio (SSMS)** and run:

```text
database/ClarityLoopDB_Schema.sql
```

Optionally load sample data:

```text
database/ClarityLoopDB_TestData.sql
```

You can also run:

```text
database/ClarityLoopDB_Verification.sql
```

to verify the schema and relationships.

### 2. Install dependencies

From the repository root:

```bash
npm install
```

### 3. Configure the database connection

Copy `.env.example` to `.env` if you need to override the default local connection string.

The default configuration in `src/db.js` expects:

- SQL Server running locally
- Database name: `ClarityLoopDB`
- Windows Authentication
- ODBC Driver 18 for SQL Server

### 4. Test the connection

```bash
npm run db:test
```

### 5. Start the API

```bash
npm start
```

The API runs at:

```text
http://localhost:5000
```

Health check:

```text
GET http://localhost:5000/api/health
```

## Data Handling and Security

The API uses typed SQL parameters rather than concatenating user input into SQL statements. The CREATE operation uses a SQL transaction so the decision, options, and tags either commit together or roll back together if an error occurs.

The real `.env` file and `node_modules/` directory are excluded through `.gitignore`.

## Manual Testing Evidence

The `screenshots/` folder contains evidence for:

1. Database tables
2. Test data and relationships
3. Node.js ↔ SQL Server connection
4. API health check
5. CRUD — Read
6. CRUD — Create
7. Read after Create
8. CRUD — Update
9. CRUD — Delete
10. Delete verification
11. HTTP 400 validation response

## Postman

Import this collection into Postman:

```text
postman/ClarityLoop_DB_API_Project3.postman_collection.json
```

## Local Database Note

This project currently uses a **local SQL Server instance with Windows Authentication**. Public deployment would require a remotely accessible SQL Server instance and deployment-safe credentials.

## Developer

**Mustafa Tahir**  
Full Stack Development Intern — Decode Labs


## Project Report

[`Mustafa_Tahir_ClarityLoop_DB_Project_3_Report.pdf`](report/Mustafa_Tahir_ClarityLoop_DB_Project_3_Report.pdf)
