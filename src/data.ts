/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GroundTimeTemplate, HubDetails, ServiceBreakdown, HubCode, GanttService } from './types';

export const HUBS: HubDetails[] = [
  { code: 'ADB', fullName: 'İzmir Adnan Menderes Airport', city: 'Izmir', country: 'Turkey', totalTemplates: 5, averageTargetGT: 51 },
  { code: 'AYT', fullName: 'Antalya Airport', city: 'Antalya', country: 'Turkey', totalTemplates: 5, averageTargetGT: 51 },
  { code: 'BER', fullName: 'Berlin Brandenburg Airport', city: 'Berlin', country: 'Germany', totalTemplates: 3, averageTargetGT: 58.3 },
  { code: 'CGN', fullName: 'Cologne Bonn Airport', city: 'Cologne', country: 'Germany', totalTemplates: 3, averageTargetGT: 58.3 },
  { code: 'FRA', fullName: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', totalTemplates: 3, averageTargetGT: 58.3 },
  { code: 'MUC', fullName: 'Munich Airport', city: 'Munich', country: 'Germany', totalTemplates: 3, averageTargetGT: 58.3 },
  { code: 'SAW', fullName: 'Sabiha Gökçen International Airport', city: 'Istanbul', country: 'Turkey', totalTemplates: 7, averageTargetGT: 49.3 },
];

export const GROUND_TIME_TEMPLATES: GroundTimeTemplate[] = [
  // --- ADB ---
  {
    id: 'adb-tt-1',
    hub: 'ADB',
    name: 'B738-A320 Dom-Dom Turnaround',
    gtType: 'Turnaround',
    flightTypeCondition: 'Dom-Dom (İç Hat - İç Hat)',
    aircraftTypeCondition: '737 ~ 738 ~ 320',
    targetMinutes: 35,
    description: 'Dar gövdeli uçaklar (Boeing 737-800, Airbus A320) için standart iç hattan gelip iç hata devam eden hızlı dönüş (turnaround) operasyonu.'
  },
  {
    id: 'adb-tt-2',
    hub: 'ADB',
    name: 'B738-A320 Mixed Flights Turnaround',
    gtType: 'Turnaround',
    flightTypeCondition: 'Dom-Int / Int-Dom / Int-Int',
    aircraftTypeCondition: '737 ~ 738 ~ 320',
    targetMinutes: 45,
    description: 'Dış hat bağlantılı, gümrüklü bagaj ve pasaport kontrol süreçleri barındıran dar gövde turnaround operasyonu.'
  },
  {
    id: 'adb-tt-3',
    hub: 'ADB',
    name: 'A321 Dom-Dom Turnaround',
    gtType: 'Turnaround',
    flightTypeCondition: 'Dom-Dom (İç Hat - İç Hat)',
    aircraftTypeCondition: 'A321',
    targetMinutes: 50,
    description: 'Yüksek yolcu kapasiteli Airbus A321 tipi uçakların iç hat turnaround operasyonları.'
  },
  {
    id: 'adb-tt-4',
    hub: 'ADB',
    name: 'A321 Mixed Flights Turnaround',
    gtType: 'Turnaround',
    flightTypeCondition: 'Dom-Int / Int-Dom / Int-Int',
    aircraftTypeCondition: 'A321',
    targetMinutes: 65,
    description: 'Geniş yolcu hacmi ve dış hat gümrük bagaj/güvenlik gereksinimlerine sahip Airbus A321 turnaround operasyonu.'
  },
  {
    id: 'adb-tt-5',
    hub: 'ADB',
    name: 'Departure Only Ground Time',
    gtType: 'Departure',
    flightTypeCondition: 'Departure (Yatı Kalkış)',
    aircraftTypeCondition: '737 ~ 738 ~ 321 ~ 320',
    targetMinutes: 60,
    description: 'Geceden kalan (Nightstop) veya teknik bakım sonrası sefere ilk kez verilecek uçağın sadece kalkış (departure) hazırlık operasyonu.'
  },

  // --- AYT ---
  {
    id: 'ayt-tt-1',
    hub: 'AYT',
    name: 'B738-A320 Dom-Dom Turnaround',
    gtType: 'Turnaround',
    flightTypeCondition: 'Dom-Dom',
    aircraftTypeCondition: '737 ~ 738 ~ 320',
    targetMinutes: 35,
    description: 'Antalya HUB dar gövde iç hat hızlı turnaround operasyonu.'
  },
  {
    id: 'ayt-tt-2',
    hub: 'AYT',
    name: 'B738-A320 Mixed Flights Turnaround',
    gtType: 'Turnaround',
    flightTypeCondition: 'Dom-Int / Int-Dom / Int-Int',
    aircraftTypeCondition: '737 ~ 738 ~ 320',
    targetMinutes: 45,
    description: 'Antalya HUB dış hat/iç hat karma hareketli uçuşlar için dar gövde turnaround operasyonu.'
  },
  {
    id: 'ayt-tt-3',
    hub: 'AYT',
    name: 'A321 Dom-Dom Turnaround',
    gtType: 'Turnaround',
    flightTypeCondition: 'Dom-Dom',
    aircraftTypeCondition: 'A321',
    targetMinutes: 50,
    description: 'Antalya HUB Airbus A321 tipi uçaklar için iç hat turnaround operasyonları.'
  },
  {
    id: 'ayt-tt-4',
    hub: 'AYT',
    name: 'A321 Mixed Flights Turnaround',
    gtType: 'Turnaround',
    flightTypeCondition: 'Dom-Int / Int-Dom / Int-Int',
    aircraftTypeCondition: 'A321',
    targetMinutes: 65,
    description: 'Antalya HUB Airbus A321 tipi dış hat içeren operasyonlar için belirlenen hedef.'
  },
  {
    id: 'ayt-tt-5',
    hub: 'AYT',
    name: 'Departure Only Ground Time',
    gtType: 'Departure',
    flightTypeCondition: 'Departure',
    aircraftTypeCondition: '737 ~ 738 ~ 321 ~ 320',
    targetMinutes: 60,
    description: 'Akdeniz operasyonları sonrası yatıya bırakan uçakların kalkış hazırlık süresi.'
  },

  // --- BER ---
  {
    id: 'ber-tt-1',
    hub: 'BER',
    name: 'A320 Int-Dom Turnaround',
    gtType: 'Turnaround',
    flightTypeCondition: 'Int-Dom (Dış Hat - İç Hat/Avrupa)',
    aircraftTypeCondition: 'A320',
    targetMinutes: 50,
    description: 'Berlin Brandenburg Havalimanı dış hattan gelip iç hatta/başka bir Avrupa merkezine devam eden dar gövde turnaround operasyonu.'
  },
  {
    id: 'ber-tt-2',
    hub: 'BER',
    name: 'A321 Int-Dom Turnaround',
    gtType: 'Turnaround',
    flightTypeCondition: 'Int-Dom (Dış Hat - İç Hat/Avrupa)',
    aircraftTypeCondition: 'A321',
    targetMinutes: 65,
    description: 'Berlin Havalimanı dış hat kökenli Airbus A321 turnaround operasyonu.'
  },
  {
    id: 'ber-tt-3',
    hub: 'BER',
    name: 'Departure Only Ground Time',
    gtType: 'Departure',
    flightTypeCondition: 'Departure',
    aircraftTypeCondition: 'A320 ~ A321',
    targetMinutes: 60,
    description: 'Berlin merkezli yatıdan kalkışlı uçaklar için planlanan kalkış süresi.'
  },

  // --- CGN ---
  {
    id: 'cgn-tt-1',
    hub: 'CGN',
    name: 'A320 Int-Dom Turnaround',
    gtType: 'Turnaround',
    flightTypeCondition: 'Int-Dom',
    aircraftTypeCondition: 'A320',
    targetMinutes: 50,
    description: 'Köln Bonn Havalimanı dış hattan gelen ve iç hatta devam edecek A320 tipi uçaklar için turnaround hedefi.'
  },
  {
    id: 'cgn-tt-2',
    hub: 'CGN',
    name: 'A321 Int-Dom Turnaround',
    gtType: 'Turnaround',
    flightTypeCondition: 'Int-Dom',
    aircraftTypeCondition: 'A321',
    targetMinutes: 65,
    description: 'Köln Havalimanı dış hat bağlantılı Airbus A321 turnaround operasyonu.'
  },
  {
    id: 'cgn-tt-3',
    hub: 'CGN',
    name: 'Departure Only Ground Time',
    gtType: 'Departure',
    flightTypeCondition: 'Departure',
    aircraftTypeCondition: 'A320 ~ A321',
    targetMinutes: 60,
    description: 'Köln kalkışlı sefere hazırlık süresi.'
  },

  // --- FRA ---
  {
    id: 'fra-tt-1',
    hub: 'FRA',
    name: 'A320 Int-Dom Turnaround',
    gtType: 'Turnaround',
    flightTypeCondition: 'Int-Dom',
    aircraftTypeCondition: 'A320',
    targetMinutes: 50,
    description: 'Frankfurt Uluslararası Havalimanı gümrüklü hat süreçlerini içeren dar gövde A320 turnaround.'
  },
  {
    id: 'fra-tt-2',
    hub: 'FRA',
    name: 'A321 Int-Dom Turnaround',
    gtType: 'Turnaround',
    flightTypeCondition: 'Int-Dom',
    aircraftTypeCondition: 'A321',
    targetMinutes: 65,
    description: 'Frankfurt Havalimanı yüksek yoğunluklu hat üzerindeki Airbus A321 turnaround.'
  },
  {
    id: 'fra-tt-3',
    hub: 'FRA',
    name: 'Departure Only Ground Time',
    gtType: 'Departure',
    flightTypeCondition: 'Departure',
    aircraftTypeCondition: 'A320 ~ A321',
    targetMinutes: 60,
    description: 'Frankfurt kalkışlı (departure) yatı operasyonları standart hazırlığı.'
  },

  // --- MUC ---
  {
    id: 'muc-tt-1',
    hub: 'MUC',
    name: 'A320 Int-Dom Turnaround',
    gtType: 'Turnaround',
    flightTypeCondition: 'Int-Dom',
    aircraftTypeCondition: 'A320',
    targetMinutes: 50,
    description: 'Münih Havalimanı dış hattan gelip iç hatta giden dar gövde turnaround.'
  },
  {
    id: 'muc-tt-2',
    hub: 'MUC',
    name: 'A321 Int-Dom Turnaround',
    gtType: 'Turnaround',
    flightTypeCondition: 'Int-Dom',
    aircraftTypeCondition: 'A321',
    targetMinutes: 65,
    description: 'Münih Havalimanı Airbus A321 tipi uçak turnaround hedefi.'
  },
  {
    id: 'muc-tt-3',
    hub: 'MUC',
    name: 'Departure Only Ground Time',
    gtType: 'Departure',
    flightTypeCondition: 'Departure',
    aircraftTypeCondition: 'A320 ~ A321',
    targetMinutes: 60,
    description: 'Münih kalkışlı yatı uçak operasyon standart süresi.'
  },

  // --- SAW ---
  {
    id: 'saw-tt-1',
    hub: 'SAW',
    name: 'B738-A320 Dom-Dom Turnaround',
    gtType: 'Turnaround',
    flightTypeCondition: 'Dom-Dom (İç Hat - İç Hat)',
    aircraftTypeCondition: '737 ~ 738 ~ 320',
    targetMinutes: 40,
    description: 'Sabiha Gökçen yoğunluğunda iç hattan iç hata geçişte dar gövdeli uçaklar için tanımlı turnaround hedefi.'
  },
  {
    id: 'saw-tt-2',
    hub: 'SAW',
    name: 'B738-A320 Dom-Int Turnaround',
    gtType: 'Turnaround',
    flightTypeCondition: 'Dom-Int',
    aircraftTypeCondition: '737 ~ 738 ~ 320',
    targetMinutes: 45,
    description: 'Sabiha Gökçen iç hattan gelip dış hatta giden dar gövde uçaklar için turnaround hedefi.'
  },
  {
    id: 'saw-tt-3',
    hub: 'SAW',
    name: 'B738-A320 Int-X Turnaround',
    gtType: 'Turnaround',
    flightTypeCondition: 'Int-X (Dış Hat Bağlantılı)',
    aircraftTypeCondition: '737 ~ 738 ~ 320',
    targetMinutes: 50,
    description: 'Dış hat gelişli tüm dar gövde turnaround operasyonları (pasaport, transit bagaj kontrolü vb.).'
  },
  {
    id: 'saw-tt-4',
    hub: 'SAW',
    name: 'A321 Dom-Dom Turnaround',
    gtType: 'Turnaround',
    flightTypeCondition: 'Dom-Dom',
    aircraftTypeCondition: '321',
    targetMinutes: 50,
    description: 'Airbus A321 uçak tipi için iç hat turnaround operasyonu.'
  },
  {
    id: 'saw-tt-5',
    hub: 'SAW',
    name: 'A321 Dom-Int/Int-Dom/Int-Int',
    gtType: 'Turnaround',
    flightTypeCondition: 'Dom-Int / Int-Dom / Int-Int',
    aircraftTypeCondition: '321',
    targetMinutes: 60,
    description: 'Airbus A321 uçaklar için dış hat bağlantılı turnaround operasyonu.'
  },
  {
    id: 'saw-tt-6',
    hub: 'SAW',
    name: 'Departure-60dk Ground Time',
    gtType: 'Departure',
    flightTypeCondition: 'Departure (Sadece Kalkış)',
    aircraftTypeCondition: '737 ~ 738 ~ 321 ~ 320',
    targetMinutes: 60,
    description: 'Sabiha Gökçen yatı sonrası sefere çıkacak uçak hazırlık süresi.'
  },
  {
    id: 'saw-tt-7',
    hub: 'SAW',
    name: 'Classical A320 Turnaround',
    gtType: 'Turnaround',
    flightTypeCondition: 'Any / Normal Turn',
    aircraftTypeCondition: '320',
    targetMinutes: 40,
    description: 'Geleneksel Airbus A320 tipi standart turnaround operasyon hedefi.'
  }
];

// Typical services during turnaround with allocations based on scale
export const IATA_DELAY_CODES = [
  { code: '15', category: 'Cleaning', reason: 'Kabin Temizliği Gecikmesi', responsible: 'Temizlik Şirketi' },
  { code: '18', category: 'Catering', reason: 'Catering Teslimat Gecikmesi', responsible: 'Catering Şirketi' },
  { code: '21', category: 'Crew', reason: 'Uçuş/Kabin Ekibi Hazırlık Gecikmesi', responsible: 'Havayolu' },
  { code: '31', category: 'Baggage', reason: 'Bagaj Ayrıştırma & Transfer Gecikmesi', responsible: 'Ramp Hizmetleri' },
  { code: '41', category: 'Cargo', reason: 'Kargo / Posta Yükleme Gecikmesi', responsible: 'Ramp Hizmetleri' },
  { code: '46', category: 'Fueling', reason: 'Yakıt İkmali Gecikmesi', responsible: 'Yakıt Sağlayıcı' },
  { code: '51', category: 'Boarding', reason: 'Yolcu Alımı / Kapı Gecikmesi', responsible: 'Kapı / Yer Hizmetleri' },
];

export const getTurnaroundServiceAllocations = (targetMinutes: number): ServiceBreakdown[] => {
  // We allocate parts of target ground time to different services.
  // Many run in parallel, but summing up sequential blocks usually defines the critical path.
  // Here we provide the allocated duration (which is a realistic percentage of total)
  return [
    {
      id: 'srv-deboarding',
      name: 'Deboarding & Inbound Baggage',
      allocatedMinutes: Math.max(8, Math.round(targetMinutes * 0.25)),
      criticalPath: true,
      responsibleIcon: 'UserMinus',
      description: 'Yolcuların inişi ve gelen bagajların tahliyesi.'
    },
    {
      id: 'srv-catering',
      name: 'Catering & Galley Service',
      allocatedMinutes: Math.max(10, Math.round(targetMinutes * 0.35)),
      criticalPath: false,
      responsibleIcon: 'Utensils',
      description: 'Uçak içi yiyecek ve içecek servis yenilemesi (Catering).'
    },
    {
      id: 'srv-cleaning',
      name: 'Cabin Cleaning & Waste',
      allocatedMinutes: Math.max(8, Math.round(targetMinutes * 0.30)),
      criticalPath: false,
      responsibleIcon: 'Trash2',
      description: 'Kabin temizliği ve atık yönetimi hizmetleri.'
    },
    {
      id: 'srv-fueling',
      name: 'Refueling (Jet-A1)',
      allocatedMinutes: Math.max(12, Math.round(targetMinutes * 0.40)),
      criticalPath: true,
      responsibleIcon: 'Droplet',
      description: 'Uçağın sefere uygun miktarda yakıt ikmali yapması.'
    },
    {
      id: 'srv-boarding',
      name: 'Passenger Boarding',
      allocatedMinutes: Math.max(12, Math.round(targetMinutes * 0.45)),
      criticalPath: true,
      responsibleIcon: 'UserPlus',
      description: 'Giden yolcuların kapıdan uçağa kabulü ve yerleşimi.'
    },
    {
      id: 'srv-baggage-loading',
      name: 'Baggage & Cargo Loading',
      allocatedMinutes: Math.max(10, Math.round(targetMinutes * 0.40)),
      criticalPath: false,
      responsibleIcon: 'Luggage',
      description: 'Giden yolcu bagajlarının ve ticari kargonun yüklenmesi.'
    },
    {
      id: 'srv-pushback',
      name: 'Pushback & Pre-Flight Checks',
      allocatedMinutes: Math.max(5, Math.round(targetMinutes * 0.15)),
      criticalPath: true,
      responsibleIcon: 'MoveUp',
      description: 'Kokpit-Ramp mutabakatı, kapıların kapanışı ve pushback işlemi.'
    }
  ];
};

export const getGanttServicesForTemplate = (templateId: string, targetMinutes: number): GanttService[] => {
  const scale = targetMinutes / 40;
  // Ensure we round cleanly and have minimum 1 minute
  const round = (val: number) => Math.max(1, Math.round(val));

  // 1. Calculate Durations
  const d1 = round(2 * scale);   // Bridge Connection
  const d2 = round(7 * scale);   // De-Boarding
  const d3 = round(7 * scale);   // Fuelling
  const d4 = round(5 * scale);   // Cleaning
  const d5 = round(11 * scale);  // Crew Prep
  const d6 = round(5 * scale);   // Catering
  const d7 = round(6 * scale);   // Security Check
  const d9 = round(18 * scale);  // Embarking
  const d8 = round(14 * scale);  // Systematic Boarding
  const d10 = round(16 * scale); // Baggage Unload
  const d11 = round(20 * scale); // Baggage Load
  const d12 = round(2 * scale);  // Pushback

  // 2. Compute Starts and Finishes
  const s1 = 0;
  const f1 = s1 + d1;

  const s2 = f1;
  const f2 = s2 + d2;

  const s3 = f2;
  const f3 = s3 + d3;

  const s4 = f2;
  const f4 = s4 + d4;

  const s5 = f2;
  const f5 = s5 + d5;

  const s6 = f2;
  const f6 = s6 + d6;

  const s7 = f4;
  const f7 = s7 + d7;

  const s10 = f1;
  const f10 = s10 + d10;

  const s11 = f10;
  const f11 = s11 + d11;

  const s9 = Math.max(f4, f3, f7);
  const f9 = s9 + d9;

  const s8 = Math.max(0, s9 - round(5 * scale));
  const f8 = s8 + d8;

  const s12 = Math.max(f9, f11);
  const f12 = s12 + d12;

  // Let's create the final records
  return [
    {
      id: 'gs-1',
      name: 'Bridge-Stairs Connection',
      baseDuration: d1,
      plannedStart: s1,
      plannedFinish: f1,
      predecessor: 'none',
      relationType: 'none',
      isCritical: false,
      slackMinutes: round(2 * scale),
      status: 'Completed',
      colorCategory: 'red',
      flexibleStart: s1,
      flexibleFinish: f1 + round(2 * scale),
      earliestStart: s1,
      earliestFinish: f1,
      latestStart: s1 + round(2 * scale),
      latestFinish: f1 + round(2 * scale),
      businessRule: 'Kabin ve kokpit ekibi uçuş sonrası hazırlandığında rampa yaklaşımı ile eş zamanlı bağlanır.'
    },
    {
      id: 'gs-2',
      name: 'De-Boarding',
      baseDuration: d2,
      plannedStart: s2,
      plannedFinish: f2,
      predecessor: 'Bridge-Stairs Connection',
      relationType: 'Finish-Start',
      isCritical: true,
      slackMinutes: 0,
      status: 'Completed',
      colorCategory: 'red',
      flexibleStart: s2,
      flexibleFinish: f2,
      earliestStart: s2,
      earliestFinish: f2,
      latestStart: s2,
      latestFinish: f2,
      businessRule: 'Yolcu inişinin tamamlanması kabin temizliği, ikram ve yakıt yükleme süreçlerinin başlangıç koşuludur.'
    },
    {
      id: 'gs-3',
      name: 'Fuelling',
      baseDuration: d3,
      plannedStart: s3,
      plannedFinish: f3,
      predecessor: 'De-Boarding',
      relationType: 'Finish-Start',
      isCritical: false,
      slackMinutes: round(4 * scale),
      status: 'Completed',
      colorCategory: 'blue',
      flexibleStart: s3,
      flexibleFinish: f3 + round(4 * scale),
      earliestStart: s3,
      earliestFinish: f3,
      latestStart: s3 + round(4 * scale),
      latestFinish: f3 + round(4 * scale),
      businessRule: 'Yakıt ikmali sırasında açık kapılardan / merdivenlerden güvenlik tahliyesi planı yürürlüktedir.'
    },
    {
      id: 'gs-4',
      name: 'Cleaning',
      baseDuration: d4,
      plannedStart: s4,
      plannedFinish: f4,
      predecessor: 'De-Boarding',
      relationType: 'Finish-Start',
      isCritical: false,
      slackMinutes: round(3 * scale),
      status: 'Completed',
      colorCategory: 'blue',
      flexibleStart: s4,
      flexibleFinish: f4 + round(3 * scale),
      earliestStart: s4,
      earliestFinish: f4,
      latestStart: s4 + round(3 * scale),
      latestFinish: f4 + round(3 * scale),
      businessRule: 'Kabin temizlik onayı yolcu binişinin (boarding) başlaması için ön koşuldur.'
    },
    {
      id: 'gs-5',
      name: 'Crew Preparing',
      baseDuration: d5,
      plannedStart: s5,
      plannedFinish: f5,
      predecessor: 'De-Boarding',
      relationType: 'Finish-Start',
      isCritical: false,
      slackMinutes: round(8 * scale),
      status: 'Completed',
      colorCategory: 'blue',
      flexibleStart: s5,
      flexibleFinish: f5 + round(8 * scale),
      earliestStart: s5,
      earliestFinish: f5,
      latestStart: s5 + round(8 * scale),
      latestFinish: f5 + round(8 * scale),
      businessRule: 'Ekip hazırlığı ve uçuş öncesi brifingi kabinde gerçekleştirilir.'
    },
    {
      id: 'gs-6',
      name: 'Catering',
      baseDuration: d6,
      plannedStart: s6,
      plannedFinish: f6,
      predecessor: 'De-Boarding',
      relationType: 'Finish-Start',
      isCritical: false,
      slackMinutes: round(10 * scale),
      status: 'Completed',
      colorCategory: 'blue',
      flexibleStart: s6,
      flexibleFinish: f6 + round(10 * scale),
      earliestStart: s6,
      earliestFinish: f6,
      latestStart: s6 + round(10 * scale),
      latestFinish: f6 + round(10 * scale),
      businessRule: 'Galley malzemeleri değişimi ve ikram yüklemesi arka servis kapısından icra edilir.'
    },
    {
      id: 'gs-7',
      name: 'Crew Security Check',
      baseDuration: d7,
      plannedStart: s7,
      plannedFinish: f7,
      predecessor: 'Cleaning',
      relationType: 'Finish-Start',
      isCritical: false,
      slackMinutes: round(2 * scale),
      status: 'Completed',
      colorCategory: 'blue',
      flexibleStart: s7,
      flexibleFinish: f7 + round(2 * scale),
      earliestStart: s7,
      earliestFinish: f7,
      latestStart: s7 + round(2 * scale),
      latestFinish: f7 + round(2 * scale),
      businessRule: 'Temizlik sonrasında kokpit ve kabin ekibi güvenlik taraması tamamlanır.'
    },
    {
      id: 'gs-8',
      name: 'Systematic Boarding',
      baseDuration: d8,
      plannedStart: s8,
      plannedFinish: f8,
      predecessor: 'Passenger Embarking',
      relationType: 'Start-Start',
      offset: -round(5 * scale),
      isCritical: true,
      slackMinutes: 0,
      status: 'In Progress',
      colorCategory: 'green',
      flexibleStart: s8,
      flexibleFinish: f8,
      earliestStart: s8,
      earliestFinish: f8,
      latestStart: s8,
      latestFinish: f8,
      businessRule: 'Systematic Boarding starts automatically when First Boarding Time is received from DCS. It ends when Last Boarding Time is received.'
    },
    {
      id: 'gs-9',
      name: 'Passenger Embarking',
      baseDuration: d9,
      plannedStart: s9,
      plannedFinish: f9,
      predecessor: 'Cleaning / Fuelling / Crew Security Check',
      relationType: 'Finish-Start',
      isCritical: true,
      slackMinutes: 0,
      status: 'In Progress',
      colorCategory: 'red',
      flexibleStart: s9,
      flexibleFinish: f9,
      earliestStart: s9,
      earliestFinish: f9,
      latestStart: s9,
      latestFinish: f9,
      businessRule: 'Passenger Embarking may extend beyond base duration visually, but impact should be evaluated by allowed timing window and GT deadline.'
    },
    {
      id: 'gs-10',
      name: 'Baggage Unloading',
      baseDuration: d10,
      plannedStart: s10,
      plannedFinish: f10,
      predecessor: 'Bridge-Stairs Connection',
      relationType: 'Finish-Start',
      isCritical: false,
      slackMinutes: round(3 * scale),
      status: 'Completed',
      colorCategory: 'orange',
      flexibleStart: s10,
      flexibleFinish: f10 + round(3 * scale),
      earliestStart: s10,
      earliestFinish: f10,
      latestStart: s10 + round(3 * scale),
      latestFinish: f10 + round(3 * scale),
      businessRule: 'Gelen uçuş bagajları rampa indikten sonra ayrıştırma bölmesine sevk edilir.'
    },
    {
      id: 'gs-11',
      name: 'Baggage Loading',
      baseDuration: d11,
      plannedStart: s11,
      plannedFinish: f11,
      predecessor: 'Baggage Unloading',
      relationType: 'Finish-Start',
      isCritical: false,
      slackMinutes: round(1 * scale),
      status: 'Not Started',
      colorCategory: 'orange',
      flexibleStart: s11,
      flexibleFinish: f11 + round(1 * scale),
      earliestStart: s11,
      earliestFinish: f11,
      latestStart: s11 + round(1 * scale),
      latestFinish: f11 + round(1 * scale),
      businessRule: 'Giden uçuşun bagajları ayrıştırma konveyöründe gruplanarak bulk/konteyner halinde yüklenir.'
    },
    {
      id: 'gs-12',
      name: 'Pushback Process',
      baseDuration: d12,
      plannedStart: s12,
      plannedFinish: f12,
      predecessor: 'Passenger Embarking',
      relationType: 'Finish-Start',
      isCritical: true,
      slackMinutes: 0,
      status: 'Not Started',
      colorCategory: 'blue',
      flexibleStart: s12,
      flexibleFinish: f12,
      earliestStart: s12,
      earliestFinish: f12,
      latestStart: s12,
      latestFinish: f12,
      businessRule: 'Uçuş kapısı kapanıp kokpit onay verdiğinde pushback aracı ile geri itme süreci başlar.'
    }
  ];
};

