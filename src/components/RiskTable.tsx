import { useState } from "react";
import { RiskAnalysis } from "@/types/risk";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  FileWarning,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskTableProps {
  risks: RiskAnalysis[];
}

export const RiskTable = ({ risks }: RiskTableProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Análise de Riscos Identificados
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setExpandedRows(
              expandedRows.size === risks.length
                ? new Set()
                : new Set(risks.map((_, i) => i))
            )
          }
        >
          {expandedRows.size === risks.length ? "Recolher todos" : "Expandir todos"}
        </Button>
      </div>

      <div className="space-y-3">
        {risks.map((risk, index) => {
          const isExpanded = expandedRows.has(index);
          return (
            <Card
              key={index}
              className="overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              <button
                onClick={() => toggleRow(index)}
                className="w-full p-4 text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-destructive/10 text-destructive flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1 pr-8">
                      {risk["Evento de risco"]}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {risk.Causas.length} causa(s) • {risk.Consequências.length}{" "}
                      consequência(s) • {risk.Controles.length} controle(s)
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border bg-muted/20 p-4 space-y-4 animate-in slide-in-from-top-2">
                  <Section
                    title="Causas"
                    icon={FileWarning}
                    items={risk.Causas}
                    color="text-amber-600"
                    bgColor="bg-amber-50 dark:bg-amber-950/20"
                  />
                  <Section
                    title="Consequências"
                    icon={ShieldAlert}
                    items={risk.Consequências}
                    color="text-red-600"
                    bgColor="bg-red-50 dark:bg-red-950/20"
                  />
                  {risk.Controles.length > 0 && (
                    <Section
                      title="Controles"
                      icon={ShieldCheck}
                      items={risk.Controles}
                      color="text-green-600"
                      bgColor="bg-green-50 dark:bg-green-950/20"
                    />
                  )}
                  {risk.Controles.length === 0 && (
                    <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        ⚠️ Nenhum controle identificado para este risco
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

interface SectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
  color: string;
  bgColor: string;
}

const Section = ({ title, icon: Icon, items, color, bgColor }: SectionProps) => {
  return (
    <div className={cn("p-4 rounded-lg", bgColor)}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={cn("w-5 h-5", color)} />
        <h4 className={cn("font-semibold", color)}>{title}</h4>
      </div>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="text-sm text-foreground/90 flex gap-2">
            <span className={cn("font-bold", color)}>•</span>
            <span className="flex-1">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
