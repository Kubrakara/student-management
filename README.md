# 🎓 Öğrenci ve Ders Yönetimi Sistemi

Modern web teknolojileri kullanılarak geliştirilmiş, tam kapsamlı öğrenci ve ders yönetimi uygulaması. Bu proje, Fullstack Developer teknik mülakat görevi olarak geliştirilmiştir.

## 🚀 Özellikler

### 👥 Kullanıcı Yönetimi
- **JWT tabanlı kimlik doğrulama** sistemi
- **Role-based yetkilendirme** (Admin/Öğrenci)
- Güvenli giriş/çıkış işlemleri
- Kullanıcı profil yönetimi

### 🎯 Öğrenci Yönetimi
- Öğrenci ekleme, güncelleme, silme
- Öğrenci listeleme (sayfalama ile)
- Öğrenci detay görüntüleme
- Öğrenci profil yönetimi
- Doğum tarihi validasyonu

### 📚 Ders Yönetimi
- Ders ekleme, güncelleme, silme
- Ders listeleme (sayfalama ile)
- Ders detay görüntüleme
- Benzersiz ders adı kontrolü
- Ders kayıtları yönetimi

### 📝 Kayıt Yönetimi
- Öğrenci-ders eşleştirmesi
- Self-enrollment (öğrenci kendi kaydı)
- Kayıt iptal etme
- Kayıt listeleme (sayfalama ile)
- Duplicate kayıt önleme

### 🔒 Güvenlik
- JWT token tabanlı authentication
- Role-based authorization
- Input validation
- Password hashing (bcrypt)
- CORS koruması

## 🛠️ Teknoloji Stack

### Backend
- **Node.js** 
- **Express.js** 
- **TypeScript** 
- **MongoDB** 
- **Mongoose** 
- **JWT** 
- **bcrypt** 
- **Jest** - Testing framework

### Frontend
- **Next.js 14** 
- **TypeScript** 
- **Tailwind CSS** 
- **Redux Toolkit** 
- **Axios** 

### DevOps
- **Docker** 
- **Docker Compose** 
- **MongoDB Memory Server** - Test database


## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Docker
- Docker Compose

### 1. Projeyi Klonlayın
```bash
git clone <repository-url>
cd student-management
```

### 2. Docker ile Çalıştırın
```bash
# Tüm servisleri build edip çalıştır
docker-compose up --build

# Arka planda çalıştır
docker-compose up --build -d
```

### 3. Servisleri Durdurun
```bash
# Servisleri durdur
docker-compose down

# Volumes ile birlikte durdur (veri silinir)
docker-compose down -v
```

## 🌐 Erişim Bilgileri

### Uygulama URL'leri
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

### Demo Kullanıcı Bilgileri
```
Username: admin@example.com
Password: 123456
```

## 🔧 Environment Variables

### Backend (.env)
```env
MONGO_URI=mongodb://mongodb:27017/studentdb
JWT_SECRET=your_jwt_secret_here
PORT=5000
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

> **Not**: Bu proje demo ve lokal kullanım amaçlıdır. `.env` dosyasında **JWT_SECRET** ayarlanmadığı için backend, varsayılan bir değer ile çalışmaktadır.
> 
> **Güvenlik Uyarısı**: Gerçek projelerde güvenlik açısından her ortam için (development, production) en az 32 karakter uzunluğunda güçlü bir JWT secret kullanmanız gerekmektedir.

## 📚 API Dokümantasyonu

### Authentication Endpoints
```
POST /api/auth/login          # Kullanıcı girişi
POST /api/auth/register       # Öğrenci kaydı (Admin only)
POST /api/auth/logout         # Çıkış
```

### Student Endpoints
```
GET    /api/students          # Öğrenci listesi (Admin)
POST   /api/students          # Öğrenci oluştur (Admin)
GET    /api/students/:id      # Öğrenci detayı (Admin)
PUT    /api/students/:id      # Öğrenci güncelle (Admin)
DELETE /api/students/:id      # Öğrenci sil (Admin)
GET    /api/students/profile/me        # Kendi profil (Student)
PUT    /api/students/profile/me        # Profil güncelle (Student)
GET    /api/students/enrollments/me    # Kendi kayıtlarım (Student)
```

### Course Endpoints
```
GET    /api/courses           # Ders listesi
POST   /api/courses           # Ders oluştur (Admin)
GET    /api/courses/:id       # Ders detayı
PUT    /api/courses/:id       # Ders güncelle (Admin)
DELETE /api/courses/:id       # Ders sil (Admin)
GET    /api/courses/:id/enrollments    # Ders kayıtları (Admin)
```

### Enrollment Endpoints
```
GET    /api/enrollments       # Tüm kayıtlar (Admin)
POST   /api/enrollments/enroll        # Öğrenci kaydet (Admin)
POST   /api/enrollments/self/enroll   # Kendi kaydım (Student)
DELETE /api/enrollments/withdraw/:id  # Kayıt sil (Admin)
DELETE /api/enrollments/self/withdraw/:id  # Kendi kaydımı sil (Student)
GET    /api/enrollments/my-courses    # Kayıtlı derslerim (Student)
```

## 🧪 Test

### Backend Testleri
```bash
cd backend

# Tüm testleri çalıştır
npm test

# Coverage raporu
npm run test:coverage

# Watch mode
npm run test:watch
```

## 🎯 Kullanıcı Rolleri

### Admin Kullanıcı
- ✅ Tüm öğrenci işlemleri (CRUD)
- ✅ Tüm ders işlemleri (CRUD)
- ✅ Öğrenci-ders kayıt yönetimi
- ✅ Tüm kayıtları görüntüleme
- ✅ Sistem yönetimi

### Student Kullanıcı
- ✅ Kendi profil bilgilerini görüntüleme/güncelleme
- ✅ Mevcut dersleri listeleme
- ✅ Derslere kayıt olma
- ✅ Kayıtlı derslerini görüntüleme
- ✅ Kayıt iptal etme

## 🔒 Güvenlik Özellikleri

### Authentication
- JWT token tabanlı kimlik doğrulama
- Token süresi kontrolü (1 saat)
- Güvenli çıkış işlemi

### Authorization
- Role-based erişim kontrolü
- Endpoint seviyesinde yetkilendirme
- Cross-role erişim engelleme

### Data Protection
- Password hashing (bcrypt)
- Input validation
- SQL injection koruması
- XSS koruması

## 📊 Veritabanı Şeması

### Collections
- **users** - Kullanıcı bilgileri
- **students** - Öğrenci bilgileri
- **courses** - Ders bilgileri
- **enrollments** - Kayıt bilgileri

### İlişkiler
- User → Student (1:1)
- Student → Enrollment (1:N)
- Course → Enrollment (1:N)

## 🚀 Deployment

### Production Ortamı
1. Environment variables'ları güncelleyin
2. Güçlü JWT secret kullanın
3. MongoDB connection string'i yapılandırın
4. CORS ayarlarını güncelleyin
5. SSL sertifikası ekleyin

### Docker Production
```bash
# Production build
docker-compose -f docker-compose.prod.yml up --build
```
