export interface RiskColorConfig {
  [level: string]: string; // Mapa nível -> cor hex
}

/**
 * Color scale mapping: Verde (positive/low) → Red (negative/high)
 * Green: #10B981, #22C55E
 * Yellow-Green: #84CC16
 * Yellow: #FBBF24, #EAB308
 * Orange: #F97316
 * Red: #EF4444, #DC2626
 */

/**
 * Probability Scale Colors
 * 1: MUITO BAIXA (positive - green) → 5: MUITO ALTA (negative - red)
 */
export const PROBABILITY_COLORS: RiskColorConfig = {
  "1: MUITO BAIXA": "#10B981",    // green
  "2: BAIXA": "#84CC16",          // yellow-green
  "3: MÉDIA": "#FBBF24",          // yellow
  "4: ALTA": "#F97316",           // orange
  "5: MUITO ALTA": "#EF4444",     // red
};

/**
 * Impact Scale Colors
 * 1: INSIGNIFICANTE (positive - green) → 5: EXTREMO (negative - red)
 */
export const IMPACT_COLORS: RiskColorConfig = {
  "1: INSIGNIFICANTE": "#10B981",     // green
  "2: POUCO RELEVANTE": "#84CC16",    // yellow-green
  "3: RELEVANTE": "#FBBF24",          // yellow
  "4: MUITO RELEVANTE": "#F97316",    // orange
  "5: EXTREMO": "#EF4444",            // red
};

/**
 * Risk Level Colors (Inherent and Residual)
 * BAIXO (positive - green) → EXTREMO (negative - red)
 */
export const RISK_LEVEL_COLORS: RiskColorConfig = {
  "BAIXO": "#10B981",      // green
  "MÉDIO": "#FBBF24",      // yellow
  "ALTO": "#F97316",       // orange
  "EXTREMO": "#EF4444",    // red
};

/**
 * Control Factor Colors
 * INEXISTENTE (positive - green) → FORTE (negative - red)
 * Note: Inverse scale - lower factor is better (stronger control)
 */
export const CONTROL_FACTOR_COLORS: RiskColorConfig = {
  "INEXISTENTE": "#EF4444",    // red (no control = bad)
  "FRACO": "#F97316",          // orange (weak control)
  "MEDIANO": "#FBBF24",        // yellow (medium control)
  "SATISFATÓRIO": "#84CC16",   // yellow-green (good control)
  "FORTE": "#10B981",          // green (strong control = good)
};

/**
 * Legacy color config for backward compatibility
 */
export const DEFAULT_RISK_COLORS: RiskColorConfig = {
  "MUITO BAIXO": "#10B981",
  "BAIXO": "#FBBF24",
  "MÉDIO": "#F97316",
  "ALTO": "#EF4444",
  "EXTREMO": "#EF4444",
  "MUITO RELEVANTE": "#EF4444",
  "RELEVANTE": "#F97316",
};

/**
 * Get color for a specific level
 * Tries to match against all color scales
 */
export function getColorForLevel(level: string | undefined, colors?: RiskColorConfig): string {
  if (!level) return "#F97316"; // default orange
  
  const normalizedLevel = level.toUpperCase();
  
  // If custom colors provided, use them
  if (colors) {
    return colors[normalizedLevel] || colors[level] || "#F97316";
  }
  
  // Try to match against specific scales
  if (PROBABILITY_COLORS[level]) return PROBABILITY_COLORS[level];
  if (IMPACT_COLORS[level]) return IMPACT_COLORS[level];
  if (RISK_LEVEL_COLORS[normalizedLevel]) return RISK_LEVEL_COLORS[normalizedLevel];
  if (CONTROL_FACTOR_COLORS[normalizedLevel]) return CONTROL_FACTOR_COLORS[normalizedLevel];
  
  // Fallback to default colors
  return DEFAULT_RISK_COLORS[normalizedLevel] || "#F97316";
}

/**
 * Get color for probability value
 */
export function getColorForProbability(grade: string): string {
  return PROBABILITY_COLORS[grade] || "#F97316";
}

/**
 * Get color for impact value
 */
export function getColorForImpact(grade: string): string {
  return IMPACT_COLORS[grade] || "#F97316";
}

/**
 * Get color for risk level
 */
export function getColorForRiskLevel(level: string): string {
  const normalizedLevel = level.toUpperCase();
  return RISK_LEVEL_COLORS[normalizedLevel] || "#F97316";
}

/**
 * Get color for control factor
 */
export function getColorForControlFactor(name: string): string {
  const normalizedName = name.toUpperCase();
  return CONTROL_FACTOR_COLORS[normalizedName] || "#F97316";
}
