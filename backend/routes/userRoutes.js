import express from 'express';
import { getEmployees, createEmployee } from '../controllers/userController.js';
import { verifyToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/employees', authorizeRoles('Admin'), getEmployees);
router.post('/employees', authorizeRoles('Admin'), createEmployee);

export default router;
