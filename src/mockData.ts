import { HubCode } from './types';

export interface ActiveFlight {
  id: string;
  flightNumber: string;
  tailNumber: string;
  station: HubCode;
  destination: string;
  aircraftType: string;
  gtType: 'Turnaround' | 'Departure';
  flightType: 'Domestic' | 'International';
  gtTemplate: string;
  gtTarget: number;
  elapsedGt: number;
  remainingGt: number;
  currentService: string;
  status: 'On Target' | 'At Risk' | 'Critical' | 'Delayed';
  delayRiskPercentage: number;
  riskFactor: string;
}

export const INITIAL_ACTIVE_FLIGHTS: ActiveFlight[] = [
  {
    id: 'af-1',
    flightNumber: 'PC2801',
    tailNumber: 'TC-NBA',
    station: 'SAW',
    destination: 'ADB',
    aircraftType: 'A20N',
    gtType: 'Turnaround',
    flightType: 'Domestic',
    gtTemplate: 'B738-A320 Dom-Dom Turnaround',
    gtTarget: 40,
    elapsedGt: 44,
    remainingGt: 0,
    currentService: 'Pushback Process (Kalkış)',
    status: 'Delayed',
    delayRiskPercentage: 100,
    riskFactor: 'Passenger boarding overflow: Seat count dispute at boarding gate.'
  },
  {
    id: 'af-2',
    flightNumber: 'PC1125',
    tailNumber: 'TC-RNA',
    station: 'ADB',
    destination: 'SAW',
    aircraftType: 'B738',
    gtType: 'Turnaround',
    flightType: 'Domestic',
    gtTemplate: 'B738-A320 Dom-Dom Turnaround',
    gtTarget: 35,
    elapsedGt: 32,
    remainingGt: 3,
    currentService: 'Passenger Embarking (Giriş)',
    status: 'Critical',
    delayRiskPercentage: 89,
    riskFactor: 'Late cabin cleaning hand-over delayed passenger boarding start.'
  },
  {
    id: 'af-3',
    flightNumber: 'PC2013',
    tailNumber: 'TC-NCP',
    station: 'SAW',
    destination: 'BER',
    aircraftType: 'A320',
    gtType: 'Turnaround',
    flightType: 'International',
    gtTemplate: 'B738-A320 Dom-Int Turnaround',
    gtTarget: 45,
    elapsedGt: 34,
    remainingGt: 11,
    currentService: 'Passenger Embarking (Giriş)',
    status: 'At Risk',
    delayRiskPercentage: 78,
    riskFactor: 'Passenger Boarding latest finish exceeded due to slow baggage loading.'
  },
  {
    id: 'af-4',
    flightNumber: 'PC4317',
    tailNumber: 'TC-RBC',
    station: 'AYT',
    destination: 'FRA',
    aircraftType: 'A321',
    gtType: 'Turnaround',
    flightType: 'International',
    gtTemplate: 'A321 Mixed Flights Turnaround',
    gtTarget: 65,
    elapsedGt: 61,
    remainingGt: 4,
    currentService: 'Pushback Process (Kalkış)',
    status: 'Critical',
    delayRiskPercentage: 81,
    riskFactor: 'Catering truck late arrival disrupted simultaneous cleaning flow.'
  },
  {
    id: 'af-5',
    flightNumber: 'PC2611',
    tailNumber: 'TC-NCO',
    station: 'SAW',
    destination: 'AYT',
    aircraftType: 'A320',
    gtType: 'Departure',
    flightType: 'Domestic',
    gtTemplate: 'Departure-60dk Ground Time',
    gtTarget: 60,
    elapsedGt: 59,
    remainingGt: 1,
    currentService: 'Baggage Loading (Yükleme)',
    status: 'At Risk',
    delayRiskPercentage: 54,
    riskFactor: 'Late transit bags from domestic arrivals require split loading.'
  },
  {
    id: 'af-6',
    flightNumber: 'PC1902',
    tailNumber: 'TC-RPE',
    station: 'BER',
    destination: 'SAW',
    aircraftType: 'B738',
    gtType: 'Departure',
    flightType: 'International',
    gtTemplate: 'Departure Only Ground Time',
    gtTarget: 60,
    elapsedGt: 20,
    remainingGt: 40,
    currentService: 'Fuelling (Yakıt İkmali)',
    status: 'On Target',
    delayRiskPercentage: 12,
    riskFactor: 'Nominal operations. Fuelling progressing in tolerance window.'
  },
  {
    id: 'af-7',
    flightNumber: 'PC2134',
    tailNumber: 'TC-NCY',
    station: 'ADB',
    destination: 'BER',
    aircraftType: 'A320',
    gtType: 'Turnaround',
    flightType: 'International',
    gtTemplate: 'B738-A320 Mixed Flights Turnaround',
    gtTarget: 45,
    elapsedGt: 12,
    remainingGt: 33,
    currentService: 'De-Boarding (Yolcu İniş)',
    status: 'On Target',
    delayRiskPercentage: 8,
    riskFactor: 'Nominal operations on de-boarding. Clean team ready.'
  },
  {
    id: 'af-8',
    flightNumber: 'PC3455',
    tailNumber: 'TC-RPA',
    station: 'FRA',
    destination: 'SAW',
    aircraftType: 'B738',
    gtType: 'Departure',
    flightType: 'International',
    gtTemplate: 'Departure Only Ground Time',
    gtTarget: 60,
    elapsedGt: 5,
    remainingGt: 55,
    currentService: 'Bridge-Stairs Connection',
    status: 'On Target',
    delayRiskPercentage: 4,
    riskFactor: 'Balkon connection verified. De-boarding starting.'
  },
  {
    id: 'af-9',
    flightNumber: 'PC1559',
    tailNumber: 'TC-AMP',
    station: 'MUC',
    destination: 'SAW',
    aircraftType: 'A320',
    gtType: 'Turnaround',
    flightType: 'International',
    gtTemplate: 'A320 Int-Dom Turnaround',
    gtTarget: 50,
    elapsedGt: 25,
    remainingGt: 25,
    currentService: 'Cabin Cleaning & Prep',
    status: 'On Target',
    delayRiskPercentage: 15,
    riskFactor: 'Nominal operations. Security screen scheduled.'
  },
  {
    id: 'af-10',
    flightNumber: 'PC1788',
    tailNumber: 'TC-LIA',
    station: 'CGN',
    destination: 'SAW',
    aircraftType: 'A321',
    gtType: 'Turnaround',
    flightType: 'International',
    gtTemplate: 'A321 Int-Dom Turnaround',
    gtTarget: 65,
    elapsedGt: 54,
    remainingGt: 11,
    currentService: 'Passenger Embarking (Giriş)',
    status: 'At Risk',
    delayRiskPercentage: 62,
    riskFactor: 'Late security check release on flight crew.'
  },
  {
    id: 'af-11',
    flightNumber: 'PC1435',
    tailNumber: 'TC-NCP',
    station: 'AYT',
    destination: 'SAW',
    aircraftType: 'B738',
    gtType: 'Turnaround',
    flightType: 'Domestic',
    gtTemplate: 'B738-A320 Dom-Dom Turnaround',
    gtTarget: 35,
    elapsedGt: 18,
    remainingGt: 17,
    currentService: 'Fuelling (Yakıt İkmali)',
    status: 'Critical',
    delayRiskPercentage: 81,
    riskFactor: 'Fuelling yet to start. Fuel truck delayed on taxiway.'
  },
  {
    id: 'af-12',
    flightNumber: 'PC5314',
    tailNumber: 'TC-RCD',
    station: 'SAW',
    destination: 'MUC',
    aircraftType: 'B738',
    gtType: 'Turnaround',
    flightType: 'International',
    gtTemplate: 'B738-A320 Int-X Turnaround',
    gtTarget: 50,
    elapsedGt: 24,
    remainingGt: 26,
    currentService: 'Baggage Loading (Yükleme)',
    status: 'Critical',
    delayRiskPercentage: 73,
    riskFactor: 'Baggage Loading progressing slowly on critical path.'
  },
  {
    id: 'af-13',
    flightNumber: 'PC2099',
    tailNumber: 'TC-NDB',
    station: 'SAW',
    destination: 'CGN',
    aircraftType: 'A20N',
    gtType: 'Turnaround',
    flightType: 'International',
    gtTemplate: 'A321 Dom-Int/Int-Dom/Int-Int',
    gtTarget: 60,
    elapsedGt: 64,
    remainingGt: 0,
    currentService: 'Pushback Process (Kalkış)',
    status: 'Delayed',
    delayRiskPercentage: 100,
    riskFactor: 'Late security check release on transit crew.'
  }
];

export interface DelayCause {
  name: string;
  share: number;
  avgMinutes: number;
  affectedFlights: number;
}

export const DELAY_CAUSES_DB: Record<'Today' | '7Days' | '30Days', DelayCause[]> = {
  Today: [
    { name: 'Passenger Boarding (Yolcu Biniş)', share: 34, avgMinutes: 18, affectedFlights: 8 },
    { name: 'Baggage Loading (Bagaj Yükleme)', share: 23, avgMinutes: 14, affectedFlights: 5 },
    { name: 'Fuelling Services (Yakıt İkmali)', share: 16, avgMinutes: 12, affectedFlights: 4 },
    { name: 'Cabin Cleaning & Prep (Temizlik)', share: 11, avgMinutes: 9, affectedFlights: 3 },
    { name: 'Crew Security Check (Güvenlik)', share: 8, avgMinutes: 6, affectedFlights: 2 },
    { name: 'Pushback and Tug (Geri İtme)', share: 5, avgMinutes: 4, affectedFlights: 1 },
    { name: 'Other (Catering / ATC / Weather)', share: 3, avgMinutes: 10, affectedFlights: 1 }
  ],
  '7Days': [
    { name: 'Passenger Boarding (Yolcu Biniş)', share: 31, avgMinutes: 16, affectedFlights: 45 },
    { name: 'Baggage Loading (Bagaj Yükleme)', share: 25, avgMinutes: 15, affectedFlights: 36 },
    { name: 'Fuelling Services (Yakıt İkmali)', share: 18, avgMinutes: 11, affectedFlights: 28 },
    { name: 'Cabin Cleaning & Prep (Temizlik)', share: 12, avgMinutes: 8, affectedFlights: 19 },
    { name: 'Crew Security Check (Güvenlik)', share: 7, avgMinutes: 5, affectedFlights: 12 },
    { name: 'Pushback and Tug (Geri İtme)', share: 4, avgMinutes: 3, affectedFlights: 8 },
    { name: 'Other (Catering / ATC / Weather)', share: 3, avgMinutes: 12, affectedFlights: 7 }
  ],
  '30Days': [
    { name: 'Passenger Boarding (Yolcu Biniş)', share: 35, avgMinutes: 17, affectedFlights: 184 },
    { name: 'Baggage Loading (Bagaj Yükleme)', share: 22, avgMinutes: 14, affectedFlights: 122 },
    { name: 'Fuelling Services (Yakıt İkmali)', share: 15, avgMinutes: 13, affectedFlights: 88 },
    { name: 'Cabin Cleaning & Prep (Temizlik)', share: 11, avgMinutes: 8, affectedFlights: 65 },
    { name: 'Crew Security Check (Güvenlik)', share: 9, avgMinutes: 7, affectedFlights: 51 },
    { name: 'Pushback and Tug (Geri İtme)', share: 5, avgMinutes: 4, affectedFlights: 29 },
    { name: 'Other (Catering / ATC / Weather)', share: 3, avgMinutes: 15, affectedFlights: 18 }
  ]
};

export interface LocalGanttService {
  id: string;
  name: string;
  baseDuration: number;
  plannedStart: number;
  plannedFinish: number;
  predecessor: string;
  relationType: 'FS' | 'SS' | 'none';
  isCritical: boolean;
  slackMinutes: number;
  flexibleStart: number;
  flexibleFinish: number;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed' | 'At Risk';
}
