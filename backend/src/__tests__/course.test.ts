import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import courseRoutes from '../routes/courseRoutes';
import User from '../models/User';
import Course from '../models/Course';
import { createTestUser, createTestCourse, generateTestToken } from './helpers/testHelpers';


const app = express();
app.use(express.json());
app.use('/api/courses', courseRoutes);

describe('Course API Tests', () => {
  let adminToken: string;
  let studentToken: string;
  let adminUser: any;
  let studentUser: any;

  beforeEach(async () => {
    
    await User.deleteMany({});
    await Course.deleteMany({});

    adminUser = await createTestUser('admin');
    studentUser = await createTestUser('student');
    
    adminToken = generateTestToken((adminUser._id as any).toString(), 'admin');
    studentToken = generateTestToken((studentUser._id as any).toString(), 'student');
  });

  describe('POST /api/courses', () => {
    it('Admin yeni ders oluşturmalı', async () => {
      const courseData = {
        name: 'Matematik 101'
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(courseData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('name', 'Matematik 101');
      expect(response.body).toHaveProperty('_id');
    });

    it('Eksik ders adı ile ders oluşturmamalı', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(500);
    });

    it('Aynı isimde ders oluşturmamalı', async () => {
      await createTestCourse('Matematik 101');

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Matematik 101'
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('message', 'Bu ders adı zaten mevcut.');
    });

    it('Student rolü ders oluşturmamalı', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'Matematik 101'
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Bu işleme yetkiniz yok.');
    });

    it('Token olmadan ders oluşturmamalı', async () => {
      const response = await request(app)
        .post('/api/courses')
        .send({
          name: 'Matematik 101'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Kimlik doğrulama tokenı eksik veya geçersiz.');
    });
  });

  describe('GET /api/courses', () => {
    beforeEach(async () => {
      for (let i = 1; i <= 15; i++) {
        await createTestCourse(`Ders ${i}`);
      }
    });

    it('Admin tüm dersleri listeleme', async () => {
      const response = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('courses');
      expect(response.body).toHaveProperty('totalCount', 15);
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('totalPages', 2);
      expect(response.body.courses).toHaveLength(10); 
    });

    it('Student dersleri listeleme', async () => {
      const response = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('courses');
      expect(response.body.courses).toHaveLength(10);
    });

    it('Sayfalama ile ders listeleme', async () => {
      const response = await request(app)
        .get('/api/courses?page=2&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('page', 2);
      expect(response.body).toHaveProperty('totalPages', 3);
      expect(response.body.courses).toHaveLength(5);
    });

    it('Token olmadan ders listeleme', async () => {
      const response = await request(app)
        .get('/api/courses');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Kimlik doğrulama tokenı eksik veya geçersiz.');
    });
  });

  describe('GET /api/courses/:id', () => {
    it('Admin ders detayını getirmeli', async () => {
      const course = await createTestCourse('Matematik 101');

      const response = await request(app)
        .get(`/api/courses/${course._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', (course._id as any).toString());
      expect(response.body).toHaveProperty('name', 'Matematik 101');
    });

    it('Student ders detayını getirmeli', async () => {
      const course = await createTestCourse('Matematik 101');

      const response = await request(app)
        .get(`/api/courses/${course._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', (course._id as any).toString());
      expect(response.body).toHaveProperty('name', 'Matematik 101');
    });

    it('Mevcut olmayan ders için 404 dönmeli', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/courses/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Ders bulunamadı.');
    });

    it('Geçersiz ID formatı için hata dönmeli', async () => {
      const response = await request(app)
        .get('/api/courses/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(500);
    });
  });

  describe('PUT /api/courses/:id', () => {
    it('Admin ders güncellemeli', async () => {
      const course = await createTestCourse('Matematik 101');

      const updateData = {
        name: 'Matematik 102'
      };

      const response = await request(app)
        .put(`/api/courses/${course._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Matematik 102');
    });

    it('Aynı isimde ders güncelleme', async () => {
      const course1 = await createTestCourse('Matematik 101');
      const course2 = await createTestCourse('Fizik 101');

      const response = await request(app)
        .put(`/api/courses/${course2._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Matematik 101' 
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('message', 'Bu ders adı zaten mevcut.');
    });

    it('Mevcut olmayan ders güncelleme', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/courses/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Yeni Ders'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Ders bulunamadı.');
    });

    it('Student rolü ders güncelleme', async () => {
      const course = await createTestCourse('Matematik 101');

      const response = await request(app)
        .put(`/api/courses/${course._id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'Matematik 102'
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Bu işleme yetkiniz yok.');
    });
  });

  describe('DELETE /api/courses/:id', () => {
    it('Admin ders silmeli', async () => {
      const course = await createTestCourse('Matematik 101');

      const response = await request(app)
        .delete(`/api/courses/${course._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Ders başarıyla silindi.');

      const deletedCourse = await Course.findById(course._id);
      expect(deletedCourse).toBeNull();
    });

    it('Mevcut olmayan ders silme', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/courses/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Ders bulunamadı.');
    });

    it('Student rolü ders silme', async () => {
      const course = await createTestCourse('Matematik 101');

      const response = await request(app)
        .delete(`/api/courses/${course._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Bu işleme yetkiniz yok.');
    });
  });

  describe('GET /api/courses/:courseId/enrollments', () => {
    it('Admin dersin kayıtlarını getirmeli', async () => {
      const course = await createTestCourse('Matematik 101');

      const response = await request(app)
        .get(`/api/courses/${course._id}/enrollments`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('enrollments');
      expect(response.body).toHaveProperty('totalCount');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('totalPages');
    });

    it('Student dersin kayıtlarını getirmemeli', async () => {
      const course = await createTestCourse('Matematik 101');

      const response = await request(app)
        .get(`/api/courses/${course._id}/enrollments`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Bu işleme yetkiniz yok.');
    });
  });
});
