import 'dotenv/config';
import express from 'express';
import pool from './database.js';
import cors from 'cors';
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(cors());

function formatTask(task) {
  return {
    ...task,
    completed: Boolean(task.completed),
  };
}

app.get("/", (request, response) => {
  response.json({ message: "Task API is running" });
});

// Get all tasks from MySQL
app.get("/tasks", async (request, response) => {
  try {
    const [tasks] = await pool.query(
      "SELECT id, title, completed, created_at, updated_at FROM tasks ORDER BY id"
    );
    response.json(tasks.map(formatTask));
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Unable to retrieve tasks" });
  }
});

// Get one task from MySQL
app.get("/tasks/:id", async (request, response) => {
  try {
    const id = Number(request.params.id);
    const [tasks] = await pool.execute(
      "SELECT id, title, completed, created_at, updated_at FROM tasks WHERE id = ?",
      [id]
    );
    if (tasks.length === 0) {
      return response.status(404).json({ message: "Task not found" });
    }
    response.json(formatTask(tasks[0]));
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Unable to retrieve task" });
  }
});

// Create a task in MySQL
app.post("/tasks", async (request, response) => {
  try {
    const { title } = request.body;
    if (typeof title !== "string" || !title.trim()) {
      return response.status(400).json({ message: "Title is required" });
    }
    const [result] = await pool.execute(
      "INSERT INTO tasks (title) VALUES (?)",
      [title.trim()]
    );
    const [tasks] = await pool.execute(
      "SELECT id, title, completed, created_at, updated_at FROM tasks WHERE id = ?",
      [result.insertId]
    );
    response.status(201).json(formatTask(tasks[0]));
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Unable to create task" });
  }
});

// Update a task in MySQL
app.put("/tasks/:id", async (request, response) => {
  try {
    const id = Number(request.params.id);
    const { title, completed } = request.body;

    const [existingTasks] = await pool.execute(
      "SELECT id, title, completed FROM tasks WHERE id = ?",
      [id]
    );

    if (existingTasks.length === 0) {
      return response.status(404).json({ message: "Task not found" });
    }

    const currentTask = existingTasks[0];
    let updatedTitle = currentTask.title;
    let updatedCompleted = Boolean(currentTask.completed);

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return response.status(400).json({ message: "Title must be a non-empty string" });
      }
      updatedTitle = title.trim();
    }

    if (completed !== undefined) {
      if (typeof completed !== "boolean") {
        return response.status(400).json({ message: "Completed must be a boolean" });
      }
      updatedCompleted = completed;
    }

    await pool.execute(
      "UPDATE tasks SET title = ?, completed = ? WHERE id = ?",
      [updatedTitle, updatedCompleted, id]
    );

    const [tasks] = await pool.execute(
      "SELECT id, title, completed, created_at, updated_at FROM tasks WHERE id = ?",
      [id]
    );
    response.json(formatTask(tasks[0]));
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Unable to update task" });
  }
});

// Delete a task from MySQL
app.delete("/tasks/:id", async (request, response) => {
  try {
    const id = Number(request.params.id);
    const [result] = await pool.execute(
      "DELETE FROM tasks WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return response.status(404).json({ message: "Task not found" });
    }

    response.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Unable to delete task" });
  }
});

async function startServer() {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to MySQL successfully");
    connection.release();

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to MySQL:", error.message);
    process.exit(1);
  }
}

startServer();