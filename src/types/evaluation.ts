/**
 * Evaluation Types and Constants for ARES Framework
 * Centralizes all evaluation-related DTOs and UI constants
 */

export type FieldType = "evento" | "causa" | "consequencia" | "controle";

export interface EvaluationQuestions {
  context_relevance: string;
  faithfulness: string;
  answer_relevance: string;
}

/**
 * Mapeamento de perguntas dinâmicas por tipo de campo
 * Cada field_type tem 3 perguntas correspondentes aos critérios ARES:
 * CR (Context Relevance), F (Faithfulness), AR (Answer Relevance)
 */
export const EVALUATION_QUESTIONS_MAP: Record<FieldType, EvaluationQuestions> = {
  evento: {
    context_relevance: "O trecho descreve uma ameaça real?",
    faithfulness: "Existe no documento original ou foi alucinado?",
    answer_relevance: "É relevante para a contratação de TIC/TJGO?"
  },
  causa: {
    context_relevance: "Está fundamentada nos fatos do TR?",
    faithfulness: "A causa deriva logicamente do contexto?",
    answer_relevance: "Ajuda o gestor na tomada de decisão?"
  },
  consequencia: {
    context_relevance: "Representa um desdobramento real no TJGO?",
    faithfulness: "É fiel aos prejuízos previstos nos documentos?",
    answer_relevance: "Está alinhada aos objetivos do projeto?"
  },
  controle: {
    context_relevance: "Usa normas ou histórico da base de conhecimento?",
    faithfulness: "É factível e compatível com a infraestrutura?",
    answer_relevance: "É eficaz para mitigar a causa associada?"
  }
};

/**
 * Rótulos legíveis para as métricas ARES
 */
export const METRIC_LABELS = {
  context_relevance: "Relevância de Contexto (CR)",
  faithfulness: "Fidelidade (F)",
  answer_relevance: "Relevância da Resposta (AR)"
} as const;

/**
 * Obtém as perguntas para um tipo de campo específico
 */
export function getEvaluationQuestions(fieldType: FieldType): EvaluationQuestions {
  return EVALUATION_QUESTIONS_MAP[fieldType];
}

/**
 * Converte label de field_type para display humanizado
 */
export function getFieldTypeLabel(fieldType: FieldType): string {
  const labels: Record<FieldType, string> = {
    evento: "Evento",
    causa: "Causa",
    consequencia: "Consequência",
    controle: "Controle"
  };
  return labels[fieldType];
}

/**
 * Constantes de validação ARES
 */
export const ARES_METRICS = {
  MIN_VALUE: -1.0,
  MAX_VALUE: 1.0,
  STEP: 0.1
} as const;

/**
 * Estado de avaliação para tracking local
 */
export interface EvaluationState {
  context_relevance: number | null;
  faithfulness: number | null;
  answer_relevance: number | null;
  feedback_notes: string;
}

/**
 * Factory function para estado inicial
 */
export function createEmptyEvaluationState(): EvaluationState {
  return {
    context_relevance: null,
    faithfulness: null,
    answer_relevance: null,
    feedback_notes: ""
  };
}

/**
 * Verifica se uma avaliação está completa (todas as 3 métricas preenchidas)
 */
export function isEvaluationComplete(state: EvaluationState): boolean {
  return (
    state.context_relevance !== null &&
    state.faithfulness !== null &&
    state.answer_relevance !== null
  );
}

/**
 * Converte estado de avaliação para o formato esperado pela API
 */
export function evaluationStateToPayload(
  state: EvaluationState,
  riskItemId: string | undefined,
  content: string
) {
  return {
    ...(riskItemId ? { risk_item_id: riskItemId } : {}),
    evaluator_type: "human" as const,
    response: content,
    context_relevance: state.context_relevance!,
    faithfulness: state.faithfulness!,
    answer_relevance: state.answer_relevance!,
    ...(state.feedback_notes ? { feedback_notes: state.feedback_notes } : {})
  };
}
