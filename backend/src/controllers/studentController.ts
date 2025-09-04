// backend/src/controllers/studentController.ts

import { Request, Response } from 'express';
import Student, { IStudent } from '../models/Student';
import { IRequest } from '../middlewares/authMiddleware';
import User from '../models/User';
import Enrollment from '../models/Enrollment';

// Yeni öğrenci ekle
export const createStudent = async (req: Request, res: Response) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      // Mongoose doğrulama hatasını yakala
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

// Tüm öğrencileri listele (sayfalama ile)
export const getStudents = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  try {
    const students = await Student.find().skip(skip).limit(limit);
    const totalCount = await Student.countDocuments();
    res.status(200).json({ students, totalCount, page, totalPages: Math.ceil(totalCount / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

// Öğrenciyi ID ile getir
export const getStudentById = async (req: Request, res: Response) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Öğrenci bulunamadı.' });
    }
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

// Öğrenciyi güncelle
export const updateStudent = async (req: Request, res: Response) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) {
      return res.status(404).json({ message: 'Öğrenci bulunamadı.' });
    }
    res.status(200).json(student);
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

// Öğrenciyi sil
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Öğrenci bulunamadı.' });
    }
    res.status(200).json({ message: 'Öğrenci başarıyla silindi.' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

// Öğrenci kendi profilini getir
export const getOwnProfile = async (req: IRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Kimlik doğrulama gerekli.' });
    }

    const user = await User.findById(req.user.userId).populate('studentId');
    if (!user || !user.studentId) {
      return res.status(404).json({ message: 'Öğrenci profili bulunamadı.' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      },
      student: user.studentId
    });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

// Öğrenci kendi profilini güncelle
export const updateOwnProfile = async (req: IRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Kimlik doğrulama gerekli.' });
    }

    const user = await User.findById(req.user.userId);
    if (!user || !user.studentId) {
      return res.status(404).json({ message: 'Öğrenci profili bulunamadı.' });
    }

    // Sadece öğrenci bilgilerini güncelle (kullanıcı bilgileri değil)
    const updatedStudent = await Student.findByIdAndUpdate(
      user.studentId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Öğrenci bulunamadı.' });
    }

    res.status(200).json(updatedStudent);
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

// Öğrenci kendi kayıtlarını getir
export const getOwnEnrollments = async (req: IRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Kimlik doğrulama gerekli.' });
    }

    const user = await User.findById(req.user.userId);
    if (!user || !user.studentId) {
      return res.status(404).json({ message: 'Öğrenci profili bulunamadı.' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [enrollments, totalCount] = await Promise.all([
      Enrollment.find({ student: user.studentId })
        .populate('course', 'name')
        .populate('student', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Enrollment.countDocuments({ student: user.studentId })
    ]);

    res.status(200).json({ enrollments, totalCount, page, totalPages: Math.ceil(totalCount / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};