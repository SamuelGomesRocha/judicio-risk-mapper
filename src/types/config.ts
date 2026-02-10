import { RiskColorConfig, DEFAULT_RISK_COLORS } from './risk-colors';

export interface RiskLevel {
  level: string;
  minValue: number;
  maxValue: number;
}

export interface RiskScale {
  id: string;
  levels: RiskLevel[];
}

export const DEFAULT_RISK_SCALE: RiskLevel[] = [
  { level: "EXTREMO", minValue: 49, maxValue: 100 },
  { level: "ALTO", minValue: 25, maxValue: 48 },
  { level: "MÉDIO", minValue: 9, maxValue: 24 },
  { level: "BAIXO", minValue: 1, maxValue: 8 },
];

export interface ConfigSettings {
  // API Configuration
  url: string;
  username: string;
  password: string;
  aikey: string;
  
  // Risk Scale Configuration
  riskLevels: RiskLevel[];
  
  // Risk Colors Configuration
  riskColors: RiskColorConfig;
}
