/**
 * Risk Calculation Utilities
 * Handles all calculations related to inherent risk and residual risk
 */

import {
  getRiskLevelFromValue,
  getProbabilityLevelByValue,
  getImpactLevelByValue,
  getControlFactorLevelByName,
} from "@/types/scales";

/**
 * Calculate Inherent Risk
 * Formula: Inherent Risk = Probability × Impact
 */
export const calculateInherentRisk = (
  probability: number | undefined,
  impact: number | undefined
): { value: number; level: string } | null => {
  if (probability === undefined || impact === undefined) {
    return null;
  }

  const value = probability * impact;
  const level = getRiskLevelFromValue(value);

  return { value, level };
};

/**
 * Calculate Residual Risk
 * Formula: Residual Risk = Inherent Risk × Control Factor
 */
export const calculateResidualRisk = (
  inheritRiskValue: number | undefined,
  controlFactorName: string | undefined
): { value: number; level: string } | null => {
  if (inheritRiskValue === undefined || !controlFactorName) {
    return null;
  }

  const controlFactor = getControlFactorLevelByName(controlFactorName);
  if (!controlFactor) {
    return null;
  }

  const value = inheritRiskValue * controlFactor.factor;
  const level = getRiskLevelFromValue(value);

  return { value, level };
};

/**
 * Calculate derived risk metrics from input values
 * Returns all calculated metrics
 */
export const calculateRiskMetrics = (
  probability: number | undefined,
  impact: number | undefined,
  controlFactor: string | undefined
) => {
  const inheritRisk = calculateInherentRisk(probability, impact);
  const residualRisk = inheritRisk
    ? calculateResidualRisk(inheritRisk.value, controlFactor)
    : null;

  return {
    inheritRisk,
    residualRisk,
  };
};

/**
 * Get display label for a numeric probability level
 */
export const getProbabilityLevelLabel = (value: number | undefined): string => {
  if (value === undefined) return "—";
  const level = getProbabilityLevelByValue(value);
  return level?.grade || "—";
};

/**
 * Get display label for a numeric impact level
 */
export const getImpactLevelLabel = (value: number | undefined): string => {
  if (value === undefined) return "—";
  const level = getImpactLevelByValue(value);
  return level?.grade || "—";
};
