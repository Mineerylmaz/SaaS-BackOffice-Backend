# Backend Ortam Değişkenleri (Configuration)

Bu dosyada backend uygulamasının çalışması için gerekli ortam değişkenleri listelenmiştir.  
`.env` dosyanıza aşağıdaki değişkenleri ekleyiniz.

| Değişken Adı   | Gerekli | Tip     | Açıklama                           | Örnek Değer          |
|----------------|---------|---------|----------------------------------|----------------------|
| `DB_HOST`      | Evet    | string  | Veritabanı sunucu adresi         | localhost            |
| `DB_USER`      | Evet    | string  | Veritabanı kullanıcı adı          | root                 |
| `DB_PASSWORD`  | Evet    | string  | Veritabanı şifresi                | mysecretpassword     |
| `DB_NAME`      | Evet    | string  | Kullanılan veritabanı ismi        | saas_backend_db      |
| `DB_PORT`      | Hayır   | number  | Veritabanı portu (default 3306)  | 3306                 |
| `JWT_SECRET`   | Evet    | string  | JSON Web Token gizli anahtarı     | mysupersecretjwtkey  |
| `PORT`         | Hayır   | number  | Uygulamanın çalışacağı port       | 32807                |
| `LOG_LEVEL`    | Hayır   | string  | Loglama seviyesi (info, error..) | info                 |

> **UYARI:** `.env` dosyanızı asla versiyon kontrolüne dahil etmeyin.  
> Gizli anahtarlarınızı güvenli bir yerde tutun.

---

Kolay gelsin!  
