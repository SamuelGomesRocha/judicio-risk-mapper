import { useState } from "react";
import { RiskAnalysis } from "@/types/risk";
import { getColorForLevel, getColorForRiskLevel } from "@/types/risk-colors";
import { getControlLevel } from "@/types/control-levels";
import { EditableCell } from "@/components/EditableCell";
import { EditableList } from "@/components/EditableList";
import { EditableControlsList } from "@/components/EditableControlsList";
import { EditableProbability } from "@/components/EditableProbability";
import { EditableImpact } from "@/components/EditableImpact";
import { EditableControlFactor } from "@/components/EditableControlFactor";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  calculateInherentRisk,
  calculateResidualRisk,
  getProbabilityLevelLabel,
  getImpactLevelLabel,
} from "@/lib/riskCalculations";

interface RiskTableProps {
  risks: RiskAnalysis[];
  onRisksChange?: (risks: RiskAnalysis[]) => void;
}

export const RiskTable = ({ risks, onRisksChange }: RiskTableProps) => {
  const [localRisks, setLocalRisks] = useState(risks);

  /**
   * Handle risk updates with automatic calculation of derived fields
   */
  const handleUpdateRisk = (index: number, updatedRisk: RiskAnalysis) => {
    // Calculate inherent risk if probability or impact changed
    if (updatedRisk.probabilidade !== undefined && updatedRisk.impacto !== undefined) {
      const inheritRisk = calculateInherentRisk(updatedRisk.probabilidade, updatedRisk.impacto);
      if (inheritRisk) {
        updatedRisk.risco_inerente = inheritRisk.value;
        updatedRisk.nivel_risco_inerente = inheritRisk.level;
      }
    }

    // Calculate residual risk if inherent risk or control factor changed
    if (updatedRisk.risco_inerente !== undefined && updatedRisk.nivel_controle) {
      const residualRisk = calculateResidualRisk(
        updatedRisk.risco_inerente,
        updatedRisk.nivel_controle
      );
      if (residualRisk) {
        updatedRisk.risco_residual = residualRisk.value;
        updatedRisk.nivel_risco_residual = residualRisk.level;
      }
    }

    const newRisks = [...localRisks];
    newRisks[index] = updatedRisk;
    setLocalRisks(newRisks);
    if (onRisksChange) {
      onRisksChange(newRisks);
    }
  };

  /**
   * Handle probability change
   */
  const handleProbabilityChange = (index: number, value: number) => {
    const risk = localRisks[index];
    handleUpdateRisk(index, {
      ...risk,
      probabilidade: value,
      nivel_probabilidade: getProbabilityLevelLabel(value),
    });
  };

  /**
   * Handle impact change
   */
  const handleImpactChange = (index: number, value: number) => {
    const risk = localRisks[index];
    handleUpdateRisk(index, {
      ...risk,
      impacto: value,
      nivel_impacto: getImpactLevelLabel(value),
    });
  };

  /**
   * Handle control factor change
   */
  const handleControlFactorChange = (index: number, name: string, factor: number) => {
    const risk = localRisks[index];
    handleUpdateRisk(index, {
      ...risk,
      nivel_controle: name,
    });
  };

  /**
   * Render a color-coded level badge
   */
  const renderLevelBadge = (level: string | undefined, isRiskLevel: boolean = false) => {
    if (!level) return <span className="text-muted-foreground">—</span>;

    const bgColor = isRiskLevel ? getColorForRiskLevel(level) : getColorForLevel(level);

    return (
      <span
        className="inline-block px-3 py-1 rounded-full text-sm font-semibold text-white whitespace-nowrap"
        style={{ backgroundColor: bgColor }}
      >
        {level}
      </span>
    );
  };

  /**
   * Render control factor badge with tooltip
   */
  const renderControlFactorBadge = (level: string | undefined) => {
    if (!level) return <span className="text-muted-foreground">—</span>;

    const controlLevel = getControlLevel(level);
    if (!controlLevel) return <span className="text-muted-foreground">—</span>;

    const bgColor = getColorForLevel(level);

    return (
      <span
        className="inline-block px-3 py-1 rounded-full text-sm font-semibold text-white whitespace-nowrap"
        style={{ backgroundColor: bgColor }}
      >
        {level}
      </span>
    );
  };

  /**
   * Render control factor tooltip content
   */
  const renderControlFactorTooltip = (level: string | undefined) => {
    if (!level) return "—";

    const controlLevel = getControlLevel(level);
    if (!controlLevel) return "—";

    return (
      <div className="max-w-xs">
        <p className="font-semibold mb-1">{controlLevel.name}</p>
        <p className="text-xs">{controlLevel.description}</p>
        <p className="text-xs mt-2">
          <span className="font-semibold">Fator:</span> {controlLevel.factor}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground">
          Análise de Riscos Identificados
        </h2>
        <div className="text-sm text-muted-foreground">
          Total: {localRisks.length} de possíveis risco(s) identificado(s)
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card w-full">
        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-bold text-left px-2 py-2 text-xs whitespace-nowrap">Evento de Risco</TableHead>
              <TableHead className="font-bold text-left px-2 py-2 text-xs whitespace-nowrap">Causas</TableHead>
              <TableHead className="font-bold text-left px-2 py-2 text-xs whitespace-nowrap">Consequências</TableHead>
              <TableHead className="font-bold text-center px-2 py-2 text-xs whitespace-nowrap">Probabilidade</TableHead>
              <TableHead className="font-bold text-center px-2 py-2 text-xs whitespace-nowrap">Impacto</TableHead>
              <TableHead className="font-bold text-center px-2 py-2 text-xs whitespace-nowrap">Risco Inerente</TableHead>
              <TableHead className="font-bold text-left px-2 py-2 text-xs whitespace-nowrap">Controles</TableHead>
              <TableHead className="font-bold text-center px-2 py-2 text-xs whitespace-nowrap">Fator de Controle</TableHead>
              <TableHead className="font-bold text-center px-2 py-2 text-xs whitespace-nowrap">Nível de Risco Residual</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localRisks.map((risk, index) => (
              <TableRow key={index} className="align-top">
                <TableCell className="font-medium text-xs px-2 py-2 max-w-xs">
                  <EditableCell
                    value={risk.evento_de_risco}
                    onSave={(value) => handleUpdateRisk(index, { ...risk, evento_de_risco: value })}
                  />
                </TableCell>
                <TableCell className="text-xs px-2 py-2 max-w-sm">
                  <EditableList
                    items={risk.causa}
                    onSave={(items) => handleUpdateRisk(index, { ...risk, causa: items })}
                  />
                </TableCell>
                <TableCell className="text-xs px-2 py-2 max-w-sm">
                  <EditableList
                    items={risk.consequencia}
                    onSave={(items) => handleUpdateRisk(index, { ...risk, consequencia: items })}
                  />
                </TableCell>
                <TableCell className="text-center text-xs px-2 py-2 whitespace-nowrap">
                  <EditableProbability
                    value={risk.probabilidade}
                    onSave={(value) => handleProbabilityChange(index, value)}
                  />
                </TableCell>
                <TableCell className="text-center text-xs px-2 py-2 whitespace-nowrap">
                  <EditableImpact
                    value={risk.impacto}
                    onSave={(value) => handleImpactChange(index, value)}
                  />
                </TableCell>
                <TableCell className="text-center text-xs px-2 py-2 whitespace-nowrap">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          {renderLevelBadge(risk.nivel_risco_inerente, true)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {risk.risco_inerente !== undefined
                          ? `Valor: ${risk.risco_inerente.toFixed(1)}`
                          : "Selecione probabilidade e impacto"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="text-xs px-2 py-2 max-w-md">
                  <EditableControlsList
                    items={risk.controles || []}
                    onSave={(items) => handleUpdateRisk(index, { ...risk, controles: items })}
                  />
                </TableCell>
                <TableCell className="text-center text-xs px-2 py-2 whitespace-nowrap">
                  <EditableControlFactor
                    value={risk.nivel_controle}
                    onSave={(name, factor) => handleControlFactorChange(index, name, factor)}
                  />
                </TableCell>
                <TableCell className="text-center text-xs px-2 py-2 whitespace-nowrap">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          {renderLevelBadge(risk.nivel_risco_residual, true)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {risk.risco_residual !== undefined
                          ? `Valor: ${risk.risco_residual.toFixed(1)}`
                          : "Selecione fator de controle"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
