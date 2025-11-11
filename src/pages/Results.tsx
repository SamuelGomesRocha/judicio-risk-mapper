import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { RiskTable } from "@/components/RiskTable";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { RiskAnalysis } from "@/types/risk";

// Mock data - será substituído pelos dados reais da API
const MOCK_DATA: RiskAnalysis[] = [
  {
    "Causas": [
      "Ausência de informações detalhadas sobre o objeto da contratação no DOD."
    ],
    "Evento de risco": "Dificuldade em definir claramente os requisitos e escopo da contratação.",
    "Consequências": [
      "Seleção inadequada de fornecedores, risco de aditivos contratuais por escopo mal definido, e potencial de entrega de um produto/serviço que não atende integralmente às necessidades do TJGO."
    ],
    "Controles": [
      "Revisão e validação detalhada do Documento de Oficialização das Demandas (DOD) por equipe multidisciplinar antes da elaboração do Termo de Referência (TR) ou Projeto Básico (PB);",
      "Realização de reuniões de alinhamento com as áreas demandantes para detalhar as necessidades, objetivos e entregas esperadas do objeto da contratação, registrando formalmente as decisões;"
    ]
  },
  {
    "Causas": [
      "Falta de detalhamento sobre a necessidade específica e a justificativa para a contratação no ETP."
    ],
    "Evento de risco": "Incerteza sobre o real valor agregado da contratação e sua aderência aos objetivos estratégicos do TJGO.",
    "Consequências": [
      "Possível contratação de solução subutilizada ou redundante, desperdício de recursos públicos e oportunidade perdida para otimizar processos."
    ],
    "Controles": []
  }
];

export default function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Em produção, você pegaria os dados do location.state
  const risks = location.state?.risks || MOCK_DATA;

  const handleExport = () => {
    // Implementar exportação para CSV ou Excel
    const csvContent = generateCSV(risks);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "analise_riscos.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Nova Análise
          </Button>
          
          <Button
            variant="secondary"
            onClick={handleExport}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar Resultados
          </Button>
        </div>

        <RiskTable risks={risks} />
      </main>
    </div>
  );
}

function generateCSV(risks: RiskAnalysis[]): string {
  const headers = ["Evento de Risco", "Causas", "Consequências", "Controles"];
  const rows = risks.map(risk => [
    risk["Evento de risco"],
    risk.Causas.join(" | "),
    risk.Consequências.join(" | "),
    risk.Controles.join(" | ")
  ]);

  const csvRows = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ];

  return csvRows.join("\n");
}
