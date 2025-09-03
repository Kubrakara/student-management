import express from "express";
import {
  enrollStudentInCourse,
  getEnrollments,
  withdrawFromCourse,
  selfEnrollInCourse,
  selfWithdrawFromCourse,
  getMyCourses,
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

// Öğrenci kendi kendine derse kaydolur
router.post(
  "/self/enroll",
  authMiddleware,
  authorizeRoles("student"),
  selfEnrollInCourse
);

// Kayıtları silme 
router.delete(
  "/withdraw/:enrollmentId",
  authMiddleware,
  authorizeRoles("admin"),
  withdrawFromCourse
);

// Öğrenci kendi kaydını siler
router.delete(
  "/self/withdraw/:courseId",
  authMiddleware,
  authorizeRoles("student"),
  selfWithdrawFromCourse
);

// Tüm kayıtları listeleme
router.get("/", authMiddleware, authorizeRoles("admin"), getEnrollments);

// Öğrenci kayıtlı derslerini listeler
router.get(
  "/my-courses",
  authMiddleware,
  authorizeRoles("student"),
  getMyCourses
);

export default router;
