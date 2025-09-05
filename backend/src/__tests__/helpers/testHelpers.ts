import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import User from '../../models/User';
import Student from '../../models/Student';
import Course from '../../models/Course';
import jwt from 'jsonwebtoken';

// Test app oluşturma
export const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Test için basit route'lar
  app.get('/test', (req, res) => {
    res.json({ message: 'Test endpoint' });
  });
  
  return app;
};

// Test kullanıcısı oluşturma
export const createTestUser = async (role: 'admin' | 'student' = 'admin') => {
  const user = new User({
    username: `testuser_${Date.now()}`,
    password: 'testpassword123',
    role: role
  });
  
  if (role === 'student') {
    const student = new Student({
      firstName: 'Test',
      lastName: 'Student',
      birthDate: new Date('2000-01-01')
    });
    await student.save();
    user.studentId = student._id as any;
  }
  
  await user.save();
  return user;
};

// Test öğrencisi oluşturma
export const createTestStudent = async () => {
  const student = new Student({
    firstName: 'Test',
    lastName: 'Student',
    birthDate: new Date('2000-01-01')
  });
  await student.save();
  return student;
};

// Test dersi oluşturma
export const createTestCourse = async (name: string = 'Test Course') => {
  const course = new Course({
    name: name
  });
  await course.save();
  return course;
};

// JWT token oluşturma
export const generateTestToken = (userId: string, role: 'admin' | 'student') => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' }
  );
};

// Test verilerini temizleme
export const clearTestData = async () => {
  await User.deleteMany({});
  await Student.deleteMany({});
  await Course.deleteMany({});
};
