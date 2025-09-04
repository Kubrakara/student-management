// backend/src/routes/userRoutes.ts

import express from 'express';
import { getAllUsers, getUserById, getUserStats } from '../controllers/userController';
import authMiddleware, { authorizeRoles } from '../middlewares/authMiddleware';

const router = express.Router();

// Admin kullanıcılar için rotalar
router.get('/', authMiddleware, authorizeRoles('admin'), getAllUsers);
router.get('/stats', authMiddleware, authorizeRoles('admin'), getUserStats);
router.get('/:id', authMiddleware, authorizeRoles('admin'), getUserById);

export default router;
