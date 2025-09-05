import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import studentRoutes from '../routes/studentRoutes';
import User from '../models/User';
import Student from '../models/Student';
import { createTestUser, createTestStudent, generateTestToken } from './helpers/testHelpers';

const app = express();
app.use(express.json());
app.use('/api/students', studentRoutes);

describe('Student API Tests', () => {
  let adminToken: string;
  let studentToken: string;
  let adminUser: any;
  let studentUser: any;

  beforeEach(async () => {
    await User.deleteMany({});
    await Student.deleteMany({});

    adminUser = await createTestUser('admin');
    studentUser = await createTestUser('student');
    
    adminToken = generateTestToken((adminUser._id as any).toString(), 'admin');
    studentToken = generateTestToken((studentUser._id as any).toString(), 'student');
  });

  describe('POST /api/students', () => {
    it('Admin yeni öğrenci oluşturmalı', async () => {
      const studentData = {
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        birthDate: '1995-05-15'
      };

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(studentData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('firstName', 'Ahmet');
      expect(response.body).toHaveProperty('lastName', 'Yılmaz');
      expect(response.body).toHaveProperty('_id');
    });

    it('Eksik alanlarla öğrenci oluşturmamalı', async () => {
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Ahmet'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Soyadı alanı zorunludur');
    });

    it('Geçersiz doğum tarihi ile öğrenci oluşturmamalı', async () => {
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Ahmet',
          lastName: 'Yılmaz',
          birthDate: '2030-01-01'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Doğum tarihi bugünden sonraki bir tarih olamaz');
    });

    it('Student rolü öğrenci oluşturmamalı', async () => {
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          firstName: 'Ahmet',
          lastName: 'Yılmaz',
          birthDate: '1995-05-15'
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Bu işleme yetkiniz yok.');
    });

    it('Token olmadan öğrenci oluşturmamalı', async () => {
      const response = await request(app)
        .post('/api/students')
        .send({
          firstName: 'Ahmet',
          lastName: 'Yılmaz',
          birthDate: '1995-05-15'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Kimlik doğrulama tokenı eksik veya geçersiz.');
    });
  });

  describe('GET /api/students', () => {
    beforeEach(async () => {
      for (let i = 1; i <= 15; i++) {
        await createTestStudent();
      }
    });

    it('Admin tüm öğrencileri listeleme', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('students');
      expect(response.body).toHaveProperty('totalCount');
      expect(response.body.totalCount).toBeGreaterThanOrEqual(15);
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body.students).toHaveLength(10); 
    });

    it('Sayfalama ile öğrenci listeleme', async () => {
      const response = await request(app)
        .get('/api/students?page=2&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('page', 2);
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body.totalPages).toBeGreaterThanOrEqual(3);
      expect(response.body.students).toHaveLength(5);
    });

    it('Student rolü öğrenci listeleme', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Bu işleme yetkiniz yok.');
    });
  });

  describe('GET /api/students/:id', () => {
    it('Admin öğrenci detayını getirmeli', async () => {
      const student = await createTestStudent();

      const response = await request(app)
        .get(`/api/students/${student._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', (student._id as any).toString());
      expect(response.body).toHaveProperty('firstName', 'Test');
      expect(response.body).toHaveProperty('lastName', 'Student');
    });

    it('Mevcut olmayan öğrenci için 404 dönmeli', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/students/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Öğrenci bulunamadı.');
    });

    it('Geçersiz ID formatı için hata dönmeli', async () => {
      const response = await request(app)
        .get('/api/students/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(500);
    });
  });

  describe('PUT /api/students/:id', () => {
    it('Admin öğrenci güncellemeli', async () => {
      const student = await createTestStudent();

      const updateData = {
        firstName: 'Güncellenmiş',
        lastName: 'İsim',
        birthDate: '1990-01-01'
      };

      const response = await request(app)
        .put(`/api/students/${student._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('firstName', 'Güncellenmiş');
      expect(response.body).toHaveProperty('lastName', 'İsim');
    });

    it('Mevcut olmayan öğrenci güncelleme', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/students/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Test'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Öğrenci bulunamadı.');
    });
  });

  describe('DELETE /api/students/:id', () => {
    it('Admin öğrenci silmeli', async () => {
      const student = await createTestStudent();

      const response = await request(app)
        .delete(`/api/students/${student._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Öğrenci ve ilgili tüm kayıtlar başarıyla silindi.');

      const deletedStudent = await Student.findById(student._id);
      expect(deletedStudent).toBeNull();
    });

    it('Mevcut olmayan öğrenci silme', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/students/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Öğrenci bulunamadı.');
    });
  });

  describe('GET /api/students/profile/me', () => {
    it('Öğrenci kendi profilini getirmeli', async () => {
      const response = await request(app)
        .get('/api/students/profile/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('student');
      expect(response.body.user).toHaveProperty('username', studentUser.username);
      expect(response.body.user).toHaveProperty('role', 'student');
    });

    it('Admin kendi profilini getirmemeli', async () => {
      const response = await request(app)
        .get('/api/students/profile/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Bu işleme yetkiniz yok.');
    });
  });

  describe('PUT /api/students/profile/me', () => {
    it('Öğrenci kendi profilini güncellemeli', async () => {
      const updateData = {
        firstName: 'Güncellenmiş',
        lastName: 'İsim'
      };

      const response = await request(app)
        .put('/api/students/profile/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('firstName', 'Güncellenmiş');
      expect(response.body).toHaveProperty('lastName', 'İsim');
    });
  });

  describe('GET /api/students/enrollments/me', () => {
    it('Öğrenci kendi kayıtlarını getirmeli', async () => {
      const response = await request(app)
        .get('/api/students/enrollments/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('enrollments');
      expect(response.body).toHaveProperty('totalCount');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('totalPages');
    });
  });
});
