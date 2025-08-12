# Backend Ortam Değişkenleri (Configuration)

Bu dosyada backend uygulamasının çalışması için gerekli ortam değişkenleri listelenmiştir.  
`.env` dosyanıza aşağıdaki değişkenleri ekleyiniz.

| Değişken Adı               | Gerekli | Tip     | Açıklama                                                                    | Örnek Değer |
|----------------------------|---------|---------|------------------------------------------------------------------------------|-------------|
| `DB_HOST`                  | Evet    | string  | Veritabanı sunucu adresi                                                     | localhost   |
| `DB_USER`                  | Evet    | string  | Veritabanı kullanıcı adı                                                     | root        |
| `DB_PASS`                  | Evet    | string  | Veritabanı şifresi                                                           | "Mine123."  |
| `DB_NAME`                  | Evet    | string  | Kullanılan veritabanı ismi                                                   | krediler    |
| `DB_PORT`                  | Hayır   | number  | Veritabanı portu (default 3306)                                              | 3306        |
| `JWT_SECRET`               | Evet    | string  | JSON Web Token gizli anahtarı                                                | benimCokGizliAnahtarim123 |
| `PORT`                     | Hayır   | number  | Uygulamanın çalışacağı port                                                  | 32807       |
| `LOG_LEVEL`                | Hayır   | string  | Loglama seviyesi (info, error vb.)                                           | info        |
| `MOCK_SERVER_URL`          | Evet    | string  | Mock server ana URL’si                                                       | http://localhost:4000/api/disservis/success/urlkontrol |
| `MOCK_SERVER_PARAMETRELER` | Evet    | string  | Mock server parametre endpoint’i                                             | http://localhost:4000/api/params/api/params |
| `FUNC_GETCLOSESTBUSV3`     | Evet    | string  | getclosestbusV3 metodunun mock endpoint’i                                    | http://localhost:4000/api/bus/getclosestbusV3/PassengerInformationServices/Bus?... |
| `FUNC_GETROUTES`           | Evet    | string  | getroutes metodunun mock endpoint’i                                          | http://localhost:4000/api/bus/getroutes/PassengerInformationServices/Bus?...       |
| `FUNC_GETROUTEINFONEW`     | Evet    | string  | getrouteinfonew metodunun mock endpoint’i                                    | http://localhost:4000/api/bus/getroutesInfonew/PassengerInformationServices/Bus?... |

> **UYARI:** `.env` dosyanızı asla versiyon kontrolüne dahil etmeyin.  
> Gizli anahtarlarınızı güvenli bir yerde tutun.

---

