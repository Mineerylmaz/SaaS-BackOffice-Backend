# SaaS Backoffice Backend

Bu proje, SaaS Backoffice uygulamasının backend kısmıdır. Node.js ve Express kullanılarak geliştirilmiş API sunucusu, kullanıcı yönetimi, abonelik planları, ödeme işlemleri ve yetkilendirme gibi tüm sunucu tarafı işlemleri sağlar.

---

## İçindekiler
- [Proje Hakkında](#proje-hakkında)
- [Özellikler](#özellikler)
- [Teknolojiler](#teknolojiler)
- [Kurulum](#kurulum)
- [Çalıştırma](#çalıştırma)


---

## Proje Hakkında

Node.js ve Express.js kullanılarak geliştirilmiş bu backend, SaaS Backoffice uygulamasının tüm iş mantığını ve veri yönetimini sağlar. Kullanıcı kaydı, giriş, plan yönetimi, ödeme işlemleri ve admin yetkileri API aracılığıyla frontend’e sunulur.

---

## Özellikler

- Kullanıcı Kayıt & Giriş (Şifre Hash’leme ile)
- JWT ile Yetkilendirme ve Kimlik Doğrulama
- Abonelik Planları CRUD İşlemleri
- Ödeme API Entegrasyonu (örnek: Stripe, PayPal)
- Yönetici Yetkileri ile Kullanıcı ve Plan Yönetimi
- Hata Yönetimi ve Validation
- Güvenli API Tasarımı

---

## Teknolojiler

- Node.js
- Express.js
- Bcrypt (şifre hashleme)
- JSON Web Token (JWT)
- Veri Tabanı: (Kullandığın db neyse; örn. MongoDB, PostgreSQL)
- Ödeme API: (Stripe, PayPal veya diğer)

---

## Kurulum

1. Depoyu klonla:

git clone https://github.com/Mineerylmaz/SaaS-BackOffice-Backend.git
cd SaaSBackOfficeBackEnd
2.Bağımlılıkları yükle:
npm install
## Çalıştırma
npm start
Tarayıcı otomatik olarak http://localhost:3000 açılacaktır.
