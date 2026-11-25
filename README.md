# Raf Fiyatları

İki şubeli telefon mağazası için raftaki telefonların alış/satış fiyatlarını tutan basit, mobil uyumlu uygulama.

## Özellikler

- Telefon ekle / düzenle / sil: şube, marka, model, hafıza (GB), pil sağlığı (%), garanti, alış ve satış fiyatı, not
- Şubeye göre sekmeler (Tüm şubeler / 1. Şube / 2. Şube)
- Arama (marka + model) ve filtreler: marka, hafıza, garanti, en az pil, fiyat aralığı, sıralama
- Kâr otomatik hesaplanır; müşteri ekranı görürken göz ikonu ile alış fiyatları gizlenir
- Şube adları uygulama içinden değiştirilebilir
- Tek ortak dükkan şifresiyle giriş (90 gün hatırlanır)

## Yerelde çalıştırma

Gerekli: Node.js 22.13 veya üstü.

```bash
npm install
npm start          # http://localhost:3000
npm test           # API testleri
```

Yerelde veriler `data/magaza.db` dosyasına yazılır, şifre istenmez. Şifreyi denemek için: `APP_PASSWORD=deneme npm start`.

## Yayına alma (Vercel + Turso)

1. Vercel'de **Add New → Project** ile bu GitHub deposunu içe aktar. Ayar değiştirmeden **Deploy** de.
2. Projede **Storage → Create Database → Turso** seç, projeye bağla. `TURSO_DATABASE_URL` ve `TURSO_AUTH_TOKEN` otomatik eklenir.
3. **Settings → Environment Variables** kısmına `APP_PASSWORD` ekle (dükkan şifresi).
4. **Deployments → Redeploy**. Tablolar ilk açılışta kendiliğinden oluşur.

Şifreyi değiştirince tüm cihazlardan çıkış yapılır; yeni şifreyle tekrar girilir.

## Yapı

```
src/
  server.js                 giriş noktası (Vercel bunu kullanır, yerelde dinlemeyi başlatır)
  create-app.js             Express uygulamasını kurar
  config.js                 ortam değişkenleri ve varsayılanlar
  db.js                     libSQL/Turso bağlantısı ve şema
  auth.js                   şifreli giriş ve oturum çerezi
  phones/                   telefon: doğrulama, veritabanı sorguları, API uçları
  branches/                 şube: listeleme ve ad değiştirme
public/                     arayüz (HTML + CSS + JS, derleme gerekmez)
test/                       API ve giriş testleri
```

## API

Tüm `/api/phones` ve `/api/branches` uçları giriş gerektirir (şifre ayarlıysa).

| Yöntem | Yol | Açıklama |
|---|---|---|
| GET | `/api/auth/session` | Oturum durumu |
| POST | `/api/auth/login` · `/api/auth/logout` | Giriş / çıkış |
| GET | `/api/phones?q=&branch_id=&brand=&storage_gb=&warranty=&min_battery=&min_price=&max_price=&sort=` | Liste + filtre |
| GET | `/api/phones/options` | Filtrelerde kullanılan marka ve GB listesi |
| POST | `/api/phones` | Telefon ekle |
| PUT | `/api/phones/:id` | Telefon güncelle |
| DELETE | `/api/phones/:id` | Telefon sil |
| GET / PUT | `/api/branches[/:id]` | Şubeleri listele / adını değiştir |

## Ortam değişkenleri

Bkz. `.env.example`: `APP_PASSWORD`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `PORT`.
