import { useState } from "react";
import { RiskAnalysis } from "@/types/risk";
import { RiskColorConfig, getColorForLevel } from "@/types/risk-colors";
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
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-bold text-left px-4 py-3">Evento de Risco</TableHead>
              <TableHead className="font-bold text-left px-4 py-3">Causas</TableHead>
              <TableHead className="font-bold text-left px-4 py-3">Consequências</TableHead>
              <TableHead className="font-bold text-center px-4 py-3">Probabilidade</TableHead>
              <TableHead className="font-bold text-center px-4 py-3">Impacto</TableHead>
              <TableHead className="font-bold text-center px-4 py-3">Risco Inerente</TableHead>
              <TableHead className="font-bold text-left px-4 py-3">Controles</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localRisks.map((risk, index) => (
              <TableRow key={index} className="align-top">
                <TableCell className="font-medium text-sm px-4 py-3">
                  <EditableCell
                    value={risk.evento_de_risco}
                    onSave={(value) => handleUpdateRisk(index, { ...risk, evento_de_risco: value })}
                  />
                </TableCell>
                <TableCell className="text-sm px-4 py-3">
                  <EditableList
                    items={risk.causa}
                    onSave={(items) => handleUpdateRisk(index, { ...risk, causa: items })}
                  />
                </TableCell>
                <TableCell className="text-sm px-4 py-3">
                  <EditableList
                    items={risk.consequencia}
                    onSave={(items) => handleUpdateRisk(index, { ...risk, consequencia: items })}
                  />
                </TableCell>
                <TableCell className="text-center text-sm px-4 py-3">
                  {renderLevelBadge(risk.nivel_probabilidade, riskColors)}
                </TableCell>
                <TableCell className="text-center text-sm px-4 py-3">
                  {renderLevelBadge(risk.nivel_impacto, riskColors)}
                </TableCell>
                <TableCell className="text-center text-sm px-4 py-3">
                  {renderLevelBadge(risk.nivel_risco_inerente, riskColors)}
                </TableCell>
                <TableCell className="text-sm px-4 py-3">
                  <EditableControlsList
                    items={risk.controles || []}
                    onSave={(items) => handleUpdateRisk(index, { ...risk, controles: items })}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
