# Öğrenci Listeleme Scriptleri

Bu klasörde veritabanındaki tüm öğrenci ve kullanıcı verilerini listeleyen scriptler bulunmaktadır.

## Scriptler

### 1. listAllStudents.js
JavaScript versiyonu - Node.js ile çalışır.

### 2. listAllStudents.ts
TypeScript versiyonu - Daha gelişmiş tip güvenliği ve detaylı raporlama.

## Kullanım

### JavaScript Versiyonu
```bash
cd backend
npm run list-students
```

### TypeScript Versiyonu
```bash
cd backend
npm run list-students-ts
```

## Özellikler

- ✅ Tüm öğrencileri listeler
- ✅ Tüm kullanıcıları listeler
- ✅ Eşleşme kontrolü yapar
- ✅ Detaylı raporlama
- ✅ Veritabanı durumu analizi
- ✅ Kopuk kayıtları tespit eder

## Çıktı Örneği

```
🔍 Tüm öğrenciler ve kullanıcılar listeleniyor...

📊 Toplam öğrenci sayısı: 5
👥 Toplam kullanıcı sayısı: 5

📚 ÖĞRENCİ LİSTESİ:
================================================================================

1. Öğrenci:
   ID: 507f1f77bcf86cd799439011
   Ad: Kubra
   Soyad: Yılmaz
   Doğum Tarihi: 15.03.1995
   Oluşturulma: 15.12.2024 14:30:25
   Güncellenme: 15.12.2024 14:30:25

👤 KULLANICI LİSTESİ:
================================================================================

1. Kullanıcı:
   ID: 507f1f77bcf86cd799439012
   Kullanıcı Adı: kubra
   Rol: student
   Öğrenci ID: 507f1f77bcf86cd799439011
   Oluşturulma: 15.12.2024 14:30:25
   Güncellenme: 15.12.2024 14:30:25

🔍 EŞLEŞME KONTROLÜ:
================================================================================
✅ Tüm kayıtlar eşleşiyor!

📈 ÖZET:
================================================================================
📚 Toplam Öğrenci: 5
👥 Toplam Kullanıcı: 5
✅ Eşleşen Çift: 5
⚠️  Eşleşmeyen Öğrenci: 0
⚠️  Eşleşmeyen Kullanıcı: 0
```

## Gereksinimler

- MongoDB bağlantısı
- Node.js v14+
- TypeScript (TypeScript versiyonu için)

## Notlar

- Script çalıştırılmadan önce MongoDB'nin çalıştığından emin olun
- `.env` dosyasında `MONGODB_URI` tanımlı olmalı
- Script çalıştıktan sonra veritabanı bağlantısını otomatik olarak kapatır
