// backend/src/scripts/listAllStudents.js
// Tüm öğrencileri ve kullanıcıları getirip listeleyen script

const mongoose = require('mongoose');
const Student = require('../models/Student');
const User = require('../models/User');

// MongoDB bağlantısı
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB bağlantısı başarılı');
  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error);
    process.exit(1);
  }
};

// Tüm öğrencileri ve kullanıcıları listele
const listAllStudentsAndUsers = async () => {
  try {
    console.log('\n🔍 Tüm öğrenciler ve kullanıcılar listeleniyor...\n');
    
    // Tüm öğrencileri getir
    const students = await Student.find().sort({ createdAt: -1 });
    console.log(`📊 Toplam öğrenci sayısı: ${students.length}\n`);
    
    // Tüm kullanıcıları getir
    const users = await User.find().sort({ createdAt: -1 });
    console.log(`👥 Toplam kullanıcı sayısı: ${users.length}\n`);
    
    // Öğrenci detaylarını listele
    console.log('📚 ÖĞRENCİ LİSTESİ:');
    console.log('='.repeat(80));
    
    if (students.length === 0) {
      console.log('❌ Hiç öğrenci bulunamadı.');
    } else {
      students.forEach((student, index) => {
        console.log(`\n${index + 1}. Öğrenci:`);
        console.log(`   ID: ${student._id}`);
        console.log(`   Ad: ${student.firstName}`);
        console.log(`   Soyad: ${student.lastName}`);
        console.log(`   Doğum Tarihi: ${student.birthDate.toLocaleDateString('tr-TR')}`);
        console.log(`   Oluşturulma: ${student.createdAt.toLocaleString('tr-TR')}`);
        console.log(`   Güncellenme: ${student.updatedAt.toLocaleString('tr-TR')}`);
      });
    }
    
    // Kullanıcı detaylarını listele
    console.log('\n\n👤 KULLANICI LİSTESİ:');
    console.log('='.repeat(80));
    
    if (users.length === 0) {
      console.log('❌ Hiç kullanıcı bulunamadı.');
    } else {
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. Kullanıcı:`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Kullanıcı Adı: ${user.username}`);
        console.log(`   Rol: ${user.role}`);
        console.log(`   Öğrenci ID: ${user.studentId || 'Yok'}`);
        console.log(`   Oluşturulma: ${user.createdAt.toLocaleString('tr-TR')}`);
        console.log(`   Güncellenme: ${user.updatedAt.toLocaleString('tr-TR')}`);
      });
    }
    
    // Eşleşmeyen kayıtları kontrol et
    console.log('\n\n🔍 EŞLEŞME KONTROLÜ:');
    console.log('='.repeat(80));
    
    const studentsWithoutUsers = [];
    const usersWithoutStudents = [];
    
    // Öğrenci var ama kullanıcı yok
    for (const student of students) {
      const user = users.find(u => u.studentId && u.studentId.toString() === student._id.toString());
      if (!user) {
        studentsWithoutUsers.push(student);
      }
    }
    
    // Kullanıcı var ama öğrenci yok
    for (const user of users) {
      if (user.studentId) {
        const student = students.find(s => s._id.toString() === user.studentId.toString());
        if (!student) {
          usersWithoutStudents.push(user);
        }
      } else {
        usersWithoutStudents.push(user);
      }
    }
    
    if (studentsWithoutUsers.length > 0) {
      console.log(`\n⚠️  ${studentsWithoutUsers.length} öğrenci için kullanıcı kaydı bulunamadı:`);
      studentsWithoutUsers.forEach((student, index) => {
        console.log(`   ${index + 1}. ${student.firstName} ${student.lastName} (ID: ${student._id})`);
      });
    }
    
    if (usersWithoutStudents.length > 0) {
      console.log(`\n⚠️  ${usersWithoutStudents.length} kullanıcı için öğrenci kaydı bulunamadı:`);
      usersWithoutStudents.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.username} (ID: ${user._id})`);
      });
    }
    
    if (studentsWithoutUsers.length === 0 && usersWithoutStudents.length === 0) {
      console.log('✅ Tüm kayıtlar eşleşiyor!');
    }
    
    // Özet
    console.log('\n\n📈 ÖZET:');
    console.log('='.repeat(80));
    console.log(`📚 Toplam Öğrenci: ${students.length}`);
    console.log(`👥 Toplam Kullanıcı: ${users.length}`);
    console.log(`⚠️  Eşleşmeyen Öğrenci: ${studentsWithoutUsers.length}`);
    console.log(`⚠️  Eşleşmeyen Kullanıcı: ${usersWithoutStudents.length}`);
    
  } catch (error) {
    console.error('❌ Veri listeleme hatası:', error);
  }
};

// Ana fonksiyon
const main = async () => {
  try {
    await connectDB();
    await listAllStudentsAndUsers();
  } catch (error) {
    console.error('❌ Script hatası:', error);
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

module.exports = { listAllStudentsAndUsers, connectDB };
