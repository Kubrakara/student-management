import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import enrollmentRoutes from '../routes/enrollmentRoutes';
import User from '../models/User';
import Student from '../models/Student';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import { createTestUser, createTestStudent, createTestCourse, generateTestToken } from './helpers/testHelpers';

const app = express();
app.use(express.json());
app.use('/api/enrollments', enrollmentRoutes);

describe('Enrollment API Tests', () => {
  let adminToken: string;
  let studentToken: string;
  let adminUser: any;
  let studentUser: any;
  let testStudent: any;
  let testCourse: any;

  beforeEach(async () => {
    await User.deleteMany({});
    await Student.deleteMany({});
    await Course.deleteMany({});
    await Enrollment.deleteMany({});

    adminUser = await createTestUser('admin');
    studentUser = await createTestUser('student');
    
    adminToken = generateTestToken(adminUser._id.toString(), 'admin');
    studentToken = generateTestToken(studentUser._id.toString(), 'student');

    testStudent = await createTestStudent();
    testCourse = await createTestCourse('Matematik 101');
  });

  describe('POST /api/enrollments/enroll', () => {
    it('Admin öğrenciyi derse kaydetmeli', async () => {
      const response = await request(app)
        .post('/api/enrollments/enroll')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: testStudent._id,
          courseId: testCourse._id
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Öğrenci başarıyla derse kaydedildi.');

      const enrollment = await Enrollment.findOne({
        student: testStudent._id,
        course: testCourse._id
      });
      expect(enrollment).toBeTruthy();
    });

    it('Eksik bilgilerle kayıt oluşturmamalı', async () => {
      const response = await request(app)
        .post('/api/enrollments/enroll')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: testStudent._id
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Öğrenci veya ders bilgileri eksik.');
    });

    it('Mevcut olmayan öğrenci ile kayıt oluşturmamalı', async () => {
      const fakeStudentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post('/api/enrollments/enroll')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: fakeStudentId,
          courseId: testCourse._id
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Öğrenci veya ders bulunamadı.');
    });

    it('Mevcut olmayan ders ile kayıt oluşturmamalı', async () => {
      const fakeCourseId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post('/api/enrollments/enroll')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: testStudent._id,
          courseId: fakeCourseId
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Öğrenci veya ders bulunamadı.');
    });

    it('Aynı öğrenciyi aynı derse tekrar kaydetmemeli', async () => {
      // İlk kayıt
      await request(app)
        .post('/api/enrollments/enroll')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: testStudent._id,
          courseId: testCourse._id
        });

      // İkinci kayıt
      const response = await request(app)
        .post('/api/enrollments/enroll')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: testStudent._id,
          courseId: testCourse._id
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('message', 'Bu öğrenci zaten bu derse kayıtlı.');
    });

    it('Student rolü kayıt oluşturmamalı', async () => {
      const response = await request(app)
        .post('/api/enrollments/enroll')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          studentId: testStudent._id,
          courseId: testCourse._id
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Bu işleme yetkiniz yok.');
    });
  });

  describe('POST /api/enrollments/self/enroll', () => {
    it('Öğrenci kendini derse kaydetmeli', async () => {
      const response = await request(app)
        .post('/api/enrollments/self/enroll')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId: testCourse._id
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Derse başarıyla kaydolundu.');

      // Kaydın oluşturulduğunu kontrol et
      const enrollment = await Enrollment.findOne({
        student: studentUser.studentId,
        course: testCourse._id
      });
      expect(enrollment).toBeTruthy();
    });

    it('Eksik ders bilgisi ile kayıt oluşturmamalı', async () => {
      const response = await request(app)
        .post('/api/enrollments/self/enroll')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Ders bilgisi eksik.');
    });

    it('Mevcut olmayan ders ile kayıt oluşturmamalı', async () => {
      const fakeCourseId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post('/api/enrollments/self/enroll')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId: fakeCourseId
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Ders bulunamadı.');
    });

    it('Aynı derse tekrar kayıt olmamalı', async () => {
      // İlk kayıt
      await request(app)
        .post('/api/enrollments/self/enroll')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId: testCourse._id
        });

      // İkinci kayıt
      const response = await request(app)
        .post('/api/enrollments/self/enroll')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId: testCourse._id
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('message', 'Bu derse zaten kayıtlısınız.');
    });

    it('Admin rolü kendini kaydetmemeli', async () => {
      const response = await request(app)
        .post('/api/enrollments/self/enroll')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          courseId: testCourse._id
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Bu işleme yetkiniz yok.');
    });
  });

  describe('GET /api/enrollments', () => {
    beforeEach(async () => {
      for (let i = 1; i <= 15; i++) {
        const student = await createTestStudent();
        const course = await createTestCourse(`Ders ${i}`);
        const enrollment = new Enrollment({
          student: student._id,
          course: course._id
        });
        await enrollment.save();
      }
    });

    it('Admin tüm kayıtları listeleme', async () => {
      const response = await request(app)
        .get('/api/enrollments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('enrollments');
      expect(response.body).toHaveProperty('totalCount', 15);
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('totalPages', 2);
      expect(response.body.enrollments).toHaveLength(10); 
    });

    it('Sayfalama ile kayıt listeleme', async () => {
      const response = await request(app)
        .get('/api/enrollments?page=2&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('page', 2);
      expect(response.body).toHaveProperty('totalPages', 3);
      expect(response.body.enrollments).toHaveLength(5);
    });

    it('Student rolü kayıt listeleme', async () => {
      const response = await request(app)
        .get('/api/enrollments')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Bu işleme yetkiniz yok.');
    });
  });

  describe('GET /api/enrollments/my-courses', () => {
    it('Öğrenci kendi derslerini listeleme', async () => {
      const enrollment = new Enrollment({
        student: studentUser.studentId,
        course: testCourse._id
      });
      await enrollment.save();

      const response = await request(app)
        .get('/api/enrollments/my-courses')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('name', 'Matematik 101');
    });

    it('Admin rolü kendi derslerini listeleme', async () => {
      const response = await request(app)
        .get('/api/enrollments/my-courses')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Bu işleme yetkiniz yok.');
    });
  });

  describe('DELETE /api/enrollments/withdraw/:enrollmentId', () => {
    it('Admin kayıt silmeli', async () => {
      const enrollment = new Enrollment({
        student: testStudent._id,
        course: testCourse._id
      });
      await enrollment.save();

      const response = await request(app)
        .delete(`/api/enrollments/withdraw/${enrollment._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Kayıt başarıyla silindi.');

      const deletedEnrollment = await Enrollment.findById(enrollment._id);
      expect(deletedEnrollment).toBeNull();
    });

    it('Mevcut olmayan kayıt silme', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/enrollments/withdraw/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Kayıt bulunamadı.');
    });

    it('Student rolü kayıt silme', async () => {
      const enrollment = new Enrollment({
        student: testStudent._id,
        course: testCourse._id
      });
      await enrollment.save();

      const response = await request(app)
        .delete(`/api/enrollments/withdraw/${enrollment._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Bu işleme yetkiniz yok.');
    });
  });

  describe('DELETE /api/enrollments/self/withdraw/:courseId', () => {
    it('Öğrenci kendi kaydını silmeli', async () => {
      const enrollment = new Enrollment({
        student: studentUser.studentId,
        course: testCourse._id
      });
      await enrollment.save();

      const response = await request(app)
        .delete(`/api/enrollments/self/withdraw/${testCourse._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Kayıt başarıyla silindi.');

      const deletedEnrollment = await Enrollment.findOne({
        student: studentUser.studentId,
        course: testCourse._id
      });
      expect(deletedEnrollment).toBeNull();
    });

    it('Mevcut olmayan kayıt silme', async () => {
      const fakeCourseId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/enrollments/self/withdraw/${fakeCourseId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Kayıt bulunamadı.');
    });

    it('Admin rolü kendi kaydını silme', async () => {
      const response = await request(app)
        .delete(`/api/enrollments/self/withdraw/${testCourse._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Bu işleme yetkiniz yok.');
    });
  });
});
