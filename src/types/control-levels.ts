/**
 * Control Levels Configuration
 * Defines the levels of control effectiveness with their descriptions and mitigation factors
 */

export interface ControlLevel {
  name: string;
  description: string;
  factor: number;
}

export const CONTROL_LEVELS: Record<string, ControlLevel> = {
  INEXISTENTE: {
    name: "INEXISTENTE",
    description: "Controles inexistentes, mal desenhados ou mal implementados, isto é, não funcionais",
    factor: 1,
  },
  FRACO: {
    name: "FRACO",
    description: "Controles com abordagens aplicadas caso a caso. A responsabilidade é individual, com elevado grau de confiança no conhecimento das pessoas",
    factor: 0.8,
  },
  MEDIANO: {
    name: "MEDIANO",
    description: "Controles implementados que mitigam alguns aspectos do risco, mas não contemplam todas as perspectivas devido a deficiências no desenho ou nas ferramentas utilizadas",
    factor: 0.6,
  },
  SATISFATÓRIO: {
    name: "SATISFATÓRIO",
    description: "Controles implementados e sustentados por ferramentas adequadas e, embora passíveis de aperfeiçoamento, mitigam satisfatoriamente o risco",
    factor: 0.4,
  },
  FORTE: {
    name: "FORTE",
    description: "Controles implementados que podem ser considerados a \"melhor prática\", que mitigam todos os aspectos relevantes do risco",
    factor: 0.2,
  },
};

/**
 * Get control level configuration by name
 */
export const getControlLevel = (name: string | undefined): ControlLevel | undefined => {
  if (!name) return undefined;
  return CONTROL_LEVELS[name.toUpperCase()];
};
