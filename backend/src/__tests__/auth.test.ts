import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from '../routes/auth';
import User from '../models/User';
import Student from '../models/Student';
import { createTestUser, generateTestToken } from './helpers/testHelpers';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Authentication API Tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Student.deleteMany({});
  });

  describe('POST /api/auth/login', () => {
    it('Geçerli kullanıcı bilgileri ile giriş yapmalı', async () => {
      const user = await createTestUser('admin');
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: user.username,
          password: 'testpassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Giriş başarılı.');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('role', 'admin');
      expect(response.body.token).toBeDefined();
    });

    it('Geçersiz kullanıcı adı ile giriş yapmamalı', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistentuser',
          password: 'testpassword123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Geçersiz kullanıcı adı veya şifre.');
    });

    it('Geçersiz şifre ile giriş yapmamalı', async () => {
      const user = await createTestUser('admin');
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: user.username,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Geçersiz kullanıcı adı veya şifre.');
    });

    it('Eksik kullanıcı adı ile giriş yapmamalı', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'testpassword123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Geçersiz kullanıcı adı veya şifre.');
    });

    it('Eksik şifre ile giriş yapmamalı', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Geçersiz kullanıcı adı veya şifre.');
    });
  });

  describe('POST /api/auth/register', () => {
    it('Admin kullanıcı yeni öğrenci kaydı oluşturmalı', async () => {
      const adminUser = await createTestUser('admin');
      const adminToken = generateTestToken((adminUser._id as any).toString(), 'admin');

      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'newstudent',
          password: 'password123',
          firstName: 'Yeni',
          lastName: 'Öğrenci',
          birthDate: '2000-01-01'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Öğrenci kaydı başarıyla oluşturuldu.');
      expect(response.body).toHaveProperty('studentId');

      const createdUser = await User.findOne({ username: 'newstudent' });
      expect(createdUser).toBeTruthy();
      expect(createdUser?.role).toBe('student');
      expect(createdUser?.studentId).toBeTruthy();

      const createdStudent = await Student.findById(createdUser?.studentId);
      expect(createdStudent).toBeTruthy();
      expect(createdStudent?.firstName).toBe('Yeni');
      expect(createdStudent?.lastName).toBe('Öğrenci');
    });

    it('Mevcut kullanıcı adı ile kayıt oluşturmamalı', async () => {
      const adminUser = await createTestUser('admin');
      const adminToken = generateTestToken((adminUser._id as any).toString(), 'admin');

      await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'duplicateuser',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          birthDate: '2000-01-01'
        });

      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'duplicateuser',
          password: 'password123',
          firstName: 'Test2',
          lastName: 'User2',
          birthDate: '2000-01-01'
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('message', 'Kullanıcı adı zaten mevcut.');
    });

    it('Admin olmayan kullanıcı kayıt oluşturmamalı', async () => {
      const studentUser = await createTestUser('student');
      const studentToken = generateTestToken((studentUser._id as any).toString(), 'student');

      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          username: 'newstudent',
          password: 'password123',
          firstName: 'Yeni',
          lastName: 'Öğrenci',
          birthDate: '2000-01-01'
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Bu işleme yetkiniz yok.');
    });

    it('Token olmadan kayıt oluşturmamalı', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newstudent',
          password: 'password123',
          firstName: 'Yeni',
          lastName: 'Öğrenci',
          birthDate: '2000-01-01'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Kimlik doğrulama tokenı eksik veya geçersiz.');
    });

    it('Geçersiz doğum tarihi ile kayıt oluşturmamalı', async () => {
      const adminUser = await createTestUser('admin');
      const adminToken = generateTestToken((adminUser._id as any).toString(), 'admin');

      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'newstudent',
          password: 'password123',
          firstName: 'Yeni',
          lastName: 'Öğrenci',
          birthDate: '2030-01-01' 
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Doğum tarihi bugünden sonraki bir tarih olamaz');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('Logout işlemi başarılı olmalı', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Çıkış başarılı.');
    });
  });
});
