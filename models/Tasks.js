import pool from '../database.js';

async function getAllTasks() {
  const tasks = await pool.query(
    "SELECT id, title, completed, created_at, updated_at FROM tasks ORDER BY id"
  );
  return tasks[0];
}

async function getTaskById(id) {
  const taskReturned = await pool.execute(
    "SELECT id, title, completed, created_at, updated_at FROM tasks WHERE id = ?",
    [id]
  );
  return taskReturned[0][0]; // Returns the single task object or undefined
}

async function createTask(title) {
  const [result] = await pool.execute(
    "INSERT INTO tasks (title) VALUES (?)",
    [title]
  );
  return getTaskById(result.insertId);
}

async function updateTask(id, title, completed) {
  await pool.execute(
    "UPDATE tasks SET title = ?, completed = ? WHERE id = ?",
    [title, completed, id]
  );
  return getTaskById(id);
}

async function deleteTask(id) {
  const [result] = await pool.execute(
    "DELETE FROM tasks WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
}

export default { 
  getAllTasks, 
  getTaskById, 
  createTask, 
  updateTask, 
  deleteTask 
};