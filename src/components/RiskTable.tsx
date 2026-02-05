import { RiskAnalysis } from "@/types/risk";
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
}

export const RiskTable = ({ risks }: RiskTableProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground">
          Análise de Riscos Identificados
        </h2>
        <div className="text-sm text-muted-foreground">
          Total: {risks.length} risco(s) identificado(s)
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-bold w-1/3">Evento de Risco</TableHead>
              <TableHead className="font-bold w-1/3">Causas</TableHead>
              <TableHead className="font-bold w-1/3">Consequências</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {risks.map((risk, index) => (
              <TableRow key={index} className="align-top">
                <TableCell className="font-medium">
                  {risk.evento_de_risco}
                </TableCell>
                <TableCell>
                  <div className="text-sm flex gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{risk.causa}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm flex gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>{risk.consequencia}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
