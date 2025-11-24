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
              <TableHead className="font-bold w-[25%]">Evento de Risco</TableHead>
              <TableHead className="font-bold w-[25%]">Causas</TableHead>
              <TableHead className="font-bold w-[25%]">Consequências</TableHead>
              <TableHead className="font-bold w-[25%]">Controles</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {risks.map((risk, index) => (
              <TableRow key={index} className="align-top">
                <TableCell className="font-medium">
                  {risk["Evento de risco"]}
                </TableCell>
                <TableCell>
                  <ul className="space-y-2">
                    {risk.Causas.map((causa, idx) => (
                      <li key={idx} className="text-sm flex gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{causa}</span>
                      </li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>
                  <ul className="space-y-2">
                    {risk.Consequências.map((consequencia, idx) => (
                      <li key={idx} className="text-sm flex gap-2">
                        <span className="text-red-600 font-bold">•</span>
                        <span>{consequencia}</span>
                      </li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>
                  {risk.Controles.length > 0 ? (
                    <ul className="space-y-2">
                      {risk.Controles.map((controle, idx) => (
                        <li key={idx} className="text-sm flex gap-2">
                          <span className="text-green-600 font-bold">•</span>
                          <span>{controle}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-sm text-yellow-600 italic">
                      ⚠️ Nenhum controle identificado
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
