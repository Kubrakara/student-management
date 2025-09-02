import { Request, Response } from "express";
import Enrollment from "../models/Enrollment";
import Student from "../models/Student";
import Course from "../models/Course";
import { IRequest } from "../middlewares/authMiddleware";

// Öğrenciyi bir derse kaydetme
export const enrollStudentInCourse = async (req: IRequest, res: Response) => {
  const { courseId } = req.body;
  const studentId = req.user?.userId;

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

// Öğrencinin kayıtlı olduğu dersleri listeleme
export const getMyCourses = async (req: IRequest, res: Response) => {
  const studentId = req.user?.userId;

  try {
    const enrollments = await Enrollment.find({ student: studentId }).populate(
      "course",
      "name"
    );

    const courses = enrollments.map((e) => e.course);
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası." });
  }
};
// Öğrencinin bir dersten kaydını silmesi
export const withdrawFromCourse = async (req: IRequest, res: Response) => {
  const { courseId } = req.params;
  const studentId = req.user?.userId;

  try {
    const enrollment = await Enrollment.findOneAndDelete({
      student: studentId,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Kayıt bulunamadı." });
    }

    res.status(200).json({ message: "Dersten başarıyla çekildiniz." });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası." });
  }
};
