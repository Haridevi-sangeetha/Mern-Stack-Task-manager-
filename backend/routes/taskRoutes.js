import express from 'express';
import {
  createTask,
  getAdminTasks,
  getEmployeeTasks,
  updateTaskStatus,
  updateTask,
  deleteTask,
  getTaskStats,
} from '../controllers/taskController.js';
import { verifyToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

// General endpoints
router.get('/stats', getTaskStats);
router.patch('/:id/status', updateTaskStatus);

// Employee endpoints
router.get('/my-tasks', authorizeRoles('Employee', 'Admin'), getEmployeeTasks);

// Admin endpoints
router.get('/admin', authorizeRoles('Admin'), getAdminTasks);
router.post('/', authorizeRoles('Admin'), createTask);
router.put('/:id', authorizeRoles('Admin'), updateTask);
router.delete('/:id', authorizeRoles('Admin'), deleteTask);

export default router;
