import pool from '../database.js';

async function getAllTasks(){
     const tasks = await pool.query(
      "SELECT id, title, completed, created_at, updated_at FROM tasks ORDER BY id"
    ); 
     console.log("This is from model", tasks);
    return tasks[0]       
}

async function getTaskById(id){
      const taskReturned = await pool.execute(
      "SELECT id, title, completed, created_at, updated_at FROM tasks WHERE id = ?",
      [id]
    );
      console.log("This is from model", taskReturned);
      return taskReturned[0]
}

export default{getAllTasks, getTaskById}