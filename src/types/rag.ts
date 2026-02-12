/**
 * RAG (Retrieval-Augmented Generation) Data Types
 * Defines the structure for external risk analysis data
 */

export interface RagRiskEntry {
  Projeto: string;
  Causa: string;
  Evento_de_Risco: string;
  Consequencia: string;
  Probabilidade: string;
  Impacto: string;
  Risco_Inerente: string;
  Controles: string;
  Fator_de_Controle: string;
  Risco_Residual: string;
  Resposta: string;
}

export type RagData = RagRiskEntry[];

/**
 * Validates if data is a valid RAG array
 */
export const isValidRagData = (data: unknown): data is RagData => {
  if (!Array.isArray(data)) return false;
  if (data.length === 0) return false;

  return data.every((item) => {
    if (typeof item !== "object" || item === null) return false;

    const requiredFields = [
      "Projeto",
      "Causa",
      "Evento_de_Risco",
      "Consequencia",
      "Probabilidade",
      "Impacto",
      "Risco_Inerente",
      "Controles",
      "Fator_de_Controle",
      "Risco_Residual",
      "Resposta",
    ];

    return requiredFields.every(
      (field) =>
        field in item && typeof (item as Record<string, unknown>)[field] === "string"
    );
  });
};
