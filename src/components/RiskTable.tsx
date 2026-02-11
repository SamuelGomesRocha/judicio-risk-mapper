import { useState } from "react";
import { RiskAnalysis } from "@/types/risk";
import { RiskColorConfig, getColorForLevel } from "@/types/risk-colors";
import { ControlLevel, getControlLevel } from "@/types/control-levels";
import { EditableCell } from "@/components/EditableCell";
import { EditableList } from "@/components/EditableList";
import { EditableControlsList } from "@/components/EditableControlsList";
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

interface RiskTableProps {
  risks: RiskAnalysis[];
  riskColors?: RiskColorConfig;
  onRisksChange?: (risks: RiskAnalysis[]) => void;
}

export const RiskTable = ({ risks, riskColors, onRisksChange }: RiskTableProps) => {
  const [localRisks, setLocalRisks] = useState(risks);

  const handleUpdateRisk = (index: number, updatedRisk: RiskAnalysis) => {
    const newRisks = [...localRisks];
    newRisks[index] = updatedRisk;
    setLocalRisks(newRisks);
    if (onRisksChange) {
      onRisksChange(newRisks);
    }
  };

  // Helper function to render control level badge
  const renderControlLevelBadge = (level: string | undefined, colors?: RiskColorConfig) => {
    if (!level) return <span className="text-muted-foreground">—</span>;
    
    const controlLevel = getControlLevel(level);
    if (!controlLevel) return <span className="text-muted-foreground">—</span>;
    
    const bgColor = colors ? getColorForLevel(level, colors) : "#F97316";
    
    return (
      <span
        className="inline-block px-3 py-1 rounded-full text-sm font-semibold text-white whitespace-nowrap"
        style={{ backgroundColor: bgColor }}
      >
        {level}
      </span>
    );
  };

  // Helper function to render control level tooltip content
  const renderControlLevelTooltip = (level: string | undefined) => {
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

  // Helper function to render level badge
  const renderLevelBadge = (level: string | undefined, colors?: RiskColorConfig) => {
    if (!level) return <span className="text-muted-foreground">—</span>;
    
    const bgColor = colors ? getColorForLevel(level, colors) : "#F97316";
    
    return (
      <span
        className="inline-block px-3 py-1 rounded-full text-sm font-semibold text-white whitespace-nowrap"
        style={{ backgroundColor: bgColor }}
      >
        {level}
      </span>
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
                  {renderLevelBadge(risk.nivel_probabilidade, riskColors)}
                </TableCell>
                <TableCell className="text-center text-xs px-2 py-2 whitespace-nowrap">
                  {renderLevelBadge(risk.nivel_impacto, riskColors)}
                </TableCell>
                <TableCell className="text-center text-xs px-2 py-2 whitespace-nowrap">
                  {renderLevelBadge(risk.nivel_risco_inerente, riskColors)}
                </TableCell>
                <TableCell className="text-xs px-2 py-2 max-w-md">
                  <EditableControlsList
                    items={risk.controles || []}
                    onSave={(items) => handleUpdateRisk(index, { ...risk, controles: items })}
                  />
                </TableCell>
                <TableCell className="text-center text-xs px-2 py-2 whitespace-nowrap">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          {renderControlLevelBadge(risk.nivel_controle, riskColors)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {renderControlLevelTooltip(risk.nivel_controle)}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="text-center text-xs px-2 py-2 whitespace-nowrap">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          {renderLevelBadge(risk.nivel_risco_residual, riskColors)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {risk.risco_residual !== undefined 
                          ? `Valor: ${risk.risco_residual.toFixed(1)}`
                          : "—"
                        }
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
