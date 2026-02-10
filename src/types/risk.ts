export interface RiskAnalysis {
  causa: string[];
  evento_de_risco: string;
  consequencia: string[];
  probabilidade?: number;
  nivel_probabilidade?: string;
  impacto?: number;
  nivel_impacto?: string;
  risco_inerente?: number;
  nivel_risco_inerente?: string;
}

export interface RiskAnalysisResponse {
  status: string;
  project_name: string;
  objectives: string[];
  risks: RiskAnalysis[];
  processed_files: string[];
}

export interface UploadedFiles {
  dod: File | null;
  etp: File | null;
  tr: File | null;
}
