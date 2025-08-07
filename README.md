🚀 SaaS Backoffice Backend API
## İçindekiler
- [Proje Tanımı](#proje-tanımı)
- [Özellikler](#özellikler)
- [Teknolojiler](#teknolojiler)
- [Proje Yapısı](#proje-yapısı)
- [Kurulum & Çalıştırma](#Kurulum-Çalıştırma)
- [ API Dokümantasyonu](#api-Dokümantasyonu)
- [Kredi Yönetimi](#Kredi-Yönetimi)
- [Projeyi Geliştirmek İster misiniz?](#Projeyi-Geliştirmek-İster-misiniz?)

 ## Proje Tanımı
SaaS Backoffice Backend API, modern SaaS (Software as a Service) platformları için geliştirilen güçlü, esnek ve güvenilir bir backend altyapısıdır.
Node.js ve Express.js ile inşa edilen bu API, kullanıcı yönetimi, abonelik sistemleri, ödeme ve yetkilendirme işlemlerini sorunsuz bir şekilde sağlar.

Neden bu proje?
Günümüz SaaS uygulamalarında arka uç sistemleri hem performans hem de güvenlik açısından kritik öneme sahiptir. Bu proje, gerçek dünya kullanım senaryoları ve ölçeklenebilirlik düşünülerek hazırlanmıştır.

## ⚙️ Özellikler
🔐 Güvenli Kullanıcı Yönetimi: Bcrypt ile güçlü şifre hash’leme

🔑 JWT ile Yetkilendirme: API erişimlerini güvence altına alma

📋 Abonelik Planları CRUD: Dinamik plan oluşturma, güncelleme ve silme

👑 Rol Tabanlı Yönetici Yetkileri: Superadmin ve admin kontrolü

🛡️ Hata Yönetimi ve Validation: Sağlam ve kullanıcı dostu hata mesajları

⚡ Performans Odaklı: Optimize edilmiş sorgular ve düşük gecikme

📈 Kredi ve Kullanım Takibi: Planlara göre detaylı kredi yönetimi

## 🛠️ Teknolojiler

- **Node.js**  
  Sunucu tarafı JavaScript çalışma zamanı  
  ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)

- **Express.js**  
  Minimal ve esnek web uygulama framework'ü  
  ![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)

- **MySQL**  
  Güçlü ilişkisel veritabanı sistemi  
  ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white)

- **JWT**  
  JSON Web Token ile güvenli kimlik doğrulama  
  ![JWT](https://img.shields.io/badge/JWT-D24949?style=flat&logo=JSON%20web%20tokens&logoColor=white)

- **Bcrypt**  
  Şifre güvenliği için hash algoritması  
  ![Bcrypt](https://img.shields.io/badge/Bcrypt-F0AD4E?style=flat&logo=bcrypt&logoColor=black)


## 📁 Proje Yapısı

├── controllers/       # İş mantığı ve fonksiyonlar
├── middleware/        # Yetkilendirme, hata yakalama vb.
├── models/            # Veritabanı sorguları
├── routes/            # API endpointleri
├── utils/             # Yardımcı fonksiyonlar
├── config/            # Ortam ve konfigürasyon ayarları
├── tests/             # Birim ve entegrasyon testleri
├── package.json       # Bağımlılıklar ve scriptler
└── README.md          # Proje dokümantasyonu
## ⚡ Kurulum & Çalıştırma
Gereksinimler
Node.js v14+

MySQL veritabanı

Git

Adım Adım Kurulum
Depoyu Klonlayın:


git clone https://github.com/Mineerylmaz/SaaS-BackOffice-Backend.git
cd SaaS-BackOffice-Backend
Bağımlılıkları Yükleyin:


npm install
Ortam Değişkenlerini Ayarlayın:
.env dosyası oluşturup kendi ortamınıza göre düzenleyin.

Veritabanı Yapısını Oluşturun:
MySQL üzerinde tabloları oluşturun.

Uygulamayı Başlatın:


npm run start
API, varsayılan olarak http://localhost:32807 adresinde çalışacaktır.

## 🔍 API Dokümantasyonu (Örnek)
Kullanıcı Kayıt

POST /api/register
Body:

{
  "email": "user@example.com",
  "password": "strongPassword123"
}
Kullanıcı Giriş

POST /api/login
Body:


{
  "email": "user@example.com",
  "password": "strongPassword123"
}
Response:

json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user",
    "plan": "basic"
  }
}
## 📈 Kredi Yönetimi
Kullanıcıların abonelik planına göre kredileri takip edilir.

Kredi kullanımı credits_logs tablosunda detaylı kayıt altına alınır.

Superadmin yetkileri doğrultusunda kullanıcı kredilerini manuel düşürebilir.

🧑‍💻 Geliştirici Bilgileri

Mine Eryılmaz	https://github.com/Mineerylmaz	Mineerylmaz



🎯 Projeyi Geliştirmek İster misiniz?
Yeni abonelik planları ekleyin

API'yi mikroservis mimarisi ile ölçeklendirin

Gelişmiş yetkilendirme sistemi entegre edin (OAuth, SSO vs.)

Performans testleri ve iyileştirmeler yapın



Keyifli Kodlamalar! 👩‍💻👨‍💻
