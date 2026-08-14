
 function formatTask(task) {
  return {
    ...task,
    completed: Boolean(task.completed),
  };
}
export default {formatTask}