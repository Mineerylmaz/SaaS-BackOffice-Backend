# SaaS Backoffice Backend

# SaaS Backoffice Backend API

Bu proje, SaaS Backoffice uygulamasının **backend** kısmıdır.  
Node.js ve Express kullanılarak geliştirilmiş API sunucusu; kullanıcı yönetimi, abonelik planları, ödeme işlemleri ve yetkilendirme gibi tüm sunucu tarafı işlemleri sağlar.

---

## İçindekiler

- [Proje Hakkında](#proje-hakkında)  
- [Özellikler](#özellikler)  
- [Teknolojiler](#teknolojiler)  
- [Kurulum](#kurulum)  
- [Çalıştırma](#çalıştırma)  

---

## Proje Hakkında

Node.js ve Express.js tabanlı bu backend, SaaS Backoffice’in tüm iş mantığını ve veri yönetimini API üzerinden sağlar.  
- Kullanıcı kayıt ve giriş (şifre hash’leme ile)  
- JWT tabanlı yetkilendirme ve kimlik doğrulama  
- Abonelik planları için CRUD işlemleri  
- Stripe ve PayPal gibi ödeme sağlayıcılarıyla entegrasyon  
- Yönetici paneli ile kullanıcı ve plan yönetimi  
- Gelişmiş hata yönetimi ve doğrulama (validation)  
- Güvenli ve performanslı API tasarımı  

---

## Özellikler

- ✅ Kullanıcı Kayıt & Giriş (Bcrypt ile güvenli şifreleme)  
- ✅ JWT ile Yetkilendirme ve Kimlik Doğrulama  
- ✅ Abonelik Planları CRUD İşlemleri  
- ✅ Ödeme API Entegrasyonu (Stripe, PayPal)  
- ✅ Yönetici Yetkileri ile Kullanıcı ve Plan Yönetimi  
- ✅ Hata Yönetimi ve Validation  
- ✅ Güvenli API Tasarımı  

---

## Teknolojiler

<div align="center" style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 10px; margin-bottom: 10px;">

<span style="display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 12px; background-color: #339933; color: white; font-weight: 600; cursor: default;">
  <img src="https://raw.githubusercontent.com/github/explore/main/topics/nodejs/nodejs.png" alt="Node.js" width="20" /> Node.js
</span>

<span style="display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 12px; background-color: #61dafb; color: black; font-weight: 600; cursor: default;">
  <img src="https://raw.githubusercontent.com/github/explore/main/topics/react/react.png" alt="React" width="20" /> React
</span>

<span style="display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 12px; background-color: #4479a1; color: white; font-weight: 600; cursor: default;">
  <img src="https://raw.githubusercontent.com/github/explore/main/topics/mysql/mysql.png" alt="MySQL" width="20" /> MySQL
</span>

<span style="display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 12px; background-color: #d63031; color: white; font-weight: 600; cursor: default;">
  <img src="https://raw.githubusercontent.com/github/explore/main/topics/jsonwebtoken/jsonwebtoken.png" alt="JWT" width="20" /> JWT
</span>

<span style="display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 12px; background-color: #f0ad4e; color: black; font-weight: 600; cursor: default;">
  <img src="https://raw.githubusercontent.com/github/explore/main/topics/bcrypt/bcrypt.png" alt="Bcrypt" width="20" /> Bcrypt
</span>

<span style="display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 12px; background-color: #000000; color: white; font-weight: 600; cursor: default;">
  <img src="https://raw.githubusercontent.com/github/explore/main/topics/express/express.png" alt="Express.js" width="20" /> Express.js
</span>

</div>


---

## Kurulum


# Depoyu klonla
git clone https://github.com/Mineerylmaz/SaaS-BackOffice-Backend.git
cd SaaS-BackOffice-Backend

# Bağımlılıkları yükle
npm install

