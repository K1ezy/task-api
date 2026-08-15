# Task API - Node.js, Express, MySQL & JWT

## Overview

This repository contains a RESTful Task CRUD API built with **Node.js** and **Express**, integrated with an existing **MySQL** database running inside a Docker container.

The project demonstrates progressive backend development, transitioning from a single monolithic file to a modular **MVC (Model-View-Controller)** architecture with **JWT authentication** to secure application endpoints.

## Project Structure

```text
task-api/
├── controllers/
│   └── taskController.js     # Business logic & request handling
├── middleware/
│   └── authenticateToken.js  # JWT verification middleware
├── routes/
│   └── authRoutes.js         # Authentication endpoint routes
├── database.js
├── schema.sql
├── server.js                 # App entry point & endpoint registration
├── utils.js                  # Data formatting utility helpers
├── .env                      # DO NOT commit to source control
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Prerequisites

Before running the project, make sure the following software is installed:

* **Node.js** v18 or later
* **npm** (Node Package Manager)
* **Docker Desktop**
* **Git Bash** or another terminal

## Complete Setup Instructions

### Step 1: Navigate to the Project Directory

Open Git Bash or your preferred terminal and navigate to the project directory:

```bash
cd "~/Documents/OJT Activities/task-api"
```

### Step 2: Set Up Node.js Runtime

If you are using **NVM for Windows**, switch to the latest LTS version of Node.js:

```bash
nvm use lts
```

Verify your Node.js and npm versions:

```bash
node --version
npm --version
```

### Step 3: Install Project Dependencies

Install all required project dependencies using npm:

```bash
npm install
```

### Step 4: Start the MySQL Docker Container

Make sure **Docker Desktop** is running.

Then start the existing MySQL container:

```bash
docker start local-mysql
```

### Step 5: Configure Environment Variables

Create a `.env` file in the project root directory.

Example:

```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=ojt_store
JWT_SECRET=your_jwt_secret_key
```

> **Important:** Never commit your `.env` file to GitHub or other public repositories.

Make sure `.env` is included in your `.gitignore` file:

```gitignore
.env
```

### Step 6: Initialize the Database Schema

Make sure the `ojt_store` database and `tasks` table exist in MySQL.

The project includes a `schema.sql` file. A basic version of the schema is shown below:

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO tasks (title, completed) VALUES
  ('Learn Node.js', FALSE),
  ('Connect Express to MySQL', FALSE);
```

### Step 7: Start the Server

Start the development server using:

```bash
npm run dev
```

The API should now be available at:

```text
http://localhost:3000
```

## API Endpoints

### Authentication

| Method | Endpoint         | Description                 | Request Body                        | Status        |
| ------ | ---------------- | --------------------------- | ----------------------------------- | ------------- |
| `POST` | `/auth/register` | Register a new user         | `{"email":"...", "password":"..."}` | `201 Created` |
| `POST` | `/auth/login`    | Login and receive JWT token | `{"email":"...", "password":"..."}` | `200 OK`      |

### Tasks

| Method   | Endpoint     | Description           | Auth Required          | Request Body                            | Status        |
| -------- | ------------ | --------------------- | ---------------------- | --------------------------------------- | ------------- |
| `GET`    | `/`          | Health check          | No                     | N/A                                     | `200 OK`      |
| `GET`    | `/tasks`     | Retrieve all tasks    | No                     | N/A                                     | `200 OK`      |
| `GET`    | `/tasks/:id` | Retrieve a task by ID | No                     | N/A                                     | `200 OK`      |
| `POST`   | `/tasks`     | Create a new task     | **Yes (Bearer Token)** | `{"title":"New Task"}`                  | `201 Created` |
| `PUT`    | `/tasks/:id` | Update a task         | **Yes (Bearer Token)** | `{"title":"Updated", "completed":true}` | `200 OK`      |
| `DELETE` | `/tasks/:id` | Delete a task         | **Yes (Bearer Token)** | N/A                                     | `200 OK`      |

## API Testing

The following examples use `curl` to test the API from a terminal.

### 1. Register a User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### 2. Login and Obtain a Token

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

The login response should contain a JWT access token.

Copy the token and use it in the `Authorization` header when accessing protected endpoints.

### 3. Get All Tasks

```bash
curl http://localhost:3000/tasks
```

### 4. Create a Task

This endpoint requires authentication.

Replace `YOUR_ACCESS_TOKEN` with the JWT token obtained during login.

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"title":"Test MySQL insertion"}'
```

### 5. Update Task Status

This endpoint requires authentication.

```bash
curl -X PUT http://localhost:3000/tasks/3 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"title":"Refactored Task Updated","completed":true}'
```

### 6. Delete a Task

This endpoint requires authentication.

```bash
curl -X DELETE http://localhost:3000/tasks/3 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Architecture & Data Persistence

### In-Memory Storage - Early Stage

In the earlier stage of development, tasks were stored in a local JavaScript array:

```javascript
let tasks = [];
```

Because the data was stored in the application's memory (RAM), all tasks were lost whenever the Node.js application stopped or restarted.

### Persistent MySQL Storage & MVC Architecture

The project was later improved through the following architectural changes:

#### 1. Database Persistence

Tasks are now stored in a **MySQL database** instead of an in-memory JavaScript array.

Express communicates with MySQL using standard SQL operations such as:

* `SELECT`
* `INSERT`
* `UPDATE`
* `DELETE`

This allows task records to persist even when the Node.js application is stopped or restarted.

#### 2. MVC Refactoring

The application was refactored from a monolithic structure into a more modular architecture.

Route and business logic were moved out of `server.js` and placed into:

```text
controllers/taskController.js
```

This keeps `server.js` focused primarily on:

* Application configuration
* Middleware registration
* Route registration
* Server startup

#### 3. Route Protection

JWT authentication middleware is used to protect state-changing endpoints.

The middleware is located at:

```text
middleware/authenticateToken.js
```

The following operations require a valid JWT Bearer token:

* `POST /tasks`
* `PUT /tasks/:id`
* `DELETE /tasks/:id`

Only authenticated requests containing a valid access token are allowed to perform these operations.

## Technologies Used

* **Node.js** - JavaScript runtime
* **Express.js** - Web application framework
* **MySQL** - Relational database
* **Docker** - Containerized MySQL environment
* **JWT (JSON Web Token)** - Authentication and authorization
* **npm** - Package management
* **NVM for Windows** - Node.js version management
* **curl** - API testing

## Security Notes

* Never commit `.env` files to source control.
* Never expose your `JWT_SECRET` publicly.
* Do not use real passwords in example requests.
* Use strong and unique JWT secrets in production.
* Protected API endpoints require a valid Bearer token.

## Development Progression

The project demonstrates the progression of a backend API from a simple implementation to a more structured application:

```text
Monolithic API
      ↓
In-Memory Task Storage
      ↓
MySQL Database Integration
      ↓
MVC Architecture
      ↓
JWT Authentication
      ↓
Protected CRUD Operations
```

This progression demonstrates fundamental backend development concepts including REST API design, database persistence, application architecture, authentication, middleware, and API testing.



# NEW UPDATE
## Architecture & Refactoring Summary

### Model-View-Controller (MVC) Pattern
The backend has been refactored into a clean MVC architecture to ensure strict separation of concerns:

- **`models/Tasks.js` (Model Layer)**: Handles all direct database operations and raw SQL queries (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) using MySQL connection pools.
- **`controllers/taskController.js` (Controller Layer)**: Purely responsible for processing HTTP requests, validating input parameters, invoking Model methods, and returning formatted JSON responses.
- **`server.js` (Entry Point)**: Registers middleware, connects to the database pool, and maps API endpoints to controller actions.
- **`middleware/authenticateToken.js`**: Protects mutation endpoints (`POST`, `PUT`, `DELETE`) by validating JWT Bearer tokens.
- **`utils.js`**: Utility helper functions for consistent JSON formatting across responses.
  
