// backend/src/controllers/courseController.ts

import { Request, Response } from 'express';
import Course, { ICourse } from '../models/Course';
import { IRequest } from '../middlewares/authMiddleware';
import Enrollment from '../models/Enrollment';

// Yeni ders ekle
export const createCourse = async (req: Request, res: Response) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (err: any) {
    if (err.code === 11000) {
      // MongoDB'nin unique index hatasını yakala (ders adı benzersiz değilse)
      return res.status(409).json({ message: 'Bu ders adı zaten mevcut.' });
    }
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

// Tüm dersleri listele (sayfalama ile)
export const getCourses = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  try {
    const courses = await Course.find().skip(skip).limit(limit);
    const totalCount = await Course.countDocuments();
    res.status(200).json({ courses, totalCount, page, totalPages: Math.ceil(totalCount / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

// Dersin detaylarını ID ile getir
export const getCourseById = async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Ders bulunamadı.' });
    }
    res.status(200).json(course);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

// Ders bilgilerini güncelle
export const updateCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) {
      return res.status(404).json({ message: 'Ders bulunamadı.' });
    }
    res.status(200).json(course);
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Bu ders adı zaten mevcut.' });
    }
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

// Ders kaydını sil
export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Ders bulunamadı.' });
    }
    res.status(200).json({ message: 'Ders başarıyla silindi.' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

// Dersin kayıtlı öğrencilerini getir
export const getCourseEnrollments = async (req: Request, res: Response) => {
  try {
    const courseId = req.params.courseId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [enrollments, totalCount] = await Promise.all([
      Enrollment.find({ course: courseId })
        .populate('student', 'firstName lastName')
        .populate('course', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Enrollment.countDocuments({ course: courseId })
    ]);

    res.status(200).json({ enrollments, totalCount, page, totalPages: Math.ceil(totalCount / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};