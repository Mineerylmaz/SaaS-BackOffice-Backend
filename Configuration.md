# Backend Ortam Değişkenleri (Configuration)

| Değişken Adı               | Gerekli | Tip     | Açıklama                                         | Örnek / Tam URL Örneği                                                |
|----------------------------|---------|---------|-------------------------------------------------|-----------------------------------------------------------------------|
| `DB_HOST`                  | Evet    | string  | Veritabanı sunucu adresi                         | localhost                                                             |
| `DB_USER`                  | Evet    | string  | Veritabanı kullanıcı adı                         | root                                                                  |
| `DB_PASS`                  | Evet    | string  | Veritabanı şifresi                               | "Mine123."                                                            |
| `DB_NAME`                  | Evet    | string  | Kullanılan veritabanı ismi                       | krediler                                                             |
| `DB_PORT`                  | Hayır   | number  | Veritabanı portu (default 3306)                  | 3306                                                                  |
| `PORT`                     | Hayır   | number  | Uygulamanın çalışacağı port                       | 32807                                                                 |
| `JWT_SECRET`               | Evet    | string  | JSON Web Token gizli anahtarı                    | benimCokGizliAnahtarim123                                             |
| `PIS_BASE_URL`             | Evet    | string  | API ana temel URL                                 | http://localhost:4000/api                                             |
| `EXTERNAL_SERVICE_CHECK_URL`| Evet   | string  | Dış servis url  kontrol endpoint path’i                | /disservis/success/urlkontrol                                         |
| `SERVICE_PARAMETERS_URL`   | Evet    | string  | Servis parametreleri endpoint path’i             | /params/api/params                                                    |
| `PIS_BASE_FUNC_URL`        | Evet    | string  | PIS fonksiyonları temel URL                       | http://localhost:4000/api/bus                                         |
| `FUNC_GETROUTES`           | Evet    | string  | getroutes metodu endpoint path’i                  | /getroutes/PassengerInformationServices/Bus                           |
| `FUNC_GETROUTEINFONEW`     | Evet    | string  | getrouteinfonew metodu endpoint path’i            | /getroutesInfonew/PassengerInformationServices/Bus                    |
| `FUNC_GETCLOSESTBUSV3`     | Evet    | string  | getclosestbusV3 metodu endpoint path’i            | /getclosestbusV3/PassengerInformationServices/Bus                     |

---

## Örnek tam URL oluşturma

- getroutes metodu tam URL:  
`http://localhost:4000/api/bus/getroutes/PassengerInformationServices/Bus`  
= `PIS_BASE_FUNC_URL` + `FUNC_GETROUTES`

- Benzer şekilde diğer metodlar için de base URL ile endpoint path birleştirilir.

