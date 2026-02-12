/**
 * Risk Assessment Scales Configuration
 * Defines probability levels, impact levels, and control factors with their numeric values
 */

/**
 * Probability Scale - values from 2 to 10
 */
export interface ProbabilityLevel {
  value: number; // 2, 4, 6, 8, 10
  grade: string; // "1: MUITO BAIXA", "2: BAIXA", etc.
  description: string;
}

export const PROBABILITY_LEVELS: ProbabilityLevel[] = [
  {
    value: 2,
    grade: "1: MUITO BAIXA",
    description: "Evento extraordinário, sem histórico de ocorrência.",
  },
  {
    value: 4,
    grade: "2: BAIXA",
    description: "Evento casual e inesperado, sem histórico de ocorrência.",
  },
  {
    value: 6,
    grade: "3: MÉDIA",
    description:
      "Evento esperado, de frequência reduzida, e com histórico de ocorrência conhecido pela maioria dos gestores e operadores do processo.",
  },
  {
    value: 8,
    grade: "4: ALTA",
    description: "Evento usual, com histórico de ocorrência amplamente conhecido.",
  },
  {
    value: 10,
    grade: "5: MUITO ALTA",
    description: "Evento repetitivo e constante.",
  },
];

/**
 * Impact Scale - values from 2 to 10
 */
export interface ImpactLevel {
  value: number; // 2, 4, 6, 8, 10
  grade: string; // "1: INSIGNIFICANTE", "2: POUCO RELEVANTE", etc.
  description: string;
}

export const IMPACT_LEVELS: ImpactLevel[] = [
  {
    value: 2,
    grade: "1: INSIGNIFICANTE",
    description: "Impacto nulo ou insignificante nos objetivos.",
  },
  {
    value: 4,
    grade: "2: POUCO RELEVANTE",
    description: "Impacto mínimo nos objetivos.",
  },
  {
    value: 6,
    grade: "3: RELEVANTE",
    description:
      "Impacto mediano nos objetivos, com possibilidade de recuperação no caso de consequências negativas.",
  },
  {
    value: 8,
    grade: "4: MUITO RELEVANTE",
    description:
      "Impacto significante nos objetivos, com possibilidade remota de recuperação no caso de consequências negativas.",
  },
  {
    value: 10,
    grade: "5: EXTREMO",
    description:
      "Impacto máximo nos objetivos, sem possibilidade de recuperação no caso de consequências negativas.",
  },
];

/**
 * Control Factor Scale - ranges from 0.2 (FORTE) to 1 (INEXISTENTE)
 * Lower values = stronger controls = better (more positive)
 */
export interface ControlFactorLevel {
  name: string; // "INEXISTENTE", "FRACO", "MEDIANO", "SATISFATÓRIO", "FORTE"
  factor: number; // 1.0, 0.8, 0.6, 0.4, 0.2
  description: string;
}

export const CONTROL_FACTOR_LEVELS: ControlFactorLevel[] = [
  {
    name: "INEXISTENTE",
    factor: 1.0,
    description:
      "Controles inexistentes, mal desenhados ou mal implementados, isto é, não funcionais",
  },
  {
    name: "FRACO",
    factor: 0.8,
    description:
      "Controles com abordagens aplicadas caso a caso. A responsabilidade é individual, com elevado grau de confiança no conhecimento das pessoas",
  },
  {
    name: "MEDIANO",
    factor: 0.6,
    description:
      "Controles implementados que mitigam alguns aspectos do risco, mas não contemplam todas as perspectivas devido a deficiências no desenho ou nas ferramentas utilizadas",
  },
  {
    name: "SATISFATÓRIO",
    factor: 0.4,
    description:
      "Controles implementados e sustentados por ferramentas adequadas e, embora passíveis de aperfeiçoamento, mitigam satisfatoriamente o risco",
  },
  {
    name: "FORTE",
    factor: 0.2,
    description:
      "Controles implementados que podem ser considerados a 'melhor prática', que mitigam todos os aspectos relevantes do risco",
  },
];

/**
 * Risk Level Ranges - classification based on calculated risk value
 */
export interface RiskLevelRange {
  level: string;
  minValue: number;
  maxValue: number;
}

export const RISK_LEVEL_RANGES: RiskLevelRange[] = [
  { level: "EXTREMO", minValue: 49, maxValue: 100 },
  { level: "ALTO", minValue: 25, maxValue: 48 },
  { level: "MÉDIO", minValue: 9, maxValue: 24 },
  { level: "BAIXO", minValue: 1, maxValue: 8 },
];

/**
 * Helper function to get the risk level based on numeric value
 */
export const getRiskLevelFromValue = (value: number): string => {
  const range = RISK_LEVEL_RANGES.find((r) => value >= r.minValue && value <= r.maxValue);
  return range?.level || "DESCONHECIDO";
};

/**
 * Helper function to find probability level by value
 */
export const getProbabilityLevelByValue = (value: number): ProbabilityLevel | undefined => {
  return PROBABILITY_LEVELS.find((level) => level.value === value);
};

/**
 * Helper function to find impact level by value
 */
export const getImpactLevelByValue = (value: number): ImpactLevel | undefined => {
  return IMPACT_LEVELS.find((level) => level.value === value);
};

/**
 * Helper function to find control factor level by name
 */
export const getControlFactorLevelByName = (name: string): ControlFactorLevel | undefined => {
  return CONTROL_FACTOR_LEVELS.find((level) => level.name.toUpperCase() === name.toUpperCase());
};

/**
 * Helper function to get grade label from probability value
 */
export const getProbabilityGradeLabel = (value: number): string => {
  const level = getProbabilityLevelByValue(value);
  return level?.grade || "—";
};

/**
 * Helper function to get grade label from impact value
 */
export const getImpactGradeLabel = (value: number): string => {
  const level = getImpactLevelByValue(value);
  return level?.grade || "—";
};
