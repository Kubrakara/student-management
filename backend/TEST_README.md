# Backend API Test Dokümantasyonu

Bu dokümantasyon, öğrenci ve ders yönetimi uygulamasının backend API'leri için yazılmış kapsamlı test süitini açıklar.

## 🎯 Test Kapsamı

### ✅ Test Edilen API'ler
- **Authentication API** (`/api/auth`) - Login, Register, Logout
- **Student API** (`/api/students`) - CRUD operations, profil yönetimi
- **Course API** (`/api/courses`) - CRUD operations, ders yönetimi
- **Enrollment API** (`/api/enrollments`) - Kayıt olma, çekilme işlemleri
- **Auth Middleware** - JWT token doğrulama ve role-based yetkilendirme

### 📊 Test İstatistikleri
- **Toplam Test Sayısı**: 94 test case
- **Başarılı Testler**: 94/94 (%100)
- **Test Süitleri**: 5 (auth, student, course, enrollment, authMiddleware)
- **Kod Kapsamı**: %80.2 (Statement), %70.89 (Branch), %85.18 (Function)

## 🚀 Test Çalıştırma

### Gereksinimler
```bash
# Dependencies yükleme
npm install
```

### Test Komutları
```bash
# Tüm testleri çalıştır
npm test

# Testleri watch mode'da çalıştır
npm run test:watch

# Coverage raporu ile çalıştır
npm run test:coverage

# Belirli bir test dosyasını çalıştır
npx jest auth.test.ts
npx jest student.test.ts
npx jest course.test.ts
npx jest enrollment.test.ts
npx jest authMiddleware.test.ts
```

## 🧪 Test Yapısı

### Test Dosyaları
```
src/__tests__/
├── auth.test.ts              # Authentication API testleri
├── student.test.ts           # Student API testleri
├── course.test.ts            # Course API testleri
├── enrollment.test.ts        # Enrollment API testleri
├── authMiddleware.test.ts    # Auth middleware testleri
├── setup.ts                  # Test ortamı kurulumu
├── helpers/
│   └── testHelpers.ts        # Test yardımcı fonksiyonları
└── README.md                 # Detaylı test dokümantasyonu
```

### Test Teknolojileri
- **Jest**: Test framework
- **Supertest**: HTTP assertion library
- **MongoDB Memory Server**: In-memory MongoDB instance
- **TypeScript**: Type safety

## 📋 Test Senaryoları

### 1. Authentication API Testleri (11 test)
- ✅ Geçerli kullanıcı bilgileri ile giriş
- ✅ Geçersiz kullanıcı adı/şifre ile giriş
- ✅ Eksik bilgilerle giriş
- ✅ Admin kullanıcı yeni öğrenci kaydı oluşturma
- ✅ Mevcut kullanıcı adı ile kayıt oluşturma
- ✅ Yetkisiz kullanıcı kayıt oluşturma
- ✅ Geçersiz doğum tarihi ile kayıt
- ✅ Logout işlemi

### 2. Student API Testleri (25 test)
- ✅ Admin öğrenci oluşturma/güncelleme/silme
- ✅ Eksik alanlarla öğrenci oluşturma
- ✅ Geçersiz doğum tarihi ile öğrenci oluşturma
- ✅ Yetkisiz kullanıcı öğrenci işlemleri
- ✅ Öğrenci listeleme (sayfalama ile)
- ✅ Öğrenci detay getirme
- ✅ Öğrenci kendi profil yönetimi
- ✅ Öğrenci kendi kayıtlarını listeleme

### 3. Course API Testleri (20 test)
- ✅ Admin ders oluşturma/güncelleme/silme
- ✅ Eksik ders adı ile ders oluşturma
- ✅ Aynı isimde ders oluşturma
- ✅ Yetkisiz kullanıcı ders işlemleri
- ✅ Ders listeleme (sayfalama ile)
- ✅ Ders detay getirme
- ✅ Dersin kayıtlı öğrencilerini listeleme

### 4. Enrollment API Testleri (25 test)
- ✅ Admin öğrenciyi derse kaydetme
- ✅ Öğrenci kendini derse kaydetme
- ✅ Eksik bilgilerle kayıt oluşturma
- ✅ Mevcut olmayan öğrenci/ders ile kayıt
- ✅ Aynı öğrenciyi aynı derse tekrar kaydetme
- ✅ Kayıt listeleme (sayfalama ile)
- ✅ Öğrenci kendi derslerini listeleme
- ✅ Admin/öğrenci kayıt silme

### 5. Auth Middleware Testleri (13 test)
- ✅ Geçerli token ile korumalı route erişimi
- ✅ Token olmadan korumalı route erişimi
- ✅ Geçersiz token ile erişim
- ✅ Süresi dolmuş token ile erişim
- ✅ Role-based yetkilendirme
- ✅ Edge case'ler (boş header, malformed token, vb.)

## 🔧 Test Konfigürasyonu

### Jest Konfigürasyonu (`jest.config.js`)
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/scripts/**',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testTimeout: 10000,
  clearMocks: true,
  restoreMocks: true,
};
```

### Test Setup (`setup.ts`)
- MongoDB Memory Server kurulumu
- Her test sonrası veritabanı temizliği
- Environment variables ayarlama
- Test timeout konfigürasyonu

## 🎯 Test Prensipleri

### 1. İzolasyon
- Her test bağımsız çalışır
- Testler arasında veri paylaşımı yok
- Her test öncesi/sonrası temizlik

### 2. Gerçekçilik
- Gerçek HTTP istekleri
- Gerçek veritabanı işlemleri
- Gerçek middleware kullanımı

### 3. Kapsamlılık
- Happy path testleri
- Error handling testleri
- Edge case testleri
- Security testleri

### 4. Performans
- Hızlı test çalıştırma
- Paralel test desteği
- Memory-efficient test veritabanı

## 🛡️ Güvenlik Testleri

### Authentication
- JWT token doğrulama
- Token süresi kontrolü
- Geçersiz token handling
- Role-based yetkilendirme

### Authorization
- Admin-only endpoint'ler
- Student-only endpoint'ler
- Cross-role erişim engelleme
- Token olmadan erişim engelleme

### Input Validation
- Eksik alan kontrolü
- Geçersiz veri formatı
- SQL injection koruması
- XSS koruması

## 📈 Coverage Raporu

### Kod Kapsamı Detayları
- **Controllers**: %83.77 (Statement), %76.78 (Branch)
- **Middlewares**: %100 (Tüm metrikler)
- **Models**: %83.87 (Statement), %25 (Branch)
- **Routes**: %61.33 (Statement), %0 (Branch)

### Kapsanmayan Alanlar
- Error handling edge case'leri
- Bazı route handler'ları
- Model validation edge case'leri

## 🚨 Önemli Notlar

1. **Test Veritabanı**: Testler MongoDB Memory Server kullanır
2. **Environment**: Test ortamı otomatik konfigüre edilir
3. **Timeout**: Test timeout'u 10 saniye
4. **Cleanup**: Her test sonrası otomatik temizlik
5. **Isolation**: Testler birbirini etkilemez

## 🔍 Test Debugging

### Test Başarısız Olursa
```bash
# Detaylı log ile çalıştır
npm test -- --verbose

# Belirli test dosyasını debug et
npx jest auth.test.ts --verbose

# Watch mode'da debug et
npm run test:watch
```

### Yaygın Sorunlar
1. **Port çakışması**: MongoDB Memory Server port sorunu
2. **Timeout**: Test süresi aşımı
3. **Memory**: Yetersiz bellek
4. **Dependencies**: Eksik paketler

## 📚 Ek Kaynaklar

- [Jest Dokümantasyonu](https://jestjs.io/docs/getting-started)
- [Supertest Dokümantasyonu](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [TypeScript Testing](https://jestjs.io/docs/getting-started#using-typescript)

---

**Test Süiti**: Express.js + TypeScript + MongoDB + Jest  
**Son Güncelleme**: 2024  
**Test Durumu**: ✅ Tüm testler başarılı (94/94)
