# DecodeLabs Full Stack Development Internship

This repository contains the projects I completed during my **DecodeLabs Full Stack Development Internship**.

The internship projects follow a clear technical progression from frontend development to backend REST APIs, relational database integration, and finally a complete full stack application.

## Developer

**Mustafa Tahir**  
Full Stack Development Intern  
DecodeLabs  
2026

## Projects

### Task 1 — Industrial Training Dashboard

A responsive frontend dashboard developed using **HTML5, CSS3, and JavaScript** to present internship progress, completed tasks, milestones, and technical skill development.

#### Key Features

- Responsive desktop and mobile layouts
- Completed task board
- Project milestone timeline
- Skill progress indicators
- Task filtering
- Mobile navigation
- Light and dark theme switching
- Client side form validation
- Accessibility improvements
- Testing evidence
- Technical documentation

**Folder**

`Task_1_Industrial_Training_Dashboard/`

---

### Task 2 — ClarityLoop Decision Journal API

A backend REST API developed using **Node.js and Express.js** for recording decisions, reviewing outcomes, and analysing decision confidence.

#### Key Features

- REST API architecture
- GET and POST endpoints
- JSON request and response handling
- JSON file persistence
- Request validation
- Structured error handling
- Decision filtering
- Outcome reviews
- Confidence versus outcome insights
- Postman testing
- Automated testing

**Main Technologies**

`Node.js` `Express.js` `REST API` `JSON` `Postman`

**Folder**

`Task_2_ClarityLoop_API/`

---

### Task 3 — ClarityLoop DB

Task 3 upgraded ClarityLoop from file based persistence to a relational database architecture using **Microsoft SQL Server**.

The Node.js and Express backend communicates directly with `ClarityLoopDB` to perform persistent database operations.

#### Key Features

- Microsoft SQL Server integration
- Relational database design
- Primary and foreign keys
- One to many relationships
- One to one relationships
- Many to many relationships
- Parameterized SQL queries
- SQL transactions
- Persistent CRUD operations
- Database constraints
- Backend validation
- Postman testing
- SQL Server verification

#### Main Database Tables

- `Decisions`
- `DecisionOptions`
- `Reviews`
- `Tags`
- `DecisionTags`

**Main Technologies**

`Node.js` `Express.js` `Microsoft SQL Server` `SSMS` `REST API` `Postman`

**Folder**

`Task_3_ClarityLoop_DB/`

---

### Task 4 — ClarityLoop Full Stack Decision Intelligence

Task 4 completed the ClarityLoop development cycle by connecting a responsive frontend with the existing Express REST API and Microsoft SQL Server database.

The frontend sends asynchronous HTTP requests to the backend, the backend validates and processes those requests, SQL Server stores the data, and the returned JSON responses are displayed dynamically in the user interface.

#### Key Features

- React based frontend
- TypeScript development
- Vite development environment
- Express REST API integration
- Microsoft SQL Server persistence
- Fetch API
- Async and await requests
- JSON request and response handling
- Complete Create, Read, Update, and Delete workflow
- Dynamic dashboard statistics
- Search and filtering
- Confidence tracking
- Decision tags
- Review status management
- Client side validation
- Backend validation
- API and database health monitoring
- Graceful Service Offline state
- Retry functionality
- Light and dark themes
- Responsive desktop and mobile layouts
- Activity timeline
- SQL Server persistence verification

#### Main Technologies

`React` `TypeScript` `Vite` `Node.js` `Express.js` `Microsoft SQL Server` `REST API` `Fetch API`

**Folder**

`Task_4_ClarityLoop_FullStack/`

---

## Development Progression

```text
Task 1
Responsive Frontend Application
HTML5 + CSS3 + JavaScript

        ↓

Task 2
Backend REST API
Node.js + Express.js + JSON

        ↓

Task 3
Database Integration
Node.js + Express.js + Microsoft SQL Server

        ↓

Task 4
Complete Full Stack Application
React + TypeScript + Express.js + Microsoft SQL Server
