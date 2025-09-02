// backend/src/routes/courseRoutes.ts

import express from "express";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController";
import authMiddleware, { authorizeRoles } from "../middlewares/authMiddleware";

const router = express.Router();

// Admin kullanıcılar için rotalar
router.post("/", authMiddleware, authorizeRoles("admin"), createCourse);
router.get("/", authMiddleware, authorizeRoles("admin"), getCourses);
router.get("/:id", authMiddleware, authorizeRoles("admin"), getCourseById);
router.put("/:id", authMiddleware, authorizeRoles("admin"), updateCourse);
router.delete("/:id", authMiddleware, authorizeRoles("admin"), deleteCourse);

export default router;
