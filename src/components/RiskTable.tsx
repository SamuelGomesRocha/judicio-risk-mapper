import { RiskAnalysis } from "@/types/risk";
import { RiskColorConfig, getColorForLevel } from "@/types/risk-colors";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RiskTableProps {
  risks: RiskAnalysis[];
  riskColors?: RiskColorConfig;
}

export const RiskTable = ({ risks, riskColors }: RiskTableProps) => {
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
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground">
          Análise de Riscos Identificados
        </h2>
        <div className="text-sm text-muted-foreground">
          Total: {risks.length} de possíveis risco(s) identificado(s)
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-bold w-1/6">Evento de Risco</TableHead>
              <TableHead className="font-bold w-1/6">Causas</TableHead>
              <TableHead className="font-bold w-1/6">Consequências</TableHead>
              <TableHead className="font-bold text-center w-1/12">Probabilidade</TableHead>
              <TableHead className="font-bold text-center w-1/12">Impacto</TableHead>
              <TableHead className="font-bold text-center w-1/12">Risco Inerente</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {risks.map((risk, index) => (
              <TableRow key={index} className="align-top">
                <TableCell className="font-medium text-sm">
                  {risk.evento_de_risco}
                </TableCell>
                <TableCell className="text-sm">
                  <ul className="space-y-2">
                    {risk.causa.map((c, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-gray-600 font-bold flex-shrink-0">{idx + 1}.</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell className="text-sm">
                  <ul className="space-y-2">
                    {risk.consequencia.map((cons, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-black-600 font-bold flex-shrink-0">{idx + 1}.</span>
                        <span>{cons}</span>
                      </li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell className="text-center text-sm">
                  {renderLevelBadge(risk.nivel_probabilidade, riskColors)}
                </TableCell>
                <TableCell className="text-center text-sm">
                  {renderLevelBadge(risk.nivel_impacto, riskColors)}
                </TableCell>
                <TableCell className="text-center text-sm">
                  {renderLevelBadge(risk.nivel_risco_inerente, riskColors)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
