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
- Yönetici paneli ile kullanıcı ve plan yönetimi  
- Gelişmiş hata yönetimi ve doğrulama (validation)  
- Güvenli ve performanslı API tasarımı  

---

## Özellikler

- ✅ Kullanıcı Kayıt & Giriş (Bcrypt ile güvenli şifreleme)  
- ✅ JWT ile Yetkilendirme ve Kimlik Doğrulama  
- ✅ Abonelik Planları CRUD İşlemleri  
- ✅ Yönetici Yetkileri ile Kullanıcı ve Plan Yönetimi  
- ✅ Hata Yönetimi ve Validation  
- ✅ Güvenli API Tasarımı  

---

## Teknolojiler

<div align="center" style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin: 20px 0;">

  <div style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 20px; background: #339933; color: white; font-weight: 600; box-shadow: 0 2px 8px rgb(51 153 51 / 0.3); cursor: default;">
    <img src="https://raw.githubusercontent.com/github/explore/main/topics/nodejs/nodejs.png" alt="Node.js" width="24" />
    Node.js
  </div>

  <div style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 20px; background: #61dafb; color: #20232a; font-weight: 600; box-shadow: 0 2px 8px rgb(97 218 251 / 0.5); cursor: default;">
    <img src="https://raw.githubusercontent.com/github/explore/main/topics/react/react.png" alt="React" width="24" />
    React
  </div>

  <div style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 20px; background: #4479a1; color: white; font-weight: 600; box-shadow: 0 2px 8px rgb(68 121 161 / 0.4); cursor: default;">
    <img src="https://raw.githubusercontent.com/github/explore/main/topics/mysql/mysql.png" alt="MySQL" width="24" />
    MySQL
  </div>

  <div style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 20px; background: #d63031; color: white; font-weight: 600; box-shadow: 0 2px 8px rgb(214 48 49 / 0.4); cursor: default;">
    <img src="https://raw.githubusercontent.com/auth0/node-jsonwebtoken/main/logo/logo.png" alt="JWT" width="24" />
    JWT
  </div>

  <div style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 20px; background: #f0ad4e; color: #4a3c00; font-weight: 600; box-shadow: 0 2px 8px rgb(240 173 78 / 0.5); cursor: default;">
    <img src="https://raw.githubusercontent.com/kelektiv/node.bcrypt.js/master/logo/bcrypt.png" alt="Bcrypt" width="24" />
    Bcrypt
  </div>

  <div style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 20px; background: #000000; color: white; font-weight: 600; box-shadow: 0 2px 8px rgb(0 0 0 / 0.5); cursor: default;">
    <img src="https://raw.githubusercontent.com/github/explore/main/topics/express/express.png" alt="Express.js" width="24" />
    Express.js
  </div>

</div>



---

## Kurulum


# Depoyu klonla
git clone https://github.com/Mineerylmaz/SaaS-BackOffice-Backend.git
cd SaaS-BackOffice-Backend

# Bağımlılıkları yükle
npm install

