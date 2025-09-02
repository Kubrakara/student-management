import express from 'express';
import { enrollStudentInCourse, getMyCourses, withdrawFromCourse } from '../controllers/enrollmentController';
import authMiddleware, { authorizeRoles } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/enroll', authMiddleware, authorizeRoles('student'), enrollStudentInCourse);
router.get('/my-courses', authMiddleware, authorizeRoles('student'), getMyCourses);
router.delete('/withdraw/:courseId', authMiddleware, authorizeRoles('student'), withdrawFromCourse);

export default router;