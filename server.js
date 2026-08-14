import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import pool from './database.js';
import authenticateToken from './middleware/authenticateToken.js';
import taskController from './controllers/taskController.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(cors());

// Mount Authentication Routes (/auth/register and /auth/login)
app.use('/auth', authRoutes);

app.get("/", (request, response) => {
  response.json({ message: "Task API is running" });
});

// PUBLIC: Get all tasks from MySQL
app.get("/tasks", taskController.getAllTasks); 

app.get("/tasks/:id", taskController.getTaskById);

// app.post(route, middleware, controller)

app.post("/tasks", authenticateToken, taskController.createTasks);

// PROTECTED: Update a task in MySQL (Requires valid JWT)
app.put("/tasks/:id", authenticateToken, taskController.updateTask);

// PROTECTED: Delete a task from MySQL (Requires valid JWT)
app.delete("/tasks/:id", authenticateToken, taskController.deleteTask);

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