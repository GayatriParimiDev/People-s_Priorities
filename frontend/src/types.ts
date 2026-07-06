export interface LedgerItem {
  id: string;
  submissionDate: string;
  priorityLevel: "CRITICAL" | "ELEVATED" | "STANDARD" | "RESOLVED";
  theme: string;
  title: string;
  status: "UNDER REVIEW" | "SCHEDULED" | "ARCHIVED" | "CLOSED" | "IN PROGRESS";
  description: string;
  latitude: number;
  longitude: number;
  signatures: number;
  verificationStatus: string;
}

export interface ThemeStat {
  id: string;
  name: string;
  count: number;
}

export interface DistrictConfig {
  districtId: string;
  representative: string;
  mfaEnabled: boolean;
  auditLoggingEnabled: boolean;
  language: string;
  languages: string[];
}

export interface ProposalEndorsements {
  alphaCount: number;
  betaCount: number;
  alphaPercent: number;
  betaPercent: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "MP" | "ADMINISTRATOR" | "CITIZEN";
  districtId?: string;
  office?: string;
  avatarUrl?: string;
}

export type ViewState = 
  | "LANDING"
  | "AUTH"
  | "INTAKE"
  | "DASHBOARD"
  | "EVALUATION"
  | "TIMELINE"
  | "LEDGER"
  | "SETTINGS";
