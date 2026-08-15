import utils from '../utils.js';
import Tasks from '../models/Tasks.js';

const getAllTasks = async (request, response) => {
  try { 
    const tasks = await Tasks.getAllTasks();
    const formattedTasks = tasks.map(utils.formatTask);

    response.json(formattedTasks);
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Unable to retrieve tasks" });
  }
};

const getTaskById = async (request, response) => {
  try {
    const id = request.params.id;
    const task = await Tasks.getTaskById(id);

    if (!task) {
      return response.status(404).json({ message: "Task not found" });
    }
    return response.json(utils.formatTask(task));
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Unable to retrieve task" });
  }
};

const createTasks = async (request, response) => {
  try {
    const { title } = request.body;
    if (typeof title !== "string" || !title.trim()) {
      return response.status(400).json({ message: "Title is required" });
    }

    const newTask = await Tasks.createTask(title.trim());
    response.status(201).json(utils.formatTask(newTask));
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Unable to create task" });
  }
};

const updateTask = async (request, response) => {
  try {
    const id = Number(request.params.id);
    const { title, completed } = request.body;

    const currentTask = await Tasks.getTaskById(id);

    if (!currentTask) {
      return response.status(404).json({ message: "Task not found" });
    }

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

    const updatedTask = await Tasks.updateTask(id, updatedTitle, updatedCompleted);
    response.json(utils.formatTask(updatedTask));
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Unable to update task" });
  }
};

const deleteTask = async (request, response) => {
  try {
    const id = Number(request.params.id);
    const isDeleted = await Tasks.deleteTask(id);

    if (!isDeleted) {
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