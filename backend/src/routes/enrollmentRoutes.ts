import express from "express";
import {
  enrollStudentInCourse,
  getEnrollments,
  withdrawFromCourse,
} from "../controllers/enrollmentController";
import authMiddleware, { authorizeRoles } from "../middlewares/authMiddleware";

const router = express.Router();

// Öğrenciyi derse kaydetme 
router.post(
  "/enroll",
  authMiddleware,
  authorizeRoles("admin"),
  enrollStudentInCourse
);

// Kayıtları silme 
router.delete(
  "/withdraw/:enrollmentId",
  authMiddleware,
  authorizeRoles("admin"),
  withdrawFromCourse
);

// Tüm kayıtları listeleme
router.get("/", authMiddleware, authorizeRoles("admin"), getEnrollments);

export default router;
