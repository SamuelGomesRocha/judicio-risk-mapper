export interface Controle {
  nome: string;
  detalhe: string;
}

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
  controles?: Controle[];
  nivel_controle?: string;
  risco_residual?: number;
  nivel_risco_residual?: string;
}

export interface RiskAnalysisResponse {
  status: string;
  project_name: string;
  objectives: string[];
  risks: RiskAnalysis[];
  processed_files: string[];
  analysis_id: string;
}

export interface RiskItem {
  id: string;
  field_type: "evento" | "causa" | "consequencia" | "controle";
  content: string;
  analysis_id: string;
}

export interface EvaluationPayload {
  risk_item_id?: string;
  evaluator_type: "human";
  response: string;
  context_relevance: number;
  faithfulness: number;
  answer_relevance: number;
  feedback_notes?: string;
}

export interface EvaluationCreateResponse {
  id: string;
  status: string;
  created_at: string;
}

export interface UploadedFiles {
  dod: File | null;
  etp: File | null;
  tr: File | null;
}
