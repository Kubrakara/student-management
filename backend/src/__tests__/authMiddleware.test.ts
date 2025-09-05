import request from 'supertest';
import express from 'express';
import authMiddleware, { authorizeRoles, IRequest } from '../middlewares/authMiddleware';
import jwt from 'jsonwebtoken';
import { generateTestToken } from './helpers/testHelpers';

// Test app oluştur
const app = express();
app.use(express.json());

// Test route'ları
app.get('/protected', authMiddleware, (req: IRequest, res) => {
  res.json({ message: 'Protected route accessed', user: req.user });
});

app.get('/admin-only', authMiddleware, authorizeRoles('admin'), (req: IRequest, res) => {
  res.json({ message: 'Admin route accessed', user: req.user });
});

app.get('/student-only', authMiddleware, authorizeRoles('student'), (req: IRequest, res) => {
  res.json({ message: 'Student route accessed', user: req.user });
});

app.get('/both-roles', authMiddleware, authorizeRoles('admin', 'student'), (req: IRequest, res) => {
  res.json({ message: 'Both roles route accessed', user: req.user });
});

describe('Auth Middleware Tests', () => {
  describe('authMiddleware', () => {
    it('Geçerli token ile korumalı route erişimi', async () => {
      const token = generateTestToken('user123', 'admin');

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Protected route accessed');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('userId', 'user123');
      expect(response.body.user).toHaveProperty('role', 'admin');
    });

    it('Token olmadan korumalı route erişimi', async () => {
      const response = await request(app)
        .get('/protected');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Kimlik doğrulama tokenı eksik veya geçersiz.');
    });

    it('Geçersiz Authorization header formatı', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'InvalidFormat token123');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Kimlik doğrulama tokenı eksik veya geçersiz.');
    });

    it('Bearer olmadan token', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'token123');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Kimlik doğrulama tokenı eksik veya geçersiz.');
    });

    it('Geçersiz token', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Yetkilendirme tokenı geçersiz.');
    });

    it('Süresi dolmuş token', async () => {
      const expiredToken = jwt.sign(
        { userId: 'user123', role: 'admin' },
        process.env.JWT_SECRET as string,
        { expiresIn: '-1h' } 
      );

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Yetkilendirme tokenı geçersiz.');
    });

    it('Yanlış secret ile imzalanmış token', async () => {
      const wrongSecretToken = jwt.sign(
        { userId: 'user123', role: 'admin' },
        'wrong-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${wrongSecretToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Yetkilendirme tokenı geçersiz.');
    });
  });

  describe('authorizeRoles', () => {
    it('Admin kullanıcı admin route erişimi', async () => {
      const adminToken = generateTestToken('admin123', 'admin');

      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Admin route accessed');
    });

    it('Student kullanıcı admin route erişimi', async () => {
      const studentToken = generateTestToken('student123', 'student');

      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Bu işleme yetkiniz yok.');
    });

    it('Student kullanıcı student route erişimi', async () => {
      const studentToken = generateTestToken('student123', 'student');

      const response = await request(app)
        .get('/student-only')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Student route accessed');
    });

    it('Admin kullanıcı student route erişimi', async () => {
      const adminToken = generateTestToken('admin123', 'admin');

      const response = await request(app)
        .get('/student-only')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Bu işleme yetkiniz yok.');
    });

    it('Admin kullanıcı her iki role de erişim', async () => {
      const adminToken = generateTestToken('admin123', 'admin');

      const response = await request(app)
        .get('/both-roles')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Both roles route accessed');
    });

    it('Student kullanıcı her iki role de erişim', async () => {
      const studentToken = generateTestToken('student123', 'student');

      const response = await request(app)
        .get('/both-roles')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Both roles route accessed');
    });

    it('Token olmadan role kontrolü', async () => {
      const response = await request(app)
        .get('/admin-only');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Kimlik doğrulama tokenı eksik veya geçersiz.');
    });

    it('Geçersiz role ile token', async () => {
      const invalidRoleToken = jwt.sign(
        { userId: 'user123', role: 'invalid-role' },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${invalidRoleToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Bu işleme yetkiniz yok.');
    });

    it('User bilgisi olmayan token', async () => {
      const noUserToken = jwt.sign(
        { role: 'admin' },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${noUserToken}`);

      expect(response.status).toBe(200); 
      expect(response.body).toHaveProperty('message', 'Admin route accessed');
    });
  });

  describe('Edge Cases', () => {
    it('Boş Authorization header', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', '');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Kimlik doğrulama tokenı eksik veya geçersiz.');
    });

    it('Sadece "Bearer" kelimesi', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Kimlik doğrulama tokenı eksik veya geçersiz.');
    });

    it('Çok uzun token', async () => {
      const longToken = 'a'.repeat(10000);
      
      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${longToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Yetkilendirme tokenı geçersiz.');
    });

    it('Malformed JSON token', async () => {
      const malformedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.malformed.signature';
      
      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${malformedToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Yetkilendirme tokenı geçersiz.');
    });
  });
});
