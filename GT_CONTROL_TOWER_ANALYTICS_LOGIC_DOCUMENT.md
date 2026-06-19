# GT Control Tower Gelişmiş Analitik Hesaplama Metrikleri Dokümanı (Part II)

Bu doküman, **GT Control Tower** platformunun ikinci fazında yer alan gelişmiş analitik modüllerin, karar destek mekanizmalarının ve simülatör ekranlarının çalışma prensiplerini, matematiksel formüllerini ve ön yüzde kullanılan hesaplama mantıklarını (Business Logic) detaylandırmak amacıyla hazırlanmıştır. 

Dokümandaki veriler ve kurallar doğrudan canlı uygulamayı besleyen veri modeli ile %100 uyumludur.

---

## 1. Operasyonel Genel Sağlık Durumu & KPI Dağılımı (Operational Health Core Stats)

Seçilen aktif Havalimanı (Hub) genelinde anlık operasyonel durumu ve rampa SLA karnesini tek bakışta özetleyen en tepe KPI alanlarının hesaplama mantığıdır.

### A. Toplam Aktif Uçuş (Total Active Flights)
*   **Tanım:** Seçilen rampa meydanında (SAW, BER vb.) o gün içerisinde takibe giren fiili geliş-gidiş turnaround bacaklarının toplam adedidir.
*   **Eşleme Kuralı:** `Count(flightId)` where `station = activeHub`

### B. SLA Başarı Oranı (%) (SLA Success Rate)
*   **Tanım:** Rampa süreci hedeflerine uygun (On Target veya hafif sapmalı At Risk durumundaki) tamamlanan veya devam eden uçuşların tüm aktif izleme havuzuna oranıdır.
*   **Formül:**
    $$\text{SLA Başarı Oranı (\%)} = \text{Math.round} \left( \frac{\text{On Target Uçuş Sayısı} + \text{At Risk Uçuş Sayısı}}{\text{Toplam Aktif Uçuş Sayısı}} \times 100 \right)$$
    *(Eğer o havalimanında hiç aktif uçuş yoksa gösterge başlangıç değeri olarak %92'yi esas alır).*
*   **Örnek:** SAW meydanında 13 aktif uçuşun 8'i On Target, 2'si At Risk, 2'si Critical ve 1'i Delayed ise oran: `Math.round((8 + 2) / 13) * 100 = %77` olarak yansır.

### C. Ortalama Gerçekleşen Yer Süresi (Average Actual Ground Time)
*   **Tanım:** Aktif takibi süren uçuşların yerde bloklar arası (Chocks-on / Chocks-off) fiili olarak geçirdiği sürenin aritmetik ortalamasıdır.
*   **Formül:**
    $$\text{Ortalama Gerçekleşen GT} = \frac{\sum_{i=1}^{M} \text{elapsedGt}_i}{M}$$
    *(M: İlgili hub'daki toplam uçuş sayısı, elapsedGt: Uçağın yerde geçirdiği güncel dakika süresi).*

### D. Ortalama Sapma (Average Deviation)
*   **Tanım:** Uçakların yerde geçirdiği süre ile kendileri için atanan referans SLA şablon süreleri arasındaki dakikasal farkın havalimanı bazlı ortalamasıdır.
*   **Formül:**
    $$\text{Ortalama Sapma (Dakika)} = \frac{\sum_{i=1}^{M} (\text{elapsedGt}_i - \text{gtTarget}_i)}{M}$$
*   **Örnek:** Negatif sonuçlar uçağın SLA sınırından daha erken turnaround tamamladığını (erken kalkış), pozitif değerler ise ortalamada rampa rötarına girdiğini ifade eder.

---

## 2. Oransal Sağlık Durumu Dağılımı (Status Allocations and Color States)

Filonun anlık rampa durumunun görselleştirilmesinde ve üst paneldeki halka grafiklerde kullanılan durum kodları (`flight.status`) ve risk limitleri şu matematiksel sınırlara göre belirlenir:

| Statü Sınıfı | Tanım ve Rampa Davranışı | Risk Yüzdesi Bandı | Uygulanan Ön Yüz Teması |
| :--- | :--- | :--- | :--- |
| **On Target** | Rampa operasyonu tüm adımlarda planlanan limitlerdedir. Gecikme riski neredeyse yoktur. | `%0` ile `%20` arası | **Yeşil** (`text-emerald-600 bg-emerald-50`) |
| **At Risk** | Rampa akışında veya kritik yol dışı parallel işlerde hafif sapmalar var. Kurtarılabilir. | `%21` ile `%69` arası | **Sarı / Amber** (`text-amber-500 bg-amber-50`) |
| **Critical** | Kritik yol (yakıt, temizlik gibi ardışık süreci doğrudan etkileyen adımlar) aksamış, pushback saati zora girmiştir. | `%70` ile `%99` arası | **Turuncu / Kırmızı** (`text-orange-600 bg-orange-50`) |
| **Delayed** | Turnaround hedef süresi olan SLA dakikası fiilen aşılmış ve uçak kapı kapatıp bloktan zamanında çıkamamıştır. | `%100` | **Koyu Kırmızı** (`text-rose-700 bg-rose-50`) |

---

## 3. Gecikme Kök Neden Analitiği (Delay Root-Cause Analytics)

Kalkış gecikmesine sebebiyet veren alt süreçlerin havalimanı bazında istatistiksel dağılımını gösteren modüldür. Kullanıcı bu modülde zaman filtresini (Bugün, 7 Gün, 30 Gün) ve analiz metrik tipini değiştirebilir.

### Kök Neden Gösterge Metrikleri:
1.  **Sıklık Payı (Share %):** İlgili gecikme sebebinin toplam rampa ihlali olayları içindeki yüzdesel ağırlığıdır.
2.  **Ortalama Gecikme (Avg Minutes):** O tıkanıklık sebebi yaşandığında, ortalamada rampa sürecine eklenen net kayıp zaman süresidir.
3.  **Etkilenen Sefer Adedi (Affected Flights):** Belirtilen zaman penceresinde bu sebepten ötürü direkt olarak SLA ihlali yaşayan toplam uçak sayısıdır.

### Canlı Dağılım Matrisi (Bugün / Today):
*   **Passenger Boarding (Yolcu Biniş):** `%34` Sıklık | Ortalama `18 dakika` gecikme etkisi | `8 Sefer` etkilendi.
*   **Baggage Loading (Bagaj Yükleme):** `%23` Sıklık | Ortalama `14 dakika` gecikme etkisi | `5 Sefer` etkilendi.
*   **Fuelling Services (Yakıt İkmali):** `%16` Sıklık | Ortalama `12 dakika` gecikme etkisi | `4 Sefer` etkilendi.
*   **Cabin Cleaning & Prep (Temizlik):** `%11` Sıklık | Ortalama `9 dakika` gecikme etkisi | `3 Sefer` etkilendi.
*   **Crew Security Check (Uçucu Ekip):** `%8` Sıklık | Ortalama `6 dakika` gecikme etkisi | `2 Sefer` etkilendi.
*   **Pushback and Tug (Çekici/Pushback):** `%5` Sıklık | Ortalama `4 dakika` gecikme etkisi | `1 Sefer` etkilendi.
*   **Diğer Sebepler (Catering / ATC):** `%3` Sıklık | Ortalama `10 dakika` gecikme etkisi | `1 Sefer` etkilendi.

---

## 4. Service Performance Analytics (Servis Performans Analizi)

Rampa süresi boyunca yürütülen 6 ana alt servisin planlanan süreleri (Planned) ile fiilen gerçekleşen (Actual) sürelerinin karşılaştırılıp, dar boğazların teşhis edildiği grafik ve matris raporlama arabirimidir.

### Matematiksel Hesaplama Parametreleri:
*   **Planlanan Süre (dk):** Her bir havalimanı ve gövde tipi SLA şablonunda o servise ayrılan teorik limit.
*   **Gerçekleşen Süre (dk):** RampLink telemetrisinden ve el terminallerinden akan fiili olay durdurma-başlatma zaman damgaları farkı (`actual_end_time - actual_start_time`) ortalamasıdır.
*   **Başlama SLA% Oranı (Start On-Target Ratio):** İlgili servisin, rampa kapı açılışından (Chocks-on) sonra planlanan resmi başlangıç dadikasına göre tolerans penceresi (örn: ilk 3 dk) içerisinde başlamış olma yüzdesidir.
*   **Bitirme SLA% Oranı (Finish On-Target Ratio):** İlgili servisin rampa planındaki son limit dakikayı aşmadan tam zamanında tamamlanmış (COMPLETED statüsüne girmiş) olma yüzdesidir.

---

## 5. Critical Path Bottleneck Monitor (Kritik Yol Darboğaz Analizi)

Rampa aktiviteleri ardışık (sequential) ve eş zamanlı (parallel) yürüyen adımlardan oluşur. Bu modülde kullanılan algoritma kritik yol metodolojisini (Critical Path Method - CPM) taklit eder ve gecikmenin sisteme nasıl yansıyacağını hesaplar.

```
[Chocks-on] ➔ [Landing Connection] ➔ [De-boarding] ➔ [Fuelling / Cabin Clean] ➔ [Passenger Boarding] ➔ [Pushback]
                                                 ┗ (Parallel Slack: 8-10M)
```

### A. Kritik Yol Üzerindeki Servisler (`isCritical = true`)
*   **Aktiviteler:** De-Boarding, Fuelling, Passenger Boarding, Pushback.
*   **Hesaplama Kuralı:** Eğer bu rampa adımlarında herhangi bir gecikme (delay) eklenirse, bu gecikme rampa turnaround hedef süresini (SLA) doğrudan **şablonun üzerine 1:1 (+ dakika)** yansıtır. Tamamen esneksizdir.
*   **Ön Yansıma Katsayısı:** `1.0`

### B. Paralel Akıştaki Toleranslı Servisler (`isCritical = false`)
*   **Aktiviteler:** Cabin Cleaning, Baggage Loading, Catering.
*   **Hesaplama Kuralı:** Bu adımlar paralel yürütülebildiği için sistemsel bir tolerans süresine ("Slack Minutes") sahiptir. Uygulama algoritmik olarak bu adımlara **8 dakikalık** rampa slack payı tanır.
*   **Formül:**
    $$\text{Rampa Toplam Süresine Etki} = \text{Math.max}(0, \text{Uygulanan Gecikme} - 8 \text{ dakika})$$
*   **Davranış:** Gecikme 8 dakikayı aşmadığı sürece toplam kalkış saati (Target GT) ötelenmez; ancak 8 dakikadan büyük her gecikme tamponu tüketir ve arta kalan süre toplam süreyi geciktirmeye (darboğaz oluşturmaya) başlar.

---

## 6. Automation Impact & Action Center (Otomasyon Etkisi ve Karar Destek Merkezi)

Telemeteri yardımıyla rampa süreçlerindeki anormal durumların erken teşhisi ve otomatik kurallar vasıtasıyla önlenen operasyonel gecikme sürelerinin ölçülmesi modülüdür.

### A. Önlenen Toplam Gecikme Süresi (Prevented Minutes)
*   **Tanım:** Aktifleşen otomasyon kuralları (Fuelling Pre-Alert, Gate Sync, Bridge Connection Lag) sayesinde operasyonu aksamaktan kurtarılan seferlerden kazanılan toplam dakikadır.
*   **Formül:**
    $$\text{Toplam Önlenen Gecikme} = \sum (\text{Saved Minutes of Triggered Rules}) \times \text{Simülatör Ölçek Çarpanı (4)}$$

### B. Otomatik Kural Koşul Örnekleri (Core Rules):
*   *Fuelling Pre-Alert:* Turnaround sürecinin 12. dakikası dolmasına rağmen yakıt hortumu takılmadıysa yer hizmetleri şefine uyarı gönder. **Yıllık / Günlük Kurtarılan Ortalama Zaman:** 12 dk.
*   *Boarding Gate Sync:* Belirlenen kalkış sınırına 20 dakika kala yolcu binişi başlamamışsa kapı görevlilerini uyar. **Kurtarılan Zaman:** 18 dk.
*   *Baggage Loading Spillover:* Yükleme hızı son 5 dakikada dakikada 10 bagajın altına indiyse ilave rampa personeli ata. **Kurtarılan Zaman:** 8 dk.

---

## 7. Financial & Operational Impact Tracker (Finansal Etki Simülatörü)

Kritik yol üzerinde meydana gelen dakikasal gecikmelerin havayolu operasyonuna doğrudan getireceği ek operasyonel maliyetlerin Eurocontrol rampa gecikme katsayılarına göre simüle edilmesini sağlar.

### Gecikme Süresine Bağlı Gider Kalemleri:

#### A. Ekstra Yakıt / APU Gideri (Extra Fuel Cost)
*   Uçağın yerde dururken çalıştırdığı yardımcı güç ünitesinin (APU) harcadığı jet yakıtı ve havadaki zaman kaybını kapatmak için yapılan daha yüksek süratte uçuşun maliyetidir.
*   **Dakika Maliyeti:** `$120 USD`
*   **Formül:** `extraFuel = Gecikme (Dakika) * 120`

#### B. Uçuş Ekibi Ek Mesai Gideri (Crew Overtime Cost)
*   Turnaround gecikmesi sebebiyle görev süresi (duty block hour) uzayan kabin ve kokpit ekibine kontrat gereği ödenen mesai farklarıdır.
*   **Dakika Maliyeti:** `$85 USD`
*   **Formül:** `crewOvertime = Gecikme (Dakika) * 85`

#### C. Yolcu Tazminat ve Rezervasyon Gideri (Passenger Compensation & Rebooking)
*   Rampa gecikmesi uzadıkça bağlantılı uçuşunu (transfer flight) kaçıran yolculara yapılacak otelleme, IATA kompensasyon cezaları ve bilet değişim giderleridir. Gecikme dakika eşiğine göre katlanarak artar:
    *   **$\text{Gecikme} \le 15 \text{ dakika}$ ise:** Gecikme tolere edilebilir bantta kabul edilir ve tanzim ödenmez: `$0`
    *   **$15 \text{ dakika} < \text{Gecikme} \le 30 \text{ dakika}$ ise:** Kademeli hafif gecikme tanzimi uygulanır: `Gecikme (Dakika) * 80`
    *   **$\text{Gecikme} > 30 \text{ dakika}$ ise:** Havalimanı "Slot Kaybı" riski devreye girer, tanzim katlanarak artar: `(Gecikme - 30) * 450 + 2000`

#### D. Base Handling SLA Cezaları (Handling Penalty Base)
*   Yer hizmetleri sunan tedarikçiye (Havaş/Çelebi vb.) sözleşmedeki zamanında kalkış başarısı (OTP) kriterlerinin ihlali nedeniyle rampa operasyon başı kesilen cezadır.
*   **Dakika Maliyeti:** `$50 USD`
*   **Formül:** `handlingPenaltyBase = Gecikme (Dakika) * 50`

### Toplam Finansal Etki (Total Financial Impact)
Tüm operasyonel tanzim ve ek maliyetlerin toplamıdır:
$$\text{Toplam Mali Etki} = \text{handlingPenaltyBase} + \text{extraFuel} + \text{crewOvertime} + \text{passengerCompensation}$$

*(Örneğin; kritik yol gecikmesi **35 dakika** olduğunda, uçağın havayolu bütçesine yazacağı anlık ek rampa rötar maliyeti **$13.425 USD** olarak simüle edilir).*

---
**GT Control Tower - Analytical Intelligence Specifications**
