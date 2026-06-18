/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type HubCode = 'ADB' | 'AYT' | 'BER' | 'CGN' | 'FRA' | 'MUC' | 'SAW';

export type GTType = 'Turnaround' | 'Departure';

export interface GroundTimeTemplate {
  id: string;
  hub: HubCode;
  name: string;
  gtType: GTType;
  flightTypeCondition: string;
  aircraftTypeCondition: string;
  targetMinutes: number;
  description: string;
}

export interface HubDetails {
  code: HubCode;
  fullName: string;
  country: string;
  city: string;
  averageTargetGT: number;
  totalTemplates: number;
}

export interface ServiceBreakdown {
  id: string;
  name: string;
  allocatedMinutes: number;
  criticalPath: boolean;
  responsibleIcon: string;
  description: string;
}

export type RelationType = 'Finish-Start' | 'Start-Start' | 'Finish-Finish' | 'Start-Finish' | 'none';

export interface GanttService {
  id: string;
  name: string;
  baseDuration: number;
  plannedStart: number;
  plannedFinish: number;
  predecessor: string;
  relationType: RelationType;
  offset?: number;
  isCritical: boolean;
  slackMinutes: number;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
  colorCategory: 'blue' | 'green' | 'orange' | 'red';
  flexibleStart: number;
  flexibleFinish: number;
  earliestStart?: number;
  earliestFinish?: number;
  latestStart?: number;
  latestFinish?: number;
  businessRule?: string;
  actualStart?: number; // for future planned vs actual comparison
  actualFinish?: number; // for future planned vs actual comparison
}

