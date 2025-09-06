#!/usr/bin/env ts-node
// backend/src/scripts/setupAdmin.ts
// Admin kullanıcısı kurulum scripti

import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';
import * as readline from 'readline';

// Environment variables'ları yükle
dotenv.config();

// MongoDB bağlantısı
const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/studentdb';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any);
    console.log('✅ MongoDB bağlantısı başarılı');
  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error);
    process.exit(1);
  }
};

// Admin kullanıcısı oluştur veya güncelle
const setupAdminUser = async (): Promise<void> => {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || '123456';
    
    console.log('\n🔍 Admin kullanıcısı kontrol ediliyor...');
    console.log(`📧 Username: ${adminUsername}`);
    
    // Mevcut admin kullanıcısını kontrol et
    const existingAdmin = await User.findOne({ 
      username: adminUsername,
      role: 'admin' 
    });
    
    if (existingAdmin) {
      console.log('✅ Admin kullanıcısı zaten mevcut!');
      console.log(`   ID: ${existingAdmin._id}`);
      console.log(`   Rol: ${existingAdmin.role}`);
      console.log(`   Oluşturulma: ${existingAdmin.createdAt.toLocaleString('tr-TR')}`);
      
      // Şifre güncelleme seçeneği
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise<string>((resolve) => {
        rl.question('\n🔐 Şifreyi güncellemek istiyor musunuz? (y/N): ', resolve);
      });
      
      rl.close();
      
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        existingAdmin.password = adminPassword;
        await existingAdmin.save();
        console.log('✅ Admin şifresi güncellendi!');
      }
      
      return;
    }
    
    console.log('🔧 Admin kullanıcısı oluşturuluyor...');
    
    // Yeni admin kullanıcısı oluştur
    const adminUser = new User({
      username: adminUsername,
      password: adminPassword,
      role: 'admin'
    });
    
    await adminUser.save();
    
    console.log('✅ Admin kullanıcısı başarıyla oluşturuldu!');
    console.log(`   Kullanıcı Adı: ${adminUser.username}`);
    console.log(`   Şifre: ${adminPassword}`);
    console.log(`   Rol: ${adminUser.role}`);
    console.log(`   ID: ${adminUser._id}`);
    console.log(`   Oluşturulma: ${adminUser.createdAt.toLocaleString('tr-TR')}`);
    
    console.log('\n📋 Giriş Bilgileri:');
    console.log('='.repeat(50));
    console.log(`Kullanıcı Adı: ${adminUsername}`);
    console.log(`Şifre: ${adminPassword}`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Admin kullanıcısı oluşturma hatası:', error);
    throw error;
  }
};

// Ana fonksiyon
const main = async (): Promise<void> => {
  try {
    console.log('🚀 Admin Kurulum Scripti Başlatılıyor...');
    console.log('='.repeat(50));
    
    await connectDB();
    await setupAdminUser();
    
    console.log('\n✅ Admin kurulumu tamamlandı!');
    console.log('🌐 Uygulamaya erişim: http://localhost:3000');
    
  } catch (error) {
    console.error('❌ Script hatası:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Veritabanı bağlantısı kapatıldı.');
    process.exit(0);
  }
};

// Script'i çalıştır
if (require.main === module) {
  main();
}

export { setupAdminUser, connectDB };
