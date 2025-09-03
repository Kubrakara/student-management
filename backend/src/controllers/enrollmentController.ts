import { Request, Response } from "express";
import Enrollment from "../models/Enrollment";
import Student from "../models/Student";
import Course from "../models/Course";
import { IRequest } from "../middlewares/authMiddleware";
import User from "../models/User";

// Admin öğrenciyi bir derse kaydeder
export const enrollStudentInCourse = async (req: IRequest, res: Response) => {
  const { studentId, courseId } = req.body;

  if (!studentId || !courseId) {
    return res
      .status(400)
      .json({ message: "Öğrenci veya ders bilgileri eksik." });
  }

  try {
    const student = await Student.findById(studentId);
    const course = await Course.findById(courseId);
    if (!student || !course) {
      return res.status(404).json({ message: "Öğrenci veya ders bulunamadı." });
    }

    const enrollment = new Enrollment({ student: studentId, course: courseId });
    await enrollment.save();

    res.status(201).json({ message: "Öğrenci başarıyla derse kaydedildi." });
  } catch (err: any) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "Bu öğrenci zaten bu derse kayıtlı." });
    }
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Öğrencinin kendi kendine derse kaydolması
export const selfEnrollInCourse = async (req: IRequest, res: Response) => {
  const { courseId } = req.body;

  if (!courseId) {
    return res.status(400).json({ message: "Ders bilgisi eksik." });
  }

  try {
    const userId = req.user?.userId;
    const user = await User.findById(userId);
    if (!user || !user.studentId) {
      return res.status(404).json({ message: "Öğrenci bulunamadı." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Ders bulunamadı." });
    }

    const enrollment = new Enrollment({ student: user.studentId, course: courseId });
    await enrollment.save();

    res.status(201).json({ message: "Derse başarıyla kaydolundu." });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Bu derse zaten kayıtlısınız." });
    }
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Admin tüm kayıtları listeler
export const getEnrollments = async (req: IRequest, res: Response) => {
  try {
    const enrollments = await Enrollment.find()
      .populate("student", "firstName lastName")
      .populate("course", "name");

    res.status(200).json(enrollments);
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Admin bir kaydı siler
export const withdrawFromCourse = async (req: IRequest, res: Response) => {
  const { enrollmentId } = req.params;

  try {
    const enrollment = await Enrollment.findByIdAndDelete(enrollmentId);

    if (!enrollment) {
      return res.status(404).json({ message: "Kayıt bulunamadı." });
    }

    res.status(200).json({ message: "Kayıt başarıyla silindi." });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Öğrencinin kendi kaydını silmesi
export const selfWithdrawFromCourse = async (req: IRequest, res: Response) => {
  const { courseId } = req.params;

  try {
    const userId = req.user?.userId;
    const user = await User.findById(userId);
    if (!user || !user.studentId) {
      return res.status(404).json({ message: "Öğrenci bulunamadı." });
    }

    const result = await Enrollment.deleteOne({ student: user.studentId, course: courseId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Kayıt bulunamadı." });
    }

    res.status(200).json({ message: "Kayıt başarıyla silindi." });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Öğrencinin kayıtlı derslerini listelemesi
export const getMyCourses = async (req: IRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const user = await User.findById(userId);
    if (!user || !user.studentId) {
      return res.status(404).json({ message: "Öğrenci bulunamadı." });
    }

    const enrollments = await Enrollment.find({ student: user.studentId }).populate("course", "name");
    const courses = enrollments.map((e) => ({
      _id: (e.course as any)._id,
      name: (e.course as any).name,
    }));

    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası." });
  }
};
