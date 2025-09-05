// backend/src/scripts/createAdmin.ts
// Admin kullanıcısı oluşturan TypeScript script

import mongoose from 'mongoose';
import User from '../models/User';

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

// Admin kullanıcısı oluştur
const createAdminUser = async (): Promise<void> => {
  try {
    const adminUsername = 'admin@example.com';
    const adminPassword = '123456';
    
    console.log('\n🔍 Admin kullanıcısı kontrol ediliyor...');
    
    // Mevcut admin kullanıcısını kontrol et
    const existingAdmin = await User.findOne({ 
      username: adminUsername,
      role: 'admin' 
    });
    
    if (existingAdmin) {
      console.log('✅ Admin kullanıcısı zaten mevcut:', adminUsername);
      console.log(`   ID: ${existingAdmin._id}`);
      console.log(`   Rol: ${existingAdmin.role}`);
      console.log(`   Oluşturulma: ${existingAdmin.createdAt.toLocaleString('tr-TR')}`);
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
    await connectDB();
    await createAdminUser();
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

export { createAdminUser, connectDB };
