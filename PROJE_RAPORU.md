# Proje Raporu: Raf Fiyatları

**Hazırlanma tarihi:** 25 Kasım 2026
**Durum:** Yayında ve çalışıyor
**Canlı adres:** https://raf-fiyatlari.vercel.app
**Kaynak kod:** https://github.com/Emiroloji/raf-fiyatlari (gizli depo)

> Bu raporda şifre, token veya gizli anahtar **yoktur**. Gizli bilgiler sadece Vercel panelinde durur.

---

## İçindekiler

1. [Projenin amacı](#1-projenin-amacı)
2. [İstekler ve karşılanma durumu](#2-istekler-ve-karşılanma-durumu)
3. [Özellikler](#3-özellikler)
4. [Kullanım kılavuzu](#4-kullanım-kılavuzu)
5. [Teknoloji seçimleri ve nedenleri](#5-teknoloji-seçimleri-ve-nedenleri)
6. [Mimari](#6-mimari)
7. [Dosya yapısı](#7-dosya-yapısı)
8. [Veritabanı](#8-veritabanı)
9. [API](#9-api)
10. [Doğrulama kuralları](#10-doğrulama-kuralları)
11. [Güvenlik ve giriş sistemi](#11-güvenlik-ve-giriş-sistemi)
12. [Arayüz ve tasarım](#12-arayüz-ve-tasarım)
13. [Testler](#13-testler)
14. [Yayına alma (Deploy)](#14-yayına-alma-deploy)
15. [Ortam değişkenleri](#15-ortam-değişkenleri)
16. [Karşılaşılan sorunlar ve çözümleri](#16-karşılaşılan-sorunlar-ve-çözümleri)
17. [Build uyarıları](#17-build-uyarıları)
18. [Git geçmişi](#18-git-geçmişi)
19. [Bakım ve işletme](#19-bakım-ve-işletme)
20. [Bilinen sınırlamalar](#20-bilinen-sınırlamalar)
21. [Gelecekte eklenebilecekler](#21-gelecekte-eklenebilecekler)
22. [Hesaplar ve servisler özeti](#22-hesaplar-ve-servisler-özeti)

---

## 1. Projenin amacı

İki şubesi olan bir telefon mağazasında rafta duran ikinci el ve sıfır telefonların fiyatlarını akılda tutmak zor. Bu uygulama her telefonun alış ve satış fiyatını, özelliklerini ve hangi şubede olduğunu tek bir yerde tutar. İki şubedeki telefonlardan aynı anda açılabilir, bir şubede yapılan değişiklik diğerinde anında görünür.

**Kullanıcı:** Mağaza sahibi ve çalışanlar
**Kullanım yeri:** Tezgâhta, telefondan
**Ana iş:** Bir telefonu bulup fiyatını birkaç saniyede görmek

---

## 2. İstekler ve karşılanma durumu

| İstek | Durum | Nasıl karşılandı |
|---|---|---|
| 2 şube | ✅ | Şube tablosu, şube sekmeleri, her telefonda şube seçimi, şube adları değiştirilebilir |
| Marka | ✅ | Serbest metin, daha önce girilen markalar öneri olarak çıkar |
| Model | ✅ | Serbest metin |
| Garanti | ✅ | Garantili / Garantisiz anahtarı |
| GB (hafıza) | ✅ | 32 GB – 1 TB arası hazır seçenekler |
| Pil yüzdesi | ✅ | 1–100 arası, isteğe bağlı (sıfır telefonlarda boş bırakılabilir) |
| Alış fiyatı | ✅ | Elle girilir, `15.000` gibi noktalı yazım kabul edilir |
| Satış fiyatı | ✅ | Elle girilir, listede sarı fiyat etiketi olarak gösterilir |
| Basit olsun | ✅ | Tek ekran, alttan açılan formlar, derleme gerektirmeyen kod |
| Şirket projesi gibi, temiz kod | ✅ | Katmanlı yapı, testler, README, ayrı modüller |
| Filtreleme | ✅ | Arama + marka, GB, garanti, pil, fiyat aralığı, sıralama |
| Tamamen mobil uyumlu | ✅ | Telefon için tasarlandı, ana ekrana eklenebilir |
| Veritabanı (seçim bana bırakıldı) | ✅ | Yerelde SQLite dosyası, yayında Turso (bulut SQLite) |
| GitHub'a yükleme | ✅ | Gizli depo |
| Vercel'de yayın | ✅ | raf-fiyatlari.vercel.app |

**İstenmeden eklenenler (gerekli görüldüğü için):**
- **Şifreli giriş:** Site internete açılınca alış fiyatlarını herkes görebilirdi.
- **Kâr hesabı:** Alış ve satış girilince kâr kendiliğinden hesaplanır.
- **Alış fiyatını gizleme:** Müşteri ekrana bakarken alış fiyatı ve kâr tek dokunuşla gizlenir.
- **Not alanı:** "Kutulu", "kasada çizik var" gibi bilgiler için.
- **Toplam raf değeri:** Listenin üstünde, filtredeki telefonların toplam satış değeri.

---

## 3. Özellikler

### Liste ekranı
- Şube sekmeleri: **Tüm şubeler / 1. Şube / 2. Şube**. Seçilen sekme telefonda hatırlanır.
- Arama kutusu: Marka ve model içinde arar (örn. "iphone 13", "a54"). Yazmayı bıraktıktan 0,2 saniye sonra sonuç gelir.
- Her satırda:
  - Marka (küçük), model (büyük)
  - GB, pil yüzdesi (%80 altıysa turuncu), garanti durumu (garantiliyse yeşil)
  - "Tüm şubeler" görünümündeyse şube adı
  - Not (varsa, italik)
  - Sağda **sarı raf etiketi** şeklinde satış fiyatı
  - Altında küçük yazıyla alış fiyatı ve kâr (zarar varsa turuncu)
  - Sol kenarda şube rengi çizgisi (1. şube yeşil-mavi, 2. şube mor)
- Üstte özet: "4 telefon, raftaki toplam satış değeri 85.800 ₺"
- Boş liste mesajları: Hiç telefon yoksa "+ ile ilk telefonu ekle", filtre sonucu boşsa "Aramayı veya filtreleri değiştir".

### Telefon ekleme / düzenleme
- Sağ alttaki sarı **+** butonu formu açar.
- Bir telefona dokunmak, düzenleme formunu dolu olarak açar.
- Alanlar: Şube, Marka, Model, Hafıza, Pil sağlığı, Garanti, Alış fiyatı, Satış fiyatı, Not
- Fiyat alanından çıkınca sayı biçimlenir (`15000` → `15.000`).
- Alış ve satış girildikçe "Bu telefondan kâr: X ₺" canlı gösterilir.
- Hatalı alanların altında Türkçe hata mesajı çıkar.
- Yeni telefon eklenirken şube, o an seçili sekmedeki şube olarak gelir.

### Silme
- Düzenleme formunda **Sil** butonu var.
- Yanlışlıkla silmeyi önlemek için iki dokunuş gerekir: ilk dokunuşta "Emin misin? Tekrar dokun" yazar.

### Filtreler
"Filtre" butonu alttan bir sayfa açar:
- Marka (veritabanındaki markalardan)
- Hafıza (veritabanındaki GB değerlerinden)
- Garanti: Hepsi / Garantili / Garantisiz
- Pil en az: %80, %85, %90, %95
- En düşük / en yüksek satış fiyatı
- Sıralama: En son eklenen, ucuzdan pahalıya, pahalıdan ucuza, pili en iyi önce, marka adına göre

Kaç filtre açıksa Filtre butonunda sarı sayı rozeti görünür. "Temizle" hepsini sıfırlar.

### Alış fiyatını gizleme
Sağ üstteki **göz ikonu**. Basınca tüm alış fiyatları ve kâr gizlenir, ikon sarı olur. Tercih o telefonda hatırlanır.

### Şube adları
Sağ üstteki **dükkan ikonu**. İki şubenin adı değiştirilebilir (örn. "Kadıköy", "Çarşı"). Aynı sayfada **Çıkış yap** butonu da var.

### Giriş ekranı
Şifre ayarlıysa uygulama açılınca "Dükkan şifresini gir" ekranı gelir. Doğru şifreden sonra telefon 90 gün boyunca hatırlanır.

---

## 4. Kullanım kılavuzu

### Telefona uygulama gibi ekleme
- **iPhone:** Safari'de `raf-fiyatlari.vercel.app` → paylaş butonu → **Ana Ekrana Ekle**
- **Android:** Chrome'da aç → sağ üst **⋮** → **Ana ekrana ekle**

### Günlük kullanım
1. Rafa yeni telefon gelince **+** → bilgileri gir → **Kaydet**.
2. Müşteri fiyat sorunca arama kutusuna modeli yaz.
3. Telefon satılınca o telefona dokun → **Sil** → **Tekrar dokun**.
4. Fiyat değişince telefona dokun → yeni fiyatı yaz → **Kaydet**.
5. Telefon başka şubeye geçince telefona dokun → şubeyi değiştir → **Kaydet**.

### Bilgisayarda çalıştırma (geliştirme için)
```bash
cd "~/Desktop/reform fiyat uygulama"
npm install
npm start              # http://localhost:3000
npm test               # testleri çalıştırır
APP_PASSWORD=deneme npm start   # şifreli halini denemek için
```
Bilgisayarda çalışırken veriler `data/magaza.db` dosyasına yazılır, canlı siteyle karışmaz.

---

## 5. Teknoloji seçimleri ve nedenleri

| Katman | Seçim | Sürüm | Neden |
|---|---|---|---|
| Çalışma ortamı | Node.js | 24.x | Güncel uzun destekli sürüm, Vercel'in varsayılanı |
| Sunucu | Express | 5.1.0 | En bilinen, basit Node sunucusu. Vercel'de ayar gerektirmeden çalışır. Sürüm 5, async hataları kendisi yakalar |
| Veritabanı istemcisi | @libsql/client | 0.15.15 | Aynı kodla hem yerel dosyaya hem Turso'ya bağlanır |
| Canlı veritabanı | Turso | Starter (ücretsiz) | Bulut SQLite. Vercel Marketplace'ten tek tıkla eklenir, bilgileri otomatik tanımlar |
| Arayüz | Saf HTML + CSS + JavaScript | — | Derleme yok, framework yok. Basit ve hızlı |
| Yazı tipi | Archivo (Google Fonts) | — | Rakamları eşit genişlikte (fiyatlar alt alta hizalı), dar kesimi başlıklara karakter katıyor |
| Test | Node'un kendi test aracı (`node:test`) | — | Ek paket gerektirmez |
| Barındırma | Vercel | Hobby (ücretsiz) | GitHub'a gönderince otomatik yayın |
| Kod deposu | GitHub | Gizli depo | Yedek ve otomatik yayın için |

**Toplam dış bağımlılık:** sadece 2 paket (`express`, `@libsql/client`).

**Neden Next.js / React kullanılmadı?** İstek "basit, karmaşık olmasın" idi. Tek ekranlı bir uygulama için framework gereksiz karmaşıklık getirirdi.

**Neden önce yerel SQLite, sonra Turso?** İlk sürüm dükkândaki bir bilgisayarda çalışacak şekilde yapıldı. İki şube farklı yerlerde olduğu için internete açmak gerekti. Vercel diske yazılan dosyayı kalıcı tutmadığı için bulut veritabanına (Turso) geçildi. Turso da SQLite olduğu için SQL kodunun neredeyse hiç değişmesi gerekmedi.

---

## 6. Mimari

```
 Telefon / Tarayıcı
        │
        ▼
 ┌─────────────────────────────┐
 │  Vercel                     │
 │  ├─ CDN: public/ (HTML/CSS/JS)
 │  └─ Fonksiyon: src/server.js (Express)
 │        │
 │        ├─ /api/auth/*      → auth.js (giriş, çıkış, oturum)
 │        ├─ requireLogin     → şifre kontrolü
 │        ├─ /api/phones/*    → phones/ (route → validation → repository)
 │        └─ /api/branches/*  → branches/
 └────────┼────────────────────┘
          ▼
   Turso (bulut SQLite)
```

**Katmanlar:**
- **routes:** İsteği alır, parametreleri okur, cevabı döner
- **validation:** Gelen veriyi kontrol eder ve temizler
- **repository:** Sadece veritabanı sorguları
- **create-app.js:** Parçaları birleştirir (dependency injection). Testlerde bellek içi veritabanıyla kurulabiliyor.
- **server.js:** Ortamı okur. Vercel'de uygulamayı dışa aktarır, bilgisayarda sunucuyu başlatır.

**Güvenli başlatma:** Veritabanı bağlı değilse veya bağlantı başarısızsa uygulama çökmez. Ekranda ne eksik olduğunu yazan küçük bir yedek uygulama açılır.

---

## 7. Dosya yapısı

```
reform fiyat uygulama/
├── PROJE_RAPORU.md              bu rapor
├── README.md                    kısa kurulum ve kullanım
├── package.json                 proje bilgisi, komutlar, bağımlılıklar
├── package-lock.json            bağımlılıkların kilitli sürümleri
├── .env.example                 ortam değişkenleri örneği (değersiz)
├── .gitignore                   GitHub'a gitmeyecek dosyalar
│
├── src/                         sunucu kodu
│   ├── server.js                giriş noktası; Vercel bunu kullanır
│   ├── create-app.js            Express uygulamasını kurar
│   ├── config.js                ayarlar ve Turso değişkenlerini bulma
│   ├── db.js                    veritabanı bağlantısı ve tablo şeması
│   ├── auth.js                  şifreli giriş ve oturum çerezi
│   ├── phones/
│   │   ├── phone.routes.js      /api/phones uçları
│   │   ├── phone.validation.js  form doğrulama
│   │   └── phone.repository.js  SQL sorguları ve filtreler
│   └── branches/
│       └── branch.module.js     şube listeleme ve ad değiştirme
│
├── public/                      arayüz (tarayıcıda çalışır)
│   ├── index.html               sayfa iskeleti, formlar
│   ├── styles.css               tüm görünüm, karanlık mod
│   └── app.js                   arayüz mantığı
│
├── test/
│   ├── helpers.js               test için uygulama başlatıcı
│   ├── api.test.js              telefon, filtre ve şube testleri (6 test)
│   └── auth.test.js             giriş testleri (3 test)
│
├── data/                        yerel veritabanı (GitHub'a gitmez)
└── node_modules/                indirilen paketler (GitHub'a gitmez)
```

Toplam kod: yaklaşık 1.650 satır (src + public + test).

---

## 8. Veritabanı

### `branches` (şubeler)
| Sütun | Tür | Açıklama |
|---|---|---|
| id | INTEGER, birincil anahtar | 1 veya 2 |
| name | TEXT | Şube adı (varsayılan "1. Şube", "2. Şube") |

Şubeler ilk açılışta otomatik eklenir. Var olan şubelerin üzerine yazılmaz (`INSERT OR IGNORE`), böylece uygulamadan değiştirilen adlar korunur.

### `phones` (telefonlar)
| Sütun | Tür | Zorunlu | Açıklama |
|---|---|---|---|
| id | INTEGER, otomatik artan | — | Telefon numarası |
| branch_id | INTEGER → branches.id | Evet | Hangi şubede |
| brand | TEXT | Evet | Marka |
| model | TEXT | Evet | Model |
| storage_gb | INTEGER | Evet | Hafıza (GB). 1 TB = 1024 |
| battery | INTEGER | Hayır | Pil sağlığı % |
| warranty | INTEGER (0/1) | Evet | 1 = garantili |
| buy_price | INTEGER | Evet | Alış fiyatı (tam TL, kuruş yok) |
| sell_price | INTEGER | Evet | Satış fiyatı (tam TL) |
| note | TEXT | Hayır | Not |
| created_at | TEXT | Otomatik | Eklenme zamanı |
| updated_at | TEXT | Otomatik | Son güncelleme zamanı |

**İndeksler:** `branch_id` ve `brand` üzerinde (şube ve marka filtreleri hızlı çalışsın diye).

**Tablolar nasıl oluşuyor:** Uygulama her açılışta `CREATE TABLE IF NOT EXISTS` çalıştırır. Turso'ya elle tablo eklemek gerekmedi.

**Fiyatlar neden tam sayı:** Ondalıklı sayılarda yuvarlama hataları olabiliyor. Telefon fiyatlarında kuruş kullanılmadığı için tam TL saklanıyor.

---

## 9. API

Şifre ayarlıysa `/api/auth/*` dışındaki tüm uçlar giriş ister. Giriş yoksa `401` döner.

| Yöntem | Yol | Açıklama | Başarılı cevap |
|---|---|---|---|
| GET | `/api/auth/session` | Giriş yapılmış mı, şifre açık mı | `{ loggedIn, authEnabled }` |
| POST | `/api/auth/login` | `{ password }` ile giriş | 200 + çerez / yanlışsa 401 |
| POST | `/api/auth/logout` | Çıkış | 204 |
| GET | `/api/phones` | Telefon listesi (filtreli) | Dizi |
| GET | `/api/phones/options` | Filtre seçenekleri | `{ brands, storages }` |
| POST | `/api/phones` | Telefon ekle | 201 + telefon |
| PUT | `/api/phones/:id` | Telefon güncelle | 200 + telefon / yoksa 404 |
| DELETE | `/api/phones/:id` | Telefon sil | 204 / yoksa 404 |
| GET | `/api/branches` | Şube listesi | Dizi |
| PUT | `/api/branches/:id` | `{ name }` ile şube adı değiştir | 200 / boşsa 400 |

### Liste filtre parametreleri (`GET /api/phones?...`)
| Parametre | Örnek | Anlamı |
|---|---|---|
| q | `iphone 13` | Marka + model içinde arama |
| branch_id | `1` | Şube |
| brand | `Apple` | Marka (büyük-küçük harf duyarsız) |
| storage_gb | `128` | Hafıza |
| warranty | `1` / `0` | Garantili / garantisiz |
| min_battery | `90` | En az pil |
| min_price | `10000` | En düşük satış fiyatı |
| max_price | `30000` | En yüksek satış fiyatı |
| sort | `newest`, `price_asc`, `price_desc`, `battery_desc`, `brand` | Sıralama |

Hatalı form gönderilirse `400` ve alan bazında Türkçe hata döner:
```json
{ "errors": { "brand": "Marka yaz.", "battery": "Pil 1 ile 100 arasında olmalı." } }
```

**SQL güvenliği:** Tüm sorgular parametreli. Kullanıcıdan gelen hiçbir değer SQL'e doğrudan yapıştırılmıyor. Sıralama sadece sabit bir listeden seçilebiliyor.

---

## 10. Doğrulama kuralları

| Alan | Kural | Hata mesajı |
|---|---|---|
| Şube | Var olan bir şube olmalı | "Şube seç." |
| Marka | Boş olamaz, en fazla 40 karakter | "Marka yaz." |
| Model | Boş olamaz, en fazla 80 karakter | "Model yaz." |
| Hafıza | Pozitif tam sayı | "Hafızayı GB olarak yaz." |
| Pil | Boş olabilir; doluysa 1–100 | "Pil 1 ile 100 arasında olmalı." |
| Alış fiyatı | 0 – 10.000.000 arası tam sayı | "Alış fiyatını yaz." |
| Satış fiyatı | 0 – 10.000.000 arası tam sayı | "Satış fiyatını yaz." |
| Not | İsteğe bağlı, en fazla 200 karakter | — |

Fiyatlarda `15.000`, `15 000` veya `15000` yazılabilir, hepsi 15000 olarak kaydedilir.
Metin alanlarının başındaki ve sonundaki boşluklar silinir.
Doğrulama hem tarayıcıda hem sunucuda yapılır. Asıl kontrol sunucudadır.

---

## 11. Güvenlik ve giriş sistemi

- **Tek ortak şifre:** Vercel'deki `APP_PASSWORD` değişkeni. Kullanıcı hesabı yok, iki şube aynı şifreyi kullanır.
- **Oturum çerezi:** `raf_oturum` adında çerez, 90 gün geçerli.
  - `HttpOnly`: JavaScript okuyamaz
  - `Secure`: canlıda sadece HTTPS ile gönderilir
  - `SameSite=Lax`: başka sitelerden gelen isteklerde gönderilmez
- **Çerezin içeriği:** Şifrenin kendisi değil, şifreden HMAC-SHA256 ile türetilen bir imza. Şifre değişince imza da değişir, tüm cihazların oturumu kendiliğinden kapanır.
- **Zamanlama saldırısına karşı:** Şifre ve çerez karşılaştırmaları `timingSafeEqual` ile yapılır.
- **Deneme-yanılmaya karşı:** Yanlış şifrede cevap 0,6 saniye geciktirilir.
- **XSS'e karşı:** Arayüzde kullanıcıdan gelen tüm metinler ekrana basılmadan önce kaçırılıyor (`escapeHtml`).
- **İstek boyutu sınırı:** JSON gövdesi en fazla 20 KB.
- **Gizli bilgiler:** Turso token'ı ve şifre sadece Vercel'de "Sensitive" olarak duruyor. Kodda, GitHub'da ve bu raporda yok. `.env` dosyaları `.gitignore`'da.
- **Depo gizli:** GitHub deposu private.
- **Önizleme (Preview) linkleri:** `APP_PASSWORD` şu an sadece Production'da tanımlı. Preview linkleri şifresiz açılır. Önerilen: Vercel'de bu değişkene Preview'u da eklemek.

**Bilinçli olarak yapılmayanlar (basitlik için):** Kullanıcı bazlı hesaplar, yetki seviyeleri, işlem geçmişi (kim neyi değiştirdi).

---

## 12. Arayüz ve tasarım

**Tasarım fikri:** Dükkân rafındaki fiyat etiketi. Sayfanın tek "iddialı" öğesi satış fiyatının gösterildiği **sarı raf etiketi** (sol tarafı sivri, delikli etiket şekli). Geri kalan her şey sade tutuldu.

### Renkler
| Ad | Açık mod | Karanlık mod | Kullanım |
|---|---|---|---|
| Arka plan (steel) | `#E9EDF1` | `#0F151C` | Sayfa zemini |
| Yüzey | `#FFFFFF` | `#18212B` | Satırlar, formlar |
| Mürekkep | `#17202B` | `#E8EDF2` | Yazı |
| Etiket sarısı | `#FFD43B` | `#FFD43B` | Fiyat etiketi, + butonu, filtre rozeti |
| 1. şube | `#0E7C6B` | `#3BC4AE` | Şube çizgisi ve noktası |
| 2. şube | `#7A3E8E` | `#C08AD3` | Şube çizgisi ve noktası |
| Uyarı | `#B4410E` | `#F08A52` | Düşük pil, zarar, hata, sil |
| İyi | `#1D7A3A` | `#5FCB7E` | Garantili, kâr |

### Yazı
- **Archivo** (tek aile). Başlıklarda dar kesim (`font-stretch: 75%`).
- Tüm rakamlar eşit genişlikte (`tabular-nums`), fiyatlar alt alta hizalı durur.

### Mobil uyumluluk
- Telefon ekranı için tasarlandı. Bilgisayarda en fazla 760 px genişlikte ortalanır.
- Üst bar ve arama kaydırırken sabit kalır.
- Formlar telefonda alttan kayarak açılır, geniş ekranda ortada pencere olur.
- Dokunma alanları en az 44 px.
- iPhone çentiği ve alt çubuğu için güvenli alan boşlukları (`safe-area-inset`).
- Fiyat alanlarında sayı klavyesi açılır (`inputmode="numeric"`).
- 380 px'den dar ekranlarda iki sütunlu form alanları tek sütuna düşer.

### Erişilebilirlik
- Klavye odağı mavi çerçeveyle görünür.
- Ekran okuyucular için ikon butonlarına açıklama eklendi.
- "Hareketi azalt" ayarı açık olan cihazlarda animasyonlar kapanır.
- Karanlık mod: telefonun ayarına göre otomatik.

### Kasıtlı tercihler
- Tarayıcının "Emin misiniz?" penceresi yerine iki dokunuşlu silme (telefonda daha rahat).
- Tüm metinler sade Türkçe ve eylem odaklı: "Kaydet", "Telefon rafa eklendi", "Sonuçları göster".

---

## 13. Testler

Komut: `npm test` → **9 test, 9 başarılı**

| Dosya | Test | Neyi kontrol ediyor |
|---|---|---|
| api.test.js | Şubeler ilk açılışta oluşur | İki şube otomatik ekleniyor mu |
| api.test.js | Telefon eklenir, fiyatlar sayıya çevrilir | `"18.000"` → 18000, garanti → 1, şube adı geliyor mu |
| api.test.js | Eksik alanlar reddedilir | Türkçe hata mesajları dönüyor mu |
| api.test.js | Filtreler çalışır | Şube, arama, garanti, pil, fiyat, GB, sıralama, seçenekler |
| api.test.js | Güncelleme ve silme | Fiyat güncelleniyor mu, ikinci silmede 404 dönüyor mu |
| api.test.js | Şube adı değiştirilir | Boş ad reddediliyor mu |
| auth.test.js | Girişsiz veri görülmez | Şifre varken 401 dönüyor mu |
| auth.test.js | Yanlış şifre reddedilir | Çerez verilmiyor mu |
| auth.test.js | Doğru şifre erişim verir | Gerçek çerez kabul, sahte çerez reddediliyor mu |

Testler bellek içi veritabanıyla çalışır, gerçek veriye dokunmaz.

**Elle yapılan kontroller:**
- Bilgisayarda tarayıcıda örnek telefonlarla liste ve form görünümü
- Şifreli halde dosya veritabanıyla giriş ve liste
- Vercel ortamı taklit edilerek "veritabanı bağlı değil" mesajı
- Turso değişken adlarının farklı ön eklerle bulunması
- Canlı sitede kullanıcı tarafından: giriş, telefon ekleme, yenileme sonrası kalıcılık ✅

---

## 14. Yayına alma (Deploy)

### Yapılan adımlar (sırasıyla)
1. Yerel git deposu oluşturuldu (`main` dalı).
2. GitHub'da **gizli** `raf-fiyatlari` deposu açıldı ve kod gönderildi.
3. Vercel'de **Add New → Project** ile depo içe aktarıldı, ayar değiştirmeden **Deploy** edildi.
   - İlk yayın `500 FUNCTION_INVOCATION_FAILED` verdi (veritabanı henüz yoktu, bkz. Bölüm 16).
4. Vercel **Storage → Create Database → Turso** ile veritabanı oluşturuldu.
   - Plan: **Starter** (ücretsiz)
   - Veritabanı adı: `raf-fiyatlari`
   - Projeye bağlandı: Production ve Preview
   - "Create database branch" seçenekleri **boş** bırakıldı (her yayında ayrı boş veritabanı açılmasın diye)
   - Değişkenler otomatik eklendi: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`
5. **Environment Variables**'a `APP_PASSWORD` eklendi (Production).
6. **Redeploy** yapıldı → durum **Ready**, giriş ekranı göründü.
7. Build uyarıları incelendi, Node sürümü sabitlendi (bkz. Bölüm 17).

### Yayın bilgileri
| Bilgi | Değer |
|---|---|
| Ana adres | https://raf-fiyatlari.vercel.app |
| Vercel ekibi | emiroloji's projects (Hobby plan) |
| Vercel projesi | raf-fiyatlari |
| Yayın dalı | `main` |
| Build bölgesi | Washington, D.C. (iad1) |
| Build süresi | ~11 saniye |
| Statik dosyalar | `public/` klasörü Vercel CDN'den sunulur |
| Sunucu | `src/server.js` Vercel Function olarak çalışır |

### Otomatik yayın
`main` dalına her `git push` yapıldığında Vercel siteyi kendiliğinden yeniden yayınlar. Elle bir şey yapmak gerekmez.

---

## 15. Ortam değişkenleri

| Değişken | Nerede | Kim ekledi | Açıklama |
|---|---|---|---|
| `TURSO_DATABASE_URL` | Vercel (Production, Preview) | Turso entegrasyonu, otomatik | Veritabanı adresi (`libsql://...`) |
| `TURSO_AUTH_TOKEN` | Vercel (Production, Preview) | Turso entegrasyonu, otomatik | Veritabanı erişim anahtarı |
| `APP_PASSWORD` | Vercel (Production) | Elle | Dükkan şifresi |
| `PORT` | Yerel, isteğe bağlı | — | Varsayılan 3000 |
| `HOST` | Yerel, isteğe bağlı | — | Varsayılan 0.0.0.0 (aynı Wi-Fi'deki telefonlar erişebilsin) |
| `VERCEL` | Vercel, otomatik | Vercel | Kod Vercel'de olduğunu buradan anlar |

**Özel kural:** Kod `TURSO_DATABASE_URL` bulamazsa, değeri `libsql://` ile başlayan herhangi bir `*_URL` değişkenini (örn. `STORAGE_URL`) ve aynı ön ekli token'ı arar. Vercel entegrasyonu farklı bir ön ek kullansa bile çalışsın diye eklendi.

Değişkenlerin değerlerini değiştirdikten sonra **Redeploy** gerekir.

---

## 16. Karşılaşılan sorunlar ve çözümleri

| # | Sorun | Sebep | Çözüm |
|---|---|---|---|
| 1 | Filtre butonunda filtre yokken "0" rozeti görünüyordu | CSS'teki `display` kuralı HTML'in `hidden` özelliğini eziyordu | Genel `[hidden] { display: none !important; }` kuralı eklendi |
| 2 | Telefon formunda yatay kaydırma çubuğu çıkıyordu | Form başlığı ve alt kısmın kenar boşlukları kaydırma çubuğu genişliğiyle taşıyordu | Form penceresine `overflow-x: hidden` eklendi |
| 3 | Test komutu dosyaları bulamadı | `node --test test/` klasör yolunu bu şekilde kabul etmedi | `node --test "test/**/*.test.js"` olarak düzeltildi |
| 4 | Vercel'de dosya veritabanı kalıcı olmazdı | Vercel fonksiyonlarının diski geçici ve salt okunur | Turso'ya geçildi; kod `@libsql/client` ile hem dosya hem bulutla çalışır hale getirildi |
| 5 | İlk yayında `500 FUNCTION_INVOCATION_FAILED` | Veritabanı bağlı değildi, uygulama açılırken salt okunur diske dosya yazmaya çalışıp çöktü | Veritabanı yoksa ya da bağlantı başarısızsa çökmek yerine "Veritabanı bağlı değil…" mesajı gösteren yedek uygulama eklendi |
| 6 | Turso değişken adlarının farklı gelme ihtimali | Vercel entegrasyon ekranında "Custom Prefix: STORAGE" vardı | Değişkenleri ön ekten bağımsız bulan kod eklendi (sonunda adlar standart `TURSO_*` geldi) |
| 7 | Dosya düzenleme araçları geçici hata verdi | Claude Code otomatik modundaki güvenlik kontrolü anlık cevap vermedi | Tekrar denendi, sorun kendiliğinden geçti (projeyle ilgisi yok) |

---

## 17. Build uyarıları

Vercel build loglarında 3 uyarı vardı:

| Uyarı | Kaynak | Durum |
|---|---|---|
| `Detected "engines": { "node": ">=22.13" }` | Bizim `package.json` | ✅ **Düzeltildi**: `"node": "24.x"` olarak sabitlendi. Vercel artık habersizce yeni ana sürüme geçmeyecek |
| `npm warn Unknown env config "cache-dir"` | Vercel'in build sunucusu | Bizimle ilgisi yok, yapılacak bir şey yok |
| `npm warn deprecated node-domexception@1.0.0` | `@libsql/client` → `@libsql/hrana-client` → `node-fetch` → `fetch-blob` → `node-domexception` | Zararsız. Turso kütüphanesi güncellenince kendiliğinden gider |

---

## 18. Git geçmişi

| Commit | Tarih | Açıklama |
|---|---|---|
| `93fb297` | 25.11.2026 11:24 | Raf fiyatları uygulaması: telefon stok ve fiyat takibi (ilk sürüm: Turso, giriş, testler dahil) |
| `e2b5363` | 25.11.2026 11:48 | Veritabanı bağlı değilse çökme yerine açıklayıcı hata göster |
| `831fe61` | 25.11.2026 11:54 | Turso değişkenlerini farklı ön eklerle de bul |
| `738168c` | 25.11.2026 12:49 | Node sürümünü 24.x olarak sabitle |

**Not:** İlk sürüm (yerel SQLite, şifresiz) GitHub'a gönderilmeden önce Turso ve şifreli girişe geçirildi. Bu yüzden ilk commit doğrudan yayına hazır hali içerir.

---

## 19. Bakım ve işletme

### Şifreyi değiştirmek
Vercel → raf-fiyatlari → **Environment Variables** → `APP_PASSWORD` → **⋯ → Edit** → yeni şifre → **Save** → **Deployments → ⋯ → Redeploy**.
Tüm cihazlardan çıkış yapılır, herkes yeni şifreyle girer.

### Şube adını değiştirmek
Uygulamada sağ üstteki dükkan ikonu → adları yaz → **Adları kaydet**. Kod değişikliği gerekmez.

### Kodda değişiklik yapmak
Kodu düzenle → `npm test` → `git add -A && git commit -m "açıklama" && git push`. Vercel 1 dakika içinde yayınlar.

### Yayın bozulursa geri almak
Vercel → **Overview** → **Instant Rollback** → önceki çalışan yayını seç.

### Yedek
- **Canlı veri:** Turso'da. Vercel → Storage → raf-fiyatlari → **Open in Turso Cloud** üzerinden yönetilir. Geri yükleme seçenekleri Turso planına göre değişir; Turso Cloud panelinden kontrol et.
- Elle yedek almak için Turso CLI ile: `turso db shell raf-fiyatlari .dump > yedek.sql` (Turso CLI kurulu ve giriş yapılmış olmalı).
- **Kod:** GitHub'da.

### Hata ayıklama
- Vercel → **Logs**: Canlı sitedeki hatalar burada görünür (`Uygulama başlatılamadı:` ile başlayan satırlar veritabanı sorunlarını gösterir).
- Ekranda "Uygulama açılamadı" yazıyorsa altındaki mesaj sorunu söyler (veritabanı bağlı değil, Postgres bağlanmış vb.).

### Maliyet
| Servis | Plan | Ücret |
|---|---|---|
| Vercel | Hobby | Ücretsiz |
| Turso | Starter | Ücretsiz |
| GitHub | Ücretsiz | Ücretsiz |

Bir dükkânın telefon sayısı ve kullanımı için ücretsiz sınırlar fazlasıyla yeterli.

---

## 20. Bilinen sınırlamalar

- **Satış kaydı yok:** Satılan telefon silinir, geçmişi tutulmaz.
- **Kullanıcı ayrımı yok:** Herkes aynı şifreyle girer, kimin neyi değiştirdiği görülmez.
- **Aynı anda düzenleme:** İki kişi aynı telefonu aynı anda düzenlerse son kaydeden kazanır.
- **Liste kendiliğinden yenilenmez:** Diğer şubede eklenen telefonu görmek için sayfayı yenilemek ya da bir filtre/sekme değiştirmek gerekir.
- **Türkçe karakterli arama:** Büyük-küçük harf duyarsızlığı İngilizce harfler için tam çalışır. "İ/ı", "Ş/ş" gibi harflerde büyük-küçük farkı eşleşmeyebilir (marka/model adları genelde Latin harfli olduğu için pratikte sorun çıkarmaz).
- **Zaman damgaları:** Turso sunucusu UTC saatini kullanır. `created_at` / `updated_at` ekranda gösterilmediği için şimdilik etkisi yok.
- **Preview linkleri şifresiz:** `APP_PASSWORD` sadece Production'da (bkz. Bölüm 11).
- **Çevrimdışı çalışmaz:** İnternet yoksa uygulama açılmaz.

---

## 21. Gelecekte eklenebilecekler

Öncelik sırasına göre öneriler:

1. **Satıldı olarak işaretle:** Silmek yerine satış tarihi ve satış fiyatıyla arşive taşı. Aylık satış ve kâr raporu buna dayanır.
2. **IMEI / seri numarası:** Aynı modelden birden fazla telefonu ayırt etmek ve sorgulamak için.
3. **Fotoğraf:** Telefonun durumunu göstermek için (Vercel Blob ile).
4. **Şubeler arası transfer kaydı:** Hangi telefon ne zaman hangi şubeye geçti.
5. **Excel'e aktarma:** Listeyi `.xlsx` / `.csv` olarak indirme.
6. **Renk ve durum alanı:** Sıfır / ikinci el / yenilenmiş, renk.
7. **Kişiye özel giriş:** Çalışan bazlı hesaplar ve işlem geçmişi.
8. **Otomatik yenileme:** Liste belirli aralıklarla kendini güncellesin.
9. **Özel alan adı:** `fiyat.dukkanadi.com` gibi.

---

## 22. Hesaplar ve servisler özeti

| Servis | Hesap / Alan | Ne için |
|---|---|---|
| GitHub | Emiroloji / raf-fiyatlari (private) | Kaynak kod, yedek, otomatik yayın tetikleyici |
| Vercel | emiroloji's projects / raf-fiyatlari | Sitenin yayını |
| Turso (Vercel Marketplace üzerinden) | Veritabanı: raf-fiyatlari, Starter plan | Canlı veriler |
| Google Fonts | — | Archivo yazı tipi (hesap gerektirmez) |

**Önemli linkler:**
- Site: https://raf-fiyatlari.vercel.app
- Kod: https://github.com/Emiroloji/raf-fiyatlari
- Vercel projesi: https://vercel.com/emirolojis-projects/raf-fiyatlari
- Ortam değişkenleri: https://vercel.com/emirolojis-projects/raf-fiyatlari/settings/environment-variables
