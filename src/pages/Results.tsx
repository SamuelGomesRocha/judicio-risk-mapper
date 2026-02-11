import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { RiskTable } from "@/components/RiskTable";
import { RiskAssessmentDisclaimer } from "@/components/RiskAssessmentDisclaimer";
import { ScalesModal } from "@/components/ScalesModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import { RiskAnalysis, RiskAnalysisResponse } from "@/types/risk";
import { RiskColorConfig, DEFAULT_RISK_COLORS } from "@/types/risk-colors";

// Mock data - será substituído pelos dados reais da API
const MOCK_DATA: RiskAnalysisResponse = {
  status: "success",
  project_name: "Nome do projeto a ser aplicado | MOCK DATA - Em produção, esta lista será gerada dinamicamente com base nos objetivos extraídos pela API",
  objectives: [
    "MOCK DATA - Em produção, esta lista será gerada dinamicamente com base nos objetivos extraídos pela API",
    "Garantir alta performance e escalabilidade na infraestrutura de armazenamento de dados para suportar o crescimento estimado para os próximos 05 anos.",
    "Mitigar o risco de indisponibilidade e perda de dados devido à saturação da capacidade e ao fim do suporte do equipamento atual.",
    "Melhorar o desempenho e a disponibilidade dos sistemas críticos do TJGO, como Projudi/PJD e bancos de dados.",
    "Aumentar a segurança cibernética e a proteção de dados sensíveis através de uma infraestrutura moderna e resiliente.",
    "Otimizar a experiência do usuário final, garantindo acessos mais rápidos e eficientes aos sistemas e dados."
  ],
  risks: [
    {
      causa: [
        "Arquitetura do equipamento com capacidade de processamento insuficiente para a carga de trabalho institucional",
        "Adição de novos discos implicando aumento da carga de I/O gerenciada pelas controladoras"
      ],
      evento_de_risco: "Saturação do processamento das controladoras do novo storage.",
      consequencia: [
        "Degradação do desempenho geral do sistema",
        "Aumento inaceitável da latência",
        "Comprometimento dos serviços prestados a servidores, magistrados e usuários externos",
        "Incapacidade de absorver o aumento da carga de trabalho institucional",
        "Incapacidade de prover a baixa latência requerida pelos sistemas de missão crítica"
      ]
    },
    {
      causa: [
        "Aquisição de um modelo de storage com as mesmas características técnicas do atual, sem resolver o gargalo estrutural de desempenho",
        "Arquitetura de nuvem inerentemente adiciona latência devido à distância física e à pilha de rede"
      ],
      evento_de_risco: "Falha na garantia de baixa latência e alto IOPS para sistemas de missão crítica.",
      consequencia: [
        "Latência inaceitável para bancos de dados",
        "Risco à missão crítica dos sistemas judiciais (PROJUDI, PJD)",
        "Comprometimento do funcionamento de aplicações",
        "Risco de perda de dados"
      ]
    }
  ],
  processed_files: [
    "MOCK DATA - Em produção, esta lista será gerada dinamicamente com base nos arquivos processados pela API",
    "1. Documento de Oficializacao da Demanda.pdf",
    "2. Estudo Tecnico Preliminar.pdf",
    "3. Termo de Referencia.pdf "
  ]
};

export default function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Em produção, você pegaria os dados do location.state
  const analysisData = location.state?.analysisData || MOCK_DATA;
  const riskColors = location.state?.riskColors || DEFAULT_RISK_COLORS;
  const { project_name, objectives, risks, processed_files } = analysisData;

  const handleExport = () => {
    // Implementar exportação para CSV ou Excel
    const csvContent = generateCSV(risks);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `analise_riscos____${project_name.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Header />
      
      <main className="mx-auto px-4 py-8 w-full">
        <div className="flex items-center justify-between mb-6 gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Nova Análise
          </Button>
          
          <div className="flex items-center gap-2">
            <ScalesModal />
            <Button
              variant="secondary"
              onClick={handleExport}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar Resultados
            </Button>
          </div>
        </div>

        {/* Project Metadata Section */}
        <Card className="mb-8 p-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{project_name}</h1>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Objetivos do Projeto</h2>
              <ul className="space-y-2">
                {objectives.map((objective, idx) => (
                  <li key={idx} className="flex gap-3 text-sm">
                    <span className="text-blue-600 font-bold mt-0.5 flex-shrink-0">•</span>
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {processed_files && processed_files.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Documentos Processados</h3>
                <ul className="space-y-1">
                  {processed_files.map((file, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground">{file}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>

        <RiskTable risks={risks} riskColors={riskColors} />

        <RiskAssessmentDisclaimer />
      </main>
    </div>
  );
}

function generateCSV(risks: RiskAnalysis[]): string {
  const headers = ["Evento de Risco", "Causa", "Consequência", "Probabilidade", "Impacto", "Risco Inerente", "Controles", "Referências de Controles"];
  const rows = risks.map(risk => {
    const controleNomes = risk.controles?.map(c => c.nome).join(" | ") || "";
    const controleDetalhes = risk.controles?.map(c => c.detalhe).join(" | ") || "";
    return [
      risk.evento_de_risco,
      risk.causa.join(" | "),
      risk.consequencia.join(" | "),
      risk.probabilidade || "",
      risk.impacto || "",
      risk.risco_inerente || "",
      controleNomes,
      controleDetalhes
    ];
  });

  const csvRows = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
  ];

  return csvRows.join("\n");
}
