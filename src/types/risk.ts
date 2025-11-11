export interface RiskAnalysis {
  Causas: string[];
  "Evento de risco": string;
  Consequências: string[];
  Controles: string[];
}

export interface UploadedFiles {
  dod: File | null;
  etp: File | null;
  tr: File | null;
}
