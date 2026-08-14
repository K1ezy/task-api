import utils from '../utils.js';
import Tasks from '../models/Tasks.js'; 
import pool from '../database.js';

const getAllTasks = async (request, response) => {
  try { 
    const tasks = await Tasks.getAllTasks() 
    const formattedTasks = tasks.map(utils.formatTask);


    response.json(formattedTasks);
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Unable to retrieve tasks" });
  }
}

const getTaskById = async (request, response) => {
  try {
    const id = request.params.id
    const task = await Tasks.getTaskById(id)

    if (!task) {
      return response.status(404).json({ message: "Task not found" });
    }
    return response.json(utils.formatTask(task));
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Unable to retrieve task" });
  }

}

const createTasks = async (request, response) => {
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
    response.status(201).json(utils.formatTask(tasks[0]));
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Unable to create task" });
  }
}

const updateTask = async (request, response) => {
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
    response.json(utils.formatTask(tasks[0]));
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Unable to update task" });
  }
};

const deleteTask = async (request, response) => {
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
};

const taskController = {
  getAllTasks,
  getTaskById,
  createTasks,
  updateTask,
  deleteTask
};

export default taskController;