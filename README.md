# Task API - Node.js, Express & MySQL

## Overview

This repository contains a RESTful Task CRUD API built with Node.js and Express, integrated with an existing MySQL database running inside a Docker container.

The project demonstrates progressive backend development, transitioning from an in-memory JavaScript array (volatile storage) to persistent MySQL database storage.

## Project Structure

```text
task-api/
├── database.js
├── schema.sql
├── server.js
├── .env              # DO NOT commit to source control
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Prerequisites

- **Node.js** v18 or later
- **npm** (Node Package Manager)
- **Docker Desktop**
- **Git Bash** or another terminal

## Complete Setup Instructions

### Step 1: Navigate to the Project Directory

```bash
cd "~/Documents/OJT Activities/task-api"
```

### Step 2: Set Up Node.js Runtime

If you are using NVM for Windows:

```bash
nvm use lts
```

Verify your Node.js and npm versions:

```bash
node --version
npm --version
```

### Step 3: Install Project Dependencies

Run:

```bash
npm install
```

### Step 4: Start the MySQL Docker Container

Make sure Docker Desktop is running.

Then start your MySQL container:

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
```

> **Important:** Never commit your `.env` file to GitHub or other public repositories.

### Step 6: Initialize the Database Schema

Make sure the `ojt_store` database and `tasks` table exist in MySQL.

Example `schema.sql`:

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

Run:

```bash
npm run dev
```

The API should be available at:

```text
http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Description | Request Body | Status |
|---|---|---|---|---|
| GET | `/` | Health check | N/A | `200 OK` |
| GET | `/tasks` | Retrieve all tasks | N/A | `200 OK` |
| GET | `/tasks/:id` | Retrieve a task by ID | N/A | `200 OK` |
| POST | `/tasks` | Create a new task | `{"title":"New Task"}` | `201 Created` |
| PUT | `/tasks/:id` | Update a task | `{"completed":true}` | `200 OK` |
| DELETE | `/tasks/:id` | Delete a task | N/A | `200 OK` |

## API Testing

### Get All Tasks

```bash
curl http://localhost:3000/tasks
```

### Create a Task

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test MySQL insertion"}'
```

### Update Task Status

```bash
curl -X PUT http://localhost:3000/tasks/3 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

### Delete a Task

```bash
curl -X DELETE http://localhost:3000/tasks/3
```

## Data Persistence Explanation

### In-Memory Storage

In the earlier stage of development, tasks were stored in a local JavaScript array:

```javascript
let tasks = [];
```

Because the data was stored in the application's memory (RAM), all tasks were lost whenever the Node.js application stopped or restarted.

### MySQL Database Storage

The current implementation stores tasks in a MySQL database running inside a Docker container.

Express communicates with MySQL using SQL queries such as:

- `SELECT`
- `INSERT`
- `UPDATE`
- `DELETE`

The MySQL database runs separately from the Node.js application. Therefore, restarting the Express server does not delete the stored task records.

This provides persistent data storage across application restarts.