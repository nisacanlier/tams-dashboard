# GT Control Tower — Product (PRD) & Calculation Logic Document
**Sürüm:** v1.0.0  
**Yazar:** Pegasus Ürün & Sistem Mimari Grubu  
**Tarih:** 2026-06-19  
**Statü:** Taslak / Mimarî Referans Dokümanı  

---

## 1. Ürün Amacı
**GT (Ground Time) Control Tower Dashboard**, Pegasus Hava Yolları'nın Sabiha Gökçen (SAW) başta olmak üzere aktif hub meydanlarındaki uçak turnaround (yer operasyonu / geri dönüş) süreçlerini anlık olarak izlemek, SLA (Service Level Agreement - Hizmet Seviyesi Anlaşması) hedeflerine yönelik sapma ve gecikme risklerini proaktif olarak tespit etmek ve operasyon ekibine (OCC - Operations Control Center / Meydan İstasyon Nöbetçi Müdürleri) karar destek mekanizması sunmak amacıyla tasarlanmış bir operasyonel yönetim aracıdır.

Bu dashboard sayesinde rampa operasyonlarındaki her bir alt sürecin (yolcu inişi, temizlik, yakıt, yükleme, boarding, pushback vb.) bağımlılık şeması ve kritik yol (critical path) üzerindeki etkisi canlı olarak izlenebilir.

---

## 2. Dashboard Kapsamı ve Genel Tanım
Sistem, web tabanlı zengin görsel bileşenlerden oluşmakta ve aşağıdaki ana fonksiyonel alanları kapsamaktadır:

*   **Aktif Hub Meydan Seçimi (Hub Selector):** Kullanıcının operasyonunu incelemek istediği ana meydanı (örneğin SAW) seçmesine imkan tanır.
*   **Hub Detay Kartı (Hub Summary Insight):** Seçili meydandaki genel operasyonel sağlığı, toplam şablon sayısını ve ana rampa performans normlarını özetler.
*   **Ground Time SLA Template Kartları:** Çeşitli uçak tiplerine ve uçuş segmentlerine (iç hat / dış hat) göre kırılmış, hedeflenen yer süresi (örn: 40 dk, 45 dk, 60 dk) kurallarını içeren kartlardır. Her kart şunları sunar:
    *   Toplam uçuş sayısı
    *   SLA limitlerine uyan (SLA OK) uçuş sayısı
    *   SLA limitlerini aşmış olan (Hata / SLA Dışı) uçuş sayısı
    *   Ortalama yer süresi (Average Ground Time)
    *   Hedef süreye göre sapma (Deviation)
    *   SLA başarı oranı (Success S-Rate)
    *   Risk durumunu gösteren renk kodlu uyarı halkası (Dinamik Progress Ring)
*   **Açık İşlem / Apron Durum Monitorü (Uçuş Listesi Grid):** Seçilen şablona uyan tüm kuyruk tescilli uçakları ve rampa detaylarını içeren veri tablosudur.
*   **Ground Time Gantt Servis Çizelgesi & Predecessor Akışı (Timeline):** Seçili uçağın turnaround adımlarını gösteren Gantt grafiğidir. Süreçler arasındaki "Finish-to-Start" (FS), "Start-to-Start" (SS) bağımlılık hatlarını ve gecikme darboğazlarını gösterir.
*   **Bottleneck Monitor (Kritik Yol Darboğazı):** Gecikme riski yaratan kritik adımları milisaniye hassasiyetinde özetler.

---

## 3. Veri Modeli ve Entity Yapısı
Üretim ortamında SQL veya NoSQL veri tabanı üzerinde tanımlanması öngörülen temel ilişkisel entity yapıları ve veri tabanı alanları aşağıda tanımlanmıştır:

### A. Hub / Airport (Meydan Bilgisi)
*   `hubCode` (VARCHAR-3, Primary Key): Havalimanı IATA kodu (örneğin: "SAW", "AYT").
*   `fullName` (VARCHAR-100): Havalimanının resmi tam adı.
*   `city` (VARCHAR-50): Şehir.
*   `country` (VARCHAR-50): Ülke.
*   `totalTemplates` (INTEGER): Meydana bağlı tanımlanmış aktif SLA şablon adedi.
*   `averageTargetGT` (DECIMAL): Meydan genelindeki rampa hedef sürelerinin ağırlıklı ortalaması.

### B. GroundTimeTemplate (SLA Şablon Kuralları)
*   `templateId` (VARCHAR-50, Primary Key): Benzersiz şablon tanımlayıcı (örn: "SAW-A320-DOM").
*   `hubCode` (VARCHAR-3, Foreign Key): Bağlı olduğu meydan.
*   `templateName` (VARCHAR-100): Şablonun açıklayıcı adı (örn: "A321 Neo Domestic Turnaround Template").
*   `aircraftTypeCondition` (VARCHAR-30): Geçerli olduğu gövde limiti / uçak tipi (örn: "A320", "A321", "B738").
*   `flightTypeCondition` (VARCHAR-20): Uçuş kategorisi (örn: "DOM" (İç Hat), "INT" (Dış Hat)).
*   `targetMinutes` (INTEGER): Hedeflenen yer süresi limit değeri (örn: 45 dak.).
*   `description` (TEXT): Şablonun kapsam açıklaması.

### C. GroundTimeStep (Rampa Adım Tanımları)
*   `stepId` (VARCHAR-30, Primary Key): Hizmet / adım benzersiz kodu (örn: "gs-1", "gs-2").
*   `stepName` (VARCHAR-100): Hizmetin adı (örn: "Passenger Embarking", "De-Boarding").
*   `baseDurationRatio` (DECIMAL): Bu adımın toplam turnaround süresi içerisindeki standart pay oranı.

### D. FlightOperation (Uçuş Hareket Verisi)
*   `flightId` (VARCHAR-50, Primary Key): Benzersiz operasyon ID'si.
*   `flightNo` (VARCHAR-10): Uçuş numarası (örn: "PC2010").
*   `origin` (VARCHAR-3): Kalkış havalimanı.
*   `destination` (VARCHAR-3): Varış havalimanı.
*   `aircraftType` (VARCHAR-10): Gövde tipi (örn: "A321neo").
*   `scheduledArrivalTime` (TIMESTAMP): Tarife varış zamanı.
*   `actualArrivalTime` (TIMESTAMP): Fiili teker koyma / rampa varış zamanı.
*   `scheduledDepartureTime` (TIMESTAMP): Tarife kalkış zamanı.
*   `actualDepartureTime` (TIMESTAMP): Fiili bloktan çıkış (pushback) zamanı.
*   `hubCode` (VARCHAR-3, Foreign key).
*   `templateId` (VARCHAR-50, Foreign key).

### E. SLAResult (Gerçek Zamanlı SLA İzleme Çıktıları)
*   `flightId` (VARCHAR-50, Foreign Key): İlgili uçuş.
*   `templateId` (VARCHAR-50, Foreign Key): Tabi olduğu SLA şablonu.
*   `actualGroundTimeMinutes` (INTEGER): Fiili geçen yer süresi (Actual Departure - Actual Arrival).
*   `targetGroundTimeMinutes` (INTEGER): Şablonda hedeflenen süre.
*   `delayMinutes` (INTEGER): Sapma süresi (Negatif ise erken kalkış, pozitif ise gecikme).
*   `slaStatus` (VARCHAR-10): SLA sonucu ("OK", "CRITICAL", "FAILED").
*   `riskLevel` (VARCHAR-10): Risk grubu ("LOW", "MEDIUM", "HIGH").

### F. Alert / RiskSignal (Anlık Operasyonel Alarmlar)
*   `alertId` (UUID, Primary Key): Alarm benzersiz kimliği.
*   `flightId` (VARCHAR-50, Foreign Key): İlgili uçuş referansı.
*   `stepId` (VARCHAR-30, Foreign Key): Aksama yaşanan rampa adımı.
*   `alertType` (VARCHAR-30): Alarm kategorisi (örn: "BAGGAGE_DELAY", "FUEL_SLA_RISK").
*   `severity` (VARCHAR-10): Önem derecesi ("WARN", "CRITICAL").
*   `message` (TEXT): Kullanıcıya gösterilecek operasyonel uyarı mesajı.

---

## 4. Ekrandaki Her Alanın Hesaplama Mantığı

### Alan Adı: Aktif Hub Seçimi
*   **Tanım:** Kullanıcının rampa operasyonuna odaklanacağı ana meydanın belirlenmesi.
*   **Kaynak Veri:** `Hub.hubCode` listesi.
*   **Hesaplama Formülü:** 
    `Aktif Hub = Seçilen Hub Kodu (Varsayılan: SAW)`
*   **Örnek:** Kullanıcı dropdown menüsünden "SAW" seçtiğinde, sayfa state'i `activeHub = "SAW"` olarak güncellenir.
*   **Frontend Gösterim Notu:** Başlık alanında ve uçuş tablolarında yalnızca seçilen hub verileri filtrelenerek gösterilir.

### Alan Adı: Toplam SLA Şablon Sayısı (Hub Detay)
*   **Tanım:** Seçili meydanda aktif olarak denetlenen yer süresi kurallarının (SLA Şablonları) toplam adedi.
*   **Kaynak Veri:** `GroundTimeTemplate` tablosu.
*   **Hesaplama Formülü:**
    `Şablon Sayısı = Count(templateId) where hubCode = activeHub`
*   **Örnek:** SAW meydanına ait 7 farklı gövde-segment kombinasyonunda şablon varsa ekranda "7" bilgisi gösterilir.
*   **Frontend Gösterim Notu:** Sol üst köşedeki istatistik panelinde küçük gri / antrasit kart olarak yer alır.

### Alan Adı: Ortalama Hedef Ground Time
*   **Tanım:** Aktif meydandaki tüm operasyonel şablonların hedeflenen yer sürelerinin aritmetik ortalaması.
*   **Kaynak Veri:** `GroundTimeTemplate.targetMinutes` değerleri.
*   **Hesaplama Formülü:**
    `Ortalama Hedef Ground Time = [Toplam targetMinutes] / N`  
    *(N: İlgili hub'daki toplam şablon sayısı)*
*   **BER HUB Örneği:** 
    BER Hub seçildiğinde tanımlı 3 farklı SLA şablonunun hedefleri sırasıyla **50 dk**, **65 dk** ve **60 dk**'dır.  
    * Hesaplama: `(50 + 65 + 60) / 3 = 175 / 3 = 58.33 dk`
    * Yuvarlanmış olarak **58.3 dakika** sonucuna ulaşılır.
*   **Frontend Gösterim Notu (ÖN YÜZDE NEREDE GÖRÜNÜR?):**
    Sol taraftaki asma menüde yer alan **"Operasyonel HUB Listesi"** içinde her bir havalimanı hücresinin en sağında yer alan **"GT Target"** kolon başlığı altında canlı olarak gösterilir. (Örn. BER satırının sağında **58.3 dk** yazar).

### Alan Adı: Şablon Bazlı Toplam Uçuş Sayısı (Kart İçin)
*   **Tanım:** Seçili tarih aralığında, ilgili şablonun kurallarına (Uçak Tipi ve Hat Grubu) uyan toplam uçuş sayısı.
*   **Kaynak Veri:** `FlightOperation` tablosu.
*   **Hesaplama Formülü:**
    `Toplam Uçuş = Count(flightId) where templateId = targetTemplateId`
*   **Örnek:** "A320 - İç Hat 40 dk" şablonuna atanmış gün içindeki toplam uçuş sayısı 34'tür.
*   **Frontend Gösterim Notu:** SLA şablon kartının sağ alt köşesinde `Total Flights` biletinde yazılır.

### Alan Adı: SLA OK Sayısı
*   **Tanım:** Fiili yer süresi (Ground Time), şablon hedef süresine eşit veya bu sürenin altında kalan uçuş sayısıdır.
*   **Kaynak Veri:** `SLAResult` tablosundaki `actualGroundTimeMinutes` ve `targetGroundTimeMinutes`.
*   **Hesaplama Formülü:**
    `SLA OK = Count(flightId) where actualGroundTimeMinutes <= targetGroundTimeMinutes`
*   **Örnek:** 40 dakikalık hedefte, park pozisyonunda 38 dakika kalan bir uçak SLA OK olarak sayılır.
*   **Frontend Gösterim Notu:** Yeşil renkli rozet (badge) ve sayısal değerle kart üzerinde gösterilir.

### Alan Adı: Hata / SLA Dışı Uçuş Sayısı
*   **Tanım:** Fiili yer süresi, hedeflenen SLA limitini aşan ve gecikmeye neden olan uçuş sayısıdır.
*   **Kaynak Veri:** `SLAResult` tablosu.
*   **Hesaplama Formülü:**
    `SLA Dışı = Count(flightId) where actualGroundTimeMinutes > targetGroundTimeMinutes`
*   **Örnek:** Hedef süresi 45 dk olan bir uçuşta, kapı kapatmadan fiili geçen süre 52 dk ise bu uçuş SLA dışıdır.
*   **Frontend Gösterim Notu:** Kırmızı renkli rozet ve uyarı ikonuyla kart üzerinde listelenir.

### Alan Adı: SLA Başarı Oranı (Performance Success Rate)
*   **Tanım:** İlgili SLA şablonunda rampa standartlarına uygun tamamlanmış operasyonların yüzde değeridir.
*   **Kaynak Veri:** SLA OK sayısı ve Toplam Uçuş sayısı.
*   **Hesaplama Formülü:**
    `SLA Başarı Oranı (%) = (SLA OK / Toplam Uçuş) * 100`
*   **Örnek:** 34 uçuştan 25'i SLA OK ise: `(25 / 34) * 100 = %73.5`.
*   **Frontend Gösterim Notu:** Kartların sağında daire biçimli SVG halkası (Circular progress bar) içinde dinamik olarak gösterilir (Örn. BER Hub'da `%86`, `%87` ve `%88` olan halkalar).

### Alan Adı: Ortalama Süre (Average Actual Ground Time)
*   **Tanım:** İlgili kategorideki uçuşların rampa operasyonunda fiili olarak geçirdiği sürelerin aritmetik ortalaması.
*   **Kaynak Veri:** `FlightOperation` üzerinden hesaplanan gerçek rampa dakikaları.
*   **Hesaplama Formülü:**
    `Ortalama Süre = [Yerde Kalınan Toplam Süreler] / Toplam Uçuş`
*   **Örnek:** 3 uçuş sırasıyla 36, 42 ve 48 dakika yer süresi yaptıysa: `(36+42+48)/3 = 42` dakika.
*   **Frontend Gösterim Notu:** SLA şablon kartının gövdesindeki ana göstergelerden biridir.

### Alan Adı: Sapma (Yüzdesel ve Dakikasal Varyans)
*   **Tanım:** Ortalama gerçekleşen yer süresinin hedeflenen SLA süresinden ne kadar saptığını gösterir.
*   **Kaynak Veri:** Ortalama Süre ve Şablon Hedef Süresi.
*   **Hesaplama Formülü:**
    `Sapma (Dakika) = Ortalama Süre - Hedef Süre`
*   **Örnek:** Ortalama rampa süresi 42.4 dk, hedef süre 40 dk ise sapma `+2.4` dakikadır.
*   **Frontend Gösterim Notu:** Pozitif sapmalar kırmızı font ve yukarı ok ile (örn: `+2.4m`), negatif/uygun sapmalar ise yeşil font ve aşağı ok ile gösterilir.

### Alan Adı: Dinamik Risk Rengi
*   **Tanım:** Şablonun genel performans durumunu ve aciliyet derecesini gösteren renk kodlamasıdır.
*   **Hesaplama Mantığı:**
    *   **Yeşil (Başarılı):** SLA Başarı Oranı >= %85 VEYA Sapma <= 0 dakika.
    *   **Turuncu (Riskli):** %70 <= SLA Başarı Oranı < %85 VEYA Sapma > 0 ve Sapma <= 3 dakika.
    *   **Kırmızı (Kritik):** SLA Başarı Oranı < %70 VEYA Sapma > 3 dakika.
*   **Frontend Gösterim Notu:** Kartın kenar çizgilerinde, gövde arka plan tonunda ve progress ring halkasında doğrudan bu dinamik renk kodu CSS sınıfları (Tailwind `border-emerald-500`, `border-amber-500`, `border-rose-500`) üzerinden uygulanır.

---

## 5. Kritik Yol (Critical Path) & Bağımlılık Mantığı

Yer operasyonunda (turnaround) rampa adımları doğrusal olmayıp, birbiriyle bağımlı (doğrusal veya paralel) yapılardan oluşmaktadır. Bu şemanın matematiksel analizi **Kritik Yol Metodu (CPM - Critical Path Method)** temel alınarak tasarlanmıştır.

### A. Temel Bağımlılık Tipleri
*   **Finish-to-Start (FS):** Öncül aktivite tamamlanmadan ardıl aktivite başlayamaz.
    *   *Yolcu İnişi tamamlanmadan (De-boarding) -> Kabin Temizliği (Cleaning) veya Yolcu Alımı (Embarking) başlayamaz.*
*   **Start-to-Start (SS):** İki rampa aktivitesi aynı anda başlamalı veya paralel yürümeli, fakat belirli bir zaman kayması (offset) barındırmalıdır.
    *   *Yolcu Alımı (Embarking) ile Kapıdaki Bagaj/Gate Yönetimi (Systematic Boarding) eş zamanlı olarak paralel başlar.*

### B. Slack / Tolerans Süresi Hesaplaması
Her bir rampa servisinin rampa planında sahip olduğu esneklik "Slack" (Boşluk Süresi) olarak hesaplanır:
`Slack = Geç Başlangıç Limit - Planlanan Başlangıç`

*   **`Slack = 0 dakika`** olan tüm adımlar doğrudan **Kritik Yol (Critical Path)** üzerindedir. Bu adımlarda meydana gelecek en ufak bir (1) saniyelik gecikme, uçağın pushback saatini doğrudan geciktirir ve rampa rötarına yol açar.
*   **`Slack > 0 dakika`** olan paralel rampa adımlarında (Catering, Cleaning vb.) ise tolerans süresi kadar gecikme yaşanması, uçağın genel kalkışını etkilemez. Ancak gecikme slack süresini aşarsa, bu adım da kritik yola dönüşür.

---

### C. SAW Hub Rampa Operasyonu Kritik Yol Detayları

Sistemde tanımlı rampa adımlarından hangilerinin **Critical Path** kapsamında işaretlendiğinin teknik gerekçeleri ve veri kaynakları aşağıda özetlenmiştir:

| Servis ID | Servis Adı | Bağımlılık Tipi / Öncülü | Slack | Critical Path? | Teknik / Operasyonel Dayanak |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **gs-1** | Bridge-Stairs Connection | Yok (Uçak rampa yanaşması) | 2 dk | **Hayır (Düşük)** | Körüğün yanaşmasında 2 dakikalık esneklik payı vardır. Yolcu inişini bloke etmeyecek kadar küçük bir toleransa sahiptir. |
| **gs-2** | **De-Boarding (Yolcu İniş)** | Bridge Connection (FS) | 0 dk | **Evet (Kritik)** | Birincil kritik adım. Yolcular uçaktan tamamen tahliye edilmeden ne kabin içine temizlik ekibi girebilir ne de yakıt ikmali (güvenlik regülasyonları gereği) tam güvenlikle icra edilebilir. |
| **gs-3** | **Fuelling (Yakıt İkmali)** | De-Boarding (FS) | 2 dk | **Evet (Kritik)** | Yakıt alımı, uçuşun ağırlık ve denge (weight-balance) hesapları ile yakıt emniyeti kuralları gereği yolcu boarding (`gs-8`) başlamadan önce tamamlanmak zorundadır. Kritik yoldadır. |
| **gs-4** | Cabin Cleaning & Prep | De-Boarding (FS) | 4 dk | **Hayır (Düşük)** | Temizlik ekibinin çalışması esnektir, boarding başlayana kadar paralele kaydırılabilir. 4 dk slack içerir. |
| **gs-5** | Crew Preparing | De-Boarding (FS) | 8 dk | **Hayır (Düşük)** | Kokpit ve kabin ekibi rampa hazırlıklarını paralel olarak 8 dakikalık tölerans ile yürütebilir. |
| **gs-6** | Catering (Catering Servisi) | De-Boarding (FS) | 10 dk | **Hayır (Düşük)** | İkram yüklemesi, kabin temizliği ile paralel koşar. Geniş bir slack (10 dk) süresi mevcuttur. |
| **gs-7** | Crew Security Check | Cabin Cleaning (FS) | 2 dk | **Hayır (Düşük)** | Ekip güvenlik araması hızlı sürer, kritik yol üzerinde doğrudan baskı oluşturmaz. |
| **gs-10** | Baggage Unloading | Bridge Connection (FS) | 4 dk | **Hayır (Düşük)** | Gelen bagajların uçaktan indirilmesi, giden yükleme başlamadan önce paralel yürür. |
| **gs-11** | Baggage Loading (Yükleme) | Baggage Unloading (FS) | 3 dk | **Hayır (Düşük)** | Giden bagaj ve kargoların uçağa yüklenmesi pushback öncesine kadar sürer. Genellikle boarding ile paraleldir. |
| **gs-8** | **Passenger Embarking (Giriş)** | Fuelling / Cleaning (FS) | 0 dk | **Evet (Kritik)** | Kritik yolun en can alıcı halkasıdır. Yolcuların körükten veya otobüsle uçağa alınması bitmeden kapı kapatılamaz, pushback onaylanamaz. |
| **gs-9** | Systematic Boarding (Gate) | Passenger Embarking (SS) | 3 dk | **Hayır (Düşük)** | Kapıda yapılan biniş kartı kontrol işlemleri, uçağın içerisindeki fiziki yerleşimin hızıyla paralel ilerler ve 3 dk'lık küçük bir slack payına sahiptir. |
| **gs-12** | **Pushback Process (Kalkış)** | Passenger Embarking (FS) | 0 dk | **Evet (Kritik)** | Yer operasyonunun çıkış (milestone) noktasıdır. Tüm ön koşulların tamamlanmasıyla icra edilir, slack süresi 0'dır. |

---

## 6. API ve Entegrasyon İhtiyacı

Frontend ile backend arasındaki gerçek zamanlı veri akışını sağlamak için öngörülen RESTful API sözleşmesi ve JSON şemaları aşağıda listelenmiştir:

### Endpoint: `GET /api/hubs`
*   **Amaç:** Kullanıcının seçebileceği havalimanı hub listesini döner.
*   **Örnek Response:**
```json
[
  {
    "hubCode": "SAW",
    "fullName": "Sabiha Gökçen International Airport",
    "city": "Istanbul",
    "country": "Turkey",
    "totalTemplates": 7,
    "averageTargetGT": 45.0
  },
  {
    "hubCode": "AYT",
    "fullName": "Antalya Airport",
    "city": "Antalya",
    "country": "Turkey",
    "totalTemplates": 3,
    "averageTargetGT": 40.0
  }
]
```

### Endpoint: `GET /api/hubs/{hubCode}/templates`
*   **Amaç:** Seçilen hub'a ait aktif SLA şablonlarının anlık performansını döner.
*   **Örnek Response:**
```json
[
  {
    "templateId": "SAW-A320-DOM",
    "templateName": "A320 - İç Hat 40 dk",
    "aircraftTypeCondition": "A320",
    "flightTypeCondition": "DOMESTIC",
    "targetMinutes": 40,
    "totalFlights": 34,
    "slaOkCount": 25,
    "slaFailedCount": 9,
    "successRate": 73.5,
    "averageDuration": 42.4,
    "deviation": 2.4,
    "riskLevel": "MEDIUM"
  }
]
```

### Endpoint: `GET /api/flights?hubCode=SAW&templateId=SAW-A320-DOM`
*   **Amaç:** Şablon kırılımına göre rampa ve apron üzerindeki uçak listesini, rampa rötarlarını ve anlık süreç ilerleme yüzdelerini döner.
*   **Örnek Response:**
```json
[
  {
    "flightId": "FL-901",
    "flightNo": "PC2010",
    "tailNumber": "TC-RBA",
    "aircraftType": "A320neo",
    "origin": "ADB",
    "destination": "SAW",
    "elapsedGt": 28,
    "totalPlannedGt": 40,
    "slaStatus": "CRITICAL",
    "delayMinutes": 4,
    "currentServiceStep": "Passenger Embarking"
  }
]
```

### Endpoint: `GET /api/flights/{flightId}/gantt`
*   **Amaç:** İlgili uçuşun yer operasyonu adımlarını, planlanan/gerçekleşen süreleri ve slack değerlerini içeren Gantt akışını döner.
*   **Örnek Response:**
```json
{
  "flightId": "FL-901",
  "tailNumber": "TC-RBA",
  "ganttServices": [
    {
      "id": "gs-2",
      "name": "De-Boarding (Yolcu İniş)",
      "plannedStart": 2,
      "plannedFinish": 12,
      "baseDuration": 10,
      "predecessor": "gs-1",
      "relationType": "FS",
      "isCritical": true,
      "slackMinutes": 0,
      "status": "Completed"
    },
    {
      "id": "gs-3",
      "name": "Fuelling (Yakıt İkmali)",
      "plannedStart": 12,
      "plannedFinish": 27,
      "baseDuration": 15,
      "predecessor": "gs-2",
      "relationType": "FS",
      "isCritical": true,
      "slackMinutes": 2,
      "status": "In Progress"
    }
  ]
}
```

---

## 7. Veri Entegrasyonu ve Veri Tabanı Eşleme (Database Mapping Spec)

Pegasus kurumsal sistem mimarisi kurallarına uyum sağlamak ve veri tekrarını (data redundancy) önlemek amacıyla, GT Control Tower sistemi için yeni fiziksel tablolar (DDL) türetilmeyecektir. Bunun yerine, dashboard bileşenlerinin beslendiği mantıksal veri modeli, Pegasus'un mevcut veri tabanları ve platformlarındaki (örneğin **AODB - Airport Operational Database**, **SITA Messaging Hub**, **RampLink/Mobility Suite** ve **OCC Data Store**) servis tablolarına doğrudan eşlenecektir (mapping).

### A. Kurumsal Veri Kaynakları ve Sistemleri (System of Record)
*   **AODB (Airport Operational Database):** Tarifeli (Sch) ve gerçekleşen (Act) uçuş hareket zamanları, uçak tescil (Tail), gövde tipi (AC Type) ve park pozisyonu master verisinin kaynağı.
*   **RampLink / GHM (Ground Handling Mobile App):** Aprondaki yükleme, yakıt, temizlik gibi yer operasyon adımlarının el terminallerinden veya IATA mesajlaşmalarından gelen canlı telemeteri kaynağı.
*   **OCC Config Store:** İstasyon bazlı hedeflenen SLA limitlerinin ve öncül-ardıl rampa iş kurallarının (predecessor constraints) yönetildiği konfigürasyon veri tabanı.

---

### B. Mantıksal Veri Modeli ve Pegasus DB Alan Eşlemeleri (Mapping Directory)

#### 1. HUB / MEYDAN VERİSİ
*   **Mantıksal Tanım:** Seçilen operasyonel havalimanının master bilgileri.
*   **Pegasus Kaynak Tablosu:** `CORE_AIRPORT_MASTER` (AODB master data)

| Dashboard Alan Adı (Logical) | Pegasus DB Tablo Kolonu (Physical) | Veri Tipi | Açıklama ve Eşleme Kuralları |
| :--- | :--- | :--- | :--- |
| `hubCode` | `IATA_CODE` | VARCHAR(3) | Birincil Anahtar (PK). Örn: 'SAW', 'NBE', 'BER'. |
| `fullName` | `AIRPORT_LONG_NAME` | VARCHAR(150) | Havalimanının tescilli tam unvanı. |
| `city` | `CITY_NAME` | VARCHAR(50) | Şehir ismi. |
| `country` | `COUNTRY_ALPHA2` | VARCHAR(2) | Ülke kodu (ISO standardında, örn: 'TR', 'DE'). |

#### 2. GROUND TIME SLA ŞABLONLARI
*   **Mantıksal Tanım:** Turnaround süresini uçak tipi ve hat ayrımına göre limitleyen SLA kuralları.
*   **Pegasus Kaynak Tablosu:** `OCC_SLA_TEMPLATE_CONFIG` (OCC Config Store)

| Dashboard Alan Adı (Logical) | Pegasus DB Tablo Kolonu (Physical) | Veri Tipi | Açıklama ve Eşleme Kuralları |
| :--- | :--- | :--- | :--- |
| `templateId` | `SLA_RULE_ID` | VARCHAR(50) | Birincil Anahtar. Örn: 'SAW-A320-DOM' |
| `hubCode` | `STATION_IATA` | VARCHAR(3) | Yabancı Anahtar (FK). Hangi istasyon için geçerli olduğu. |
| `templateName` | `RULE_DISPLAY_NAME` | VARCHAR(100) | Kullanıcı dostu şablon adı. |
| `aircraftTypeCondition` | `AC_SUBTYPE_FAMILY` | VARCHAR(30) | Eşleşecek gövde ailesi (örn: 'A320neo', 'B738'). |
| `flightTypeCondition` | `FLIGHT_SECTOR_CAT` | VARCHAR(20) | Sektör tipi ('DOMESTIC', 'INTERNATIONAL'). |
| `targetMinutes` | `SLA_LIMIT_MINS` | INTEGER | Hedeflenen toplam yer süresi (örn: 50, 60, 65). |

#### 3. RAMPA ADIMLARI VE BAĞIMLILIK İLİŞKİLERİ
*   **Mantıksal Tanım:** Turnaround Gantt akışındaki alt işler ve kritik yol (Finish-to-Start / Start-to-Start) kuralları.
*   **Pegasus Kaynak Tabloları:** `RAMP_ACTIVITY_DEF` & `RAMP_ACTIVITY_PREDECESSOR`

| Dashboard Alan Adı (Logical) | Pegasus DB Tablo Kolonu (Physical) | Veri Tipi | Açıklama ve Eşleme Kuralları |
| :--- | :--- | :--- | :--- |
| `stepId` | `ACT_CODE` | VARCHAR(30) | Servis tekil kimliği. Örn: 'gs-2' (De-boarding). |
| `stepName` | `ACT_DESC_TR` | VARCHAR(100) | Operasyonel Türkçe karşılık. |
| `from_step_id` | `PREDECESSOR_ACT_CODE` | VARCHAR(30) | Öncül aktivite kodu. |
| `dependency_type` | `LINK_TYPE` | VARCHAR(10) | İlişki türü ('FS' veya 'SS'). |
| `slack_minutes` | `BUFFER_MINS` | INTEGER | Kritik yola girmeden önceki esneklik payı. |
| `is_critical_path` | `IS_CRITICAL_FLG` | BOOLEAN | `true` ise CPM algoritmasında kritik yol adımı kabul edilir. |

#### 4. UÇUŞ HAREKET VERİLERİ (FLIGHT OPERATIONS)
*   **Mantıksal Tanım:** Apronda aktif / takipte olan uçuşların temel uçuş ve tarife kartı.
*   **Pegasus Kaynak Tablosu:** `AODB_FLIGHT_LEG` (Core AODB)

| Dashboard Alan Adı (Logical) | Pegasus DB Tablo Kolonu (Physical) | Veri Tipi | Açıklama ve Eşleme Kuralları |
| :--- | :--- | :--- | :--- |
| `flightId` | `FLIGHT_LEG_ID` | VARCHAR(50) | Pegasus sistemlerindeki benzersiz bacak ID'si. |
| `flightNo` | `FLIGHT_NUMBER` | VARCHAR(10) | Sefer numarası. Örn: 'PC2010'. |
| `tailNumber` | `TAIL_SIGN` | VARCHAR(10) | Uçak kuyruk tescili. Örn: 'TC-RBA'. |
| `aircraftType` | `AC_SUBTYPE` | VARCHAR(10) | Gövde alt kırılım kodu. Örn: 'A321O' |
| `origin` | `DEPPORT` | VARCHAR(3) | Kalkış meydanı (Eşlenen kurumsal alan adı). |
| `destination` | `ARRPORT` | VARCHAR(3) | Varış meydanı (Eşlenen kurumsal alan adı). |
| `scheduledArrivalTime` | `SCH_ARR_TIME` | TIMESTAMP | Tarifeli iniş zaman damgası. |
| `actualArrivalTime` | `ACT_ARR_TIME` | TIMESTAMP | Fiili blok girişi / rampa durma anı. |
| `scheduledDepartureTime`| `SCH_DEP_TIME` | TIMESTAMP | Tarifeli bloktan çıkma zaman damgası. |
| `actualDepartureTime` | `ACT_DEP_TIME` | TIMESTAMP | Fiili pushback / bloktan çıkış saati. |

#### 5. CANLI RAMPA ADIM GERÇEKLEŞMELERİ (FLIGHT EVENTS)
*   **Mantıksal Tanım:** Turnaround devam ederken her bir adımın fiili başlangıç ve bitiş zamanları.
*   **Pegasus Kaynak Tablosu:** `FLIGHT_RAMP_EVENT_LOG` (RampLink & Telemetry Store)

| Dashboard Alan Adı (Logical) | Pegasus DB Tablo Kolonu (Physical) | Veri Tipi | Açıklama ve Eşleme Kuralları |
| :--- | :--- | :--- | :--- |
| `flightId` | `FLIGHT_LEG_ID` | VARCHAR(50) | İlgili uçuş referansı (ACOS / AODB bağı). |
| `stepId` | `RAMP_ACT_CODE` | VARCHAR(30) | Gerçekleşen adımı temsil eden kurumsal rampa kodu. |
| `actual_start_time` | `ACT_START_TIMESTAMP` | TIMESTAMP | Adımın fiilen başladığı an (Körük takıldı, yakıt hortumu bağlandı vb.). |
| `actual_end_time` | `ACT_END_TIMESTAMP` | TIMESTAMP | Adımın tamamlandığı an (Kapı kapandı, pushback aracı bağlandı vb.). |
| `status` | `STATE_CODE` | VARCHAR(20) | 'COMPLETED', 'ONGOIN', 'PENDING' vb. durumlar. |

---

### C. Senkronizasyon ve Veri Akış Stratejisi
*   **AODB Dinleme (Streaming):** `ACT_ARR_TIME` (Fiili İniş) alanına veri düştüğü anda, ilgili uçuş için `AODB_FLIGHT_LEG` üzerinden `FLIGHT_LEG_ID` yakalanır ve rampa takip şeması otomatik tetiklenir.
*   **Gerçek Zamanlı Telemetri API / Kafka Entegrasyonu:** Aprondan RampLink aracılığıyla üretilen her bir rampa olayı, kurumsal Event Bus (Apache Kafka / RabbitMQ) üzerinden `FLIGHT_RAMP_EVENT_LOG` tablosuna yazıldığı an asenkron servisler sayesinde dashboard ön yüzünde (Gantt şemasında) anlık olarak yeşile döner veya gecikme uyarısı verir.

---

## 8. Frontend Gösterim Mimarisi

Frontend tarafında mock verilerin API entegrasyonu ile değiştirilmesi aşamasında sürdürülebilir bir servis mimarisi (Service Pattern Layout) kurulacaktır.

### Önerilen Dosya Yapısı:
```text
src/
├── services/
│   ├── dashboardApi.ts         # Axios/Fetch ana istemci yapılandırması
│   ├── hubService.ts           # Hub listeleri ve genel hub metrik API'leri
│   ├── templateService.ts      # SLA Şablon kartlarının veri çekim motoru
│   └── flightService.ts        # Uçuş tabloları, Gantt grafiği ve darboğaz verileri
```

İletişim, React Query veya RTK Query kullanılarak asenkron veri güncellemeleri ve otomatik sayfa yenileme (polling/Websocket) mekanizmasıyla entegre edilmelidir.

---

## 9. Kullanıcı Senaryosu (Operasyonel Akış)

1.  **Hub Filtreleme:** OCC Kontrolörü Sabiha Gökçen'deki (SAW) rampa durumunu izlemek için üst bar menüsünden **SAW** seçimini yapar.
2.  **SLA İnceleme:** Dönel uyarı halkası kırmızıya dönmüş olan **"A321 - Dış Hat 60 dk"** şablonunu tespit eder. SLA başarı oranının $\%62.5$'e düştüğünü görerek bu karta tıklar.
3.  **Uçuş Analizi:** Tıklama sonrası alttaki uçuş tablosu filtrelenir ve rötarlı olan **"PC2010"** nolu uçuş seçilir.
4.  **Darboğaz Tespiti & Aksiyon:** Alttaki Gantt çizelgesine bakan kontrolör, Kritik Yol (Critical Path) parçası olan **Passenger Embarking (gs-8)** adımının geciktiğini ve bu adımın ardılı olan **Pushback Process (gs-12)** kalkışını doğrudan rötara sürüklediğini görür. İstasyon ilgili birimlerini arayarak uçağa ulaştırma otobüs oranının artırılmasını talep eder ve süreci hızlandırır.

---

## 10. Proje Planı ve Fazlandırma

*   **Faz 1 (Prototip Doğrulama):** React mock verileriyle arayüz ve rampa Gantt şemasının doğrulanması (Tamamlandı).
*   **Faz 2 (API Contract Tasarımı):** Backend ekipleriyle veri transfer hızı ve JSON şemalarının onaylanması.
*   **Faz 3 (Database ve API Geliştirme):** PostgreSQL tablolarının oluşturulması, Node.js veya Go tabanlı microservice API'lerinin kodlanması.
*   **Faz 4 (Gerçek Zamanlı SLA Hesaplama):** Apache Kafka veya MQ'den gelen uçuş event'lerine (yolcu kapısı kapandı, yakıt başladı vb.) göre çalışan canlı SLA motorunun kurulması.
*   **Faz 5 (SSO & Yetkilendirme):** Pegasus çalışan sistemleriyle (Okta / Azure AD) entegrasyon.
*   **Faz 6 (Kullanıcı Kabul Testleri - UAT):** İstasyon şefleriyle sahada canlı UAT yapılması.
*   **Faz 7 (Production Yayılımı):** Kubernetes cluster ortamında canlı operasyona geçiş.

---

## 11. Açık Noktalar ve Soru Listesi

1.  **Verisiz Süreç Yakalama:** Kabin içi temizlik ve catering adımlarının fiili başlangıç-bitiş zaman damgaları (timestamp) rampa işçilerinden el terminaliyle mi yoksa uçak içi sensörlerden/kamera analizlerinden mi alınmaktadır?
2.  **Gerçek Zamanlı Veri Sıklığı:** Uçuş hareketlerine ve rampa adımlarına dair veriler OCC sistemine anlık (Real-time Stream) mı akar yoksa 5 dakikalık batch periyotlarında mı güncellenir?
3.  **Çevrimdışı Çalışma Limiti:** Mobil rampa cihazlarında internet koptuğunda rampa başlama event'leri kendi üzerinde kuyruklanıp (queue) daha sonra tekrar gönderildiğinde, SLA hesaplama motoru geçmişe dönük varyansları nasıl telafi edecektir?
