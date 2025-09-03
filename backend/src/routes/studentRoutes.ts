// backend/src/routes/studentRoutes.ts

import express from 'express';
import { 
  createStudent, 
  getStudents, 
  getStudentById, 
  updateStudent, 
  deleteStudent,
  getOwnProfile,
  updateOwnProfile,
  getOwnEnrollments
} from '../controllers/studentController';
import authMiddleware, { authorizeRoles } from '../middlewares/authMiddleware';

const router = express.Router();

// Admin kullanıcılar için rotalar
router.post('/', authMiddleware, authorizeRoles('admin'), createStudent);
router.get('/', authMiddleware, authorizeRoles('admin'), getStudents);
router.get('/:id', authMiddleware, authorizeRoles('admin'), getStudentById);
router.put('/:id', authMiddleware, authorizeRoles('admin'), updateStudent);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteStudent);

// Öğrenci kendi profil yönetimi için rotalar
router.get('/profile/me', authMiddleware, authorizeRoles('student'), getOwnProfile);
router.put('/profile/me', authMiddleware, authorizeRoles('student'), updateOwnProfile);
router.get('/enrollments/me', authMiddleware, authorizeRoles('student'), getOwnEnrollments);

export default router;