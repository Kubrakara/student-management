// backend/src/controllers/userController.ts

import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import Student from '../models/Student';

// Tüm kullanıcıları listele (admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Kullanıcıları öğrenci bilgileri ile birlikte getir
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      {
        $unwind: {
          path: '$student',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          studentName: {
            $cond: {
              if: { $ne: ['$student', null] },
              then: { $concat: ['$student.firstName', ' ', '$student.lastName'] },
              else: 'Öğrenci bilgisi yok'
            }
          },
          studentBirthDate: '$student.birthDate'
        }
      },
      {
        $project: {
          password: 0, // Şifreyi gizle
          student: 0
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]);

    const totalCount = await User.countDocuments();

    res.status(200).json({
      users,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (err) {
    console.error('Kullanıcı listeleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

// Kullanıcı detayını getir
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('studentId')
      .select('-password'); // Şifreyi gizle

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error('Kullanıcı getirme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

// Kullanıcı istatistikleri
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const studentUsers = await User.countDocuments({ role: 'student' });
    const usersWithStudent = await User.countDocuments({ studentId: { $exists: true, $ne: null } });
    const usersWithoutStudent = totalUsers - usersWithStudent;

    res.status(200).json({
      totalUsers,
      adminUsers,
      studentUsers,
      usersWithStudent,
      usersWithoutStudent,
      orphanedUsers: usersWithoutStudent
    });
  } catch (err) {
    console.error('Kullanıcı istatistik hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};
