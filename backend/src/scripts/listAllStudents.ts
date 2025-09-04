// backend/src/scripts/listAllStudents.ts
// Tüm öğrencileri ve kullanıcıları getirip listeleyen TypeScript script

import mongoose from 'mongoose';
import Student, { IStudent } from '../models/Student';
import User, { IUser } from '../models/User';

// MongoDB bağlantısı
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any);
    console.log('✅ MongoDB bağlantısı başarılı');
  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error);
    process.exit(1);
  }
};

// Eşleşme kontrolü için interface
interface StudentUserMatch {
  student: IStudent;
  user?: IUser;
  hasMatch: boolean;
}

interface UserStudentMatch {
  user: IUser;
  student?: IStudent;
  hasMatch: boolean;
}

// Tüm öğrencileri ve kullanıcıları listele
const listAllStudentsAndUsers = async (): Promise<void> => {
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
    
    // Eşleşmeleri kontrol et
    console.log('\n\n🔍 EŞLEŞME KONTROLÜ:');
    console.log('='.repeat(80));
    
    const studentMatches: StudentUserMatch[] = [];
    const userMatches: UserStudentMatch[] = [];
    
    // Her öğrenci için kullanıcı ara
    for (const student of students) {
      const user = users.find(u => u.studentId && u.studentId.toString() === (student._id as any).toString());
      studentMatches.push({
        student,
        user,
        hasMatch: !!user
      });
    }
    
    // Her kullanıcı için öğrenci ara
    for (const user of users) {
      let student: IStudent | undefined;
      if (user.studentId) {
        student = students.find(s => (s._id as any).toString() === user.studentId!.toString());
      }
      userMatches.push({
        user,
        student,
        hasMatch: !!student
      });
    }
    
    // Eşleşmeyen öğrenciler
    const studentsWithoutUsers = studentMatches.filter(match => !match.hasMatch);
    if (studentsWithoutUsers.length > 0) {
      console.log(`\n⚠️  ${studentsWithoutUsers.length} öğrenci için kullanıcı kaydı bulunamadı:`);
      studentsWithoutUsers.forEach((match, index) => {
        console.log(`   ${index + 1}. ${match.student.firstName} ${match.student.lastName} (ID: ${match.student._id})`);
      });
    }
    
    // Eşleşmeyen kullanıcılar
    const usersWithoutStudents = userMatches.filter(match => !match.hasMatch);
    if (usersWithoutStudents.length > 0) {
      console.log(`\n⚠️  ${usersWithoutStudents.length} kullanıcı için öğrenci kaydı bulunamadı:`);
      usersWithoutStudents.forEach((match, index) => {
        console.log(`   ${index + 1}. ${match.user.username} (ID: ${match.user._id})`);
      });
    }
    
    if (studentsWithoutUsers.length === 0 && usersWithoutStudents.length === 0) {
      console.log('✅ Tüm kayıtlar eşleşiyor!');
    }
    
    // Detaylı eşleşme raporu
    console.log('\n\n📋 DETAYLI EŞLEŞME RAPORU:');
    console.log('='.repeat(80));
    
    const matchedPairs = studentMatches.filter(match => match.hasMatch);
    console.log(`✅ Eşleşen çiftler: ${matchedPairs.length}`);
    
    matchedPairs.forEach((match, index) => {
      console.log(`\n${index + 1}. Eşleşen Çift:`);
      console.log(`   Öğrenci: ${match.student.firstName} ${match.student.lastName} (${match.student._id})`);
      console.log(`   Kullanıcı: ${match.user!.username} (${match.user!._id})`);
    });
    
    // Özet
    console.log('\n\n📈 ÖZET:');
    console.log('='.repeat(80));
    console.log(`📚 Toplam Öğrenci: ${students.length}`);
    console.log(`👥 Toplam Kullanıcı: ${users.length}`);
    console.log(`✅ Eşleşen Çift: ${matchedPairs.length}`);
    console.log(`⚠️  Eşleşmeyen Öğrenci: ${studentsWithoutUsers.length}`);
    console.log(`⚠️  Eşleşmeyen Kullanıcı: ${usersWithoutStudents.length}`);
    
    // Veritabanı durumu
    console.log('\n\n🗄️  VERİTABANI DURUMU:');
    console.log('='.repeat(80));
    console.log(`📊 Öğrenci Tablosu: ${students.length} kayıt`);
    console.log(`👥 Kullanıcı Tablosu: ${users.length} kayıt`);
    console.log(`🔗 İlişkili Kayıtlar: ${matchedPairs.length} çift`);
    console.log(`❌ Kopuk Kayıtlar: ${studentsWithoutUsers.length + usersWithoutStudents.length} adet`);
    
  } catch (error) {
    console.error('❌ Veri listeleme hatası:', error);
  }
};

// Ana fonksiyon
const main = async (): Promise<void> => {
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

export { listAllStudentsAndUsers, connectDB };
