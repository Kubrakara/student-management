#  Öğrenci ve Ders Yönetimi Sistemi

Modern web teknolojileri kullanılarak geliştirilmiş, tam kapsamlı öğrenci ve ders yönetimi uygulaması. 

##  Özellikler

### Kullanıcı Yönetimi
- **JWT tabanlı kimlik doğrulama** sistemi
- **Role-based yetkilendirme** (Admin/Öğrenci)
- Güvenli giriş/çıkış işlemleri
- Kullanıcı profil yönetimi

### Öğrenci Yönetimi
- Öğrenci ekleme, güncelleme, silme
- Öğrenci listeleme (sayfalama ile)
- Öğrenci detay görüntüleme
- Öğrenci profil yönetimi
- Doğum tarihi validasyonu

### Ders Yönetimi
- Ders ekleme, güncelleme, silme
- Ders listeleme (sayfalama ile)
- Ders detay görüntüleme
- Benzersiz ders adı kontrolü
- Ders kayıtları yönetimi

### Kayıt Yönetimi
- Öğrenci-ders eşleştirmesi
- Self-enrollment (öğrenci kendi kaydı)
- Kayıt iptal etme
- Kayıt listeleme (sayfalama ile)
- Duplicate kayıt önleme

### Güvenlik
- JWT token tabanlı authentication
- Role-based authorization
- Input validation
- Password hashing (bcrypt)
- CORS koruması

## Teknoloji Stack

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


## ❗ Kurulum ve Çalıştırma

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

### 3. Admin Kullanıcısı
Admin kullanıcısı **otomatik olarak** oluşturulur. İlk çalıştırmada:
- Backend başlatıldığında admin kullanıcısı otomatik oluşturulur
- Eğer admin zaten varsa, mevcut admin bilgileri gösterilir
- Admin bilgileri Docker Compose environment variables'larından alınır

**Varsayılan Admin Bilgileri:**
- **Username:** `admin@example.com`
- **Password:** `123456`
- **Role:** `admin`

### 3.1. Manuel Admin Kurulumu (Opsiyonel)
```bash
# Backend container'ına gir
docker exec -it backend_container bash

# Admin kurulum scriptini çalıştır
npm run setup-admin

# Veya doğrudan
ts-node src/scripts/setupAdmin.ts
```

### 4. Servisleri Durdurun
```bash
# Servisleri durdur
docker-compose down

# Volumes ile birlikte durdur (veri silinir)
docker-compose down -v
```

## Erişim Bilgileri

### Uygulama URL'leri
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

### Giriş Bilgileri
**Varsayılan Admin Bilgileri:**
- **Username:** `admin@example.com`
- **Password:** `123456`
- **URL:** http://localhost:3000

## Environment Variables

### Mevcut Durum (Basit Kurulum)
**Şu anda** proje Docker Compose environment variables'ları ile çalışıyor. Hiçbir ek ayar gerekmez:

```yaml
# docker-compose.yml'de tanımlı değerler:
environment:
  - MONGO_URI=mongodb://mongodb:27017/studentdb
  - JWT_SECRET=your_jwt_secret_key
  - ADMIN_USERNAME=admin@example.com
  - ADMIN_PASSWORD=123456
  - NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

### 🔏❗Güvenlik İçin Environment Variables (Önerilen)
**Production ortamında** güvenlik için `.env` dosyası kullanmanız önerilir

#### 1. .env Dosyası Oluşturun
```bash
# Örnek dosyayı kopyalayın
cp env.example .env

# .env dosyasını düzenleyin
nano .env
```

#### 2. Güvenli Değerler Girin
```env
# MongoDB Connection
MONGO_URI=mongodb://mongodb:27017/studentdb

# JWT Secret Key (Production'da güçlü bir key kullanın - en az 32 karakter)
JWT_SECRET=your_very_secure_jwt_secret_key_here_at_least_32_characters

# Server Port
PORT=5000

# Environment
NODE_ENV=development

# Admin User Credentials (Production'da güçlü şifre kullanın)
ADMIN_USERNAME=admin@example.com
ADMIN_PASSWORD=your_secure_admin_password

# Frontend Backend URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

#### 3. Docker Compose'u Güncelleyin
```yaml
# docker-compose.yml'de environment variables'ları şu şekilde değiştirin:
environment:
  - MONGO_URI=${MONGO_URI:-mongodb://mongodb:27017/studentdb}
  - JWT_SECRET=${JWT_SECRET:-your_jwt_secret_key}
  - ADMIN_USERNAME=${ADMIN_USERNAME:-admin@example.com}
  - ADMIN_PASSWORD=${ADMIN_PASSWORD:-123456}
  - NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL:-http://localhost:5000}
```

### Güvenlik Uyarısı ⚠️
**ÖNEMLİ**: 
- `.env` dosyası GitHub'a yüklenmez (`.gitignore` ile korunur)
- **Asla** gerçek production değerlerini hardcoded kullanmayın
- **JWT_SECRET** en az 32 karakter olmalı
- **Admin şifresi** güçlü olmalı

## API Dokümantasyonu

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

## Test

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

## Kullanıcı Rolleri

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

## Güvenlik Özellikleri

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

## Veritabanı Şeması

### Collections
- **users** - Kullanıcı bilgileri
- **students** - Öğrenci bilgileri
- **courses** - Ders bilgileri
- **enrollments** - Kayıt bilgileri

### İlişkiler
- User → Student (1:1)
- Student → Enrollment (1:N)
- Course → Enrollment (1:N)


