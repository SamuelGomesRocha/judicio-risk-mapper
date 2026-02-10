export interface RiskColorConfig {
  [level: string]: string; // Mapa nível -> cor hex
}

export const DEFAULT_RISK_COLORS: RiskColorConfig = {
  "MUITO BAIXO": "#1F2937", // cinza escuro
  "BAIXO": "#F59E0B",        // amarelo
  "MÉDIO": "#F97316",        // laranja
  "ALTO": "#EF4444",         // vermelho
  "EXTREMO": "#7C3AED",      // roxo
  "MUITO RELEVANTE": "#EF4444",  // vermelho (mapeado ao Alto)
  "RELEVANTE": "#F97316",        // laranja (mapeado ao Médio)
};

export function getColorForLevel(level: string | undefined, colors: RiskColorConfig): string {
  if (!level) return colors["MÉDIO"] || "#F97316";
  const normalizedLevel = level.toUpperCase();
  return colors[normalizedLevel] || colors["MÉDIO"] || "#F97316";
}
