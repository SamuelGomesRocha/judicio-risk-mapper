import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { RiskTable } from "@/components/RiskTable";
import { RiskAssessmentDisclaimer } from "@/components/RiskAssessmentDisclaimer";
import { ScalesModal } from "@/components/ScalesModal";
import { EvaluationModal } from "@/components/EvaluationModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import { RiskAnalysis, RiskAnalysisResponse, RiskItem, EvaluationPayload } from "@/types/risk";
import { ConfigSettings } from "@/types/config";
import { useEvaluationSubmit } from "@/hooks/use-risk-items-loader";
import { toast } from "sonner";

/**
 * Generate mock risk items from risks for development/testing
 * This allows the UI to work without backend API
 */
function generateMockRiskItems(risks: RiskAnalysis[], analysisId: string): RiskItem[] {
  const items: RiskItem[] = [];
  let id = 1;
  
  risks.forEach((risk) => {
    // Evento
    items.push({
      id: crypto.randomUUID(),
      field_type: "evento",
      content: risk.evento_de_risco,
      analysis_id: analysisId,
    });
    id++;
    
    // Causas
    risk.causa.forEach((causa) => {
      items.push({
        id: crypto.randomUUID(),
        field_type: "causa",
        content: causa,
        analysis_id: analysisId,
      });
      id++;
    });
    
    // Consequências
    risk.consequencia.forEach((consequencia) => {
      items.push({
        id: crypto.randomUUID(),
        field_type: "consequencia",
        content: consequencia,
        analysis_id: analysisId,
      });
      id++;
    });
    
    // Controles
    if (risk.controles) {
      risk.controles.forEach((controle) => {
        items.push({
          id: crypto.randomUUID(),
          field_type: "controle",
          content: `${controle.nome}${controle.detalhe ? ` - ${controle.detalhe}` : ""}`,
          analysis_id: analysisId,
        });
        id++;
      });
    }
  });
  
  return items;
}

// Mock data - será substituído pelos dados reais da API
const MOCK_DATA: RiskAnalysisResponse = {
  analysis_id: "mock-analysis-id-12345",
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
      ],
      probabilidade: 6,
      nivel_probabilidade: "3: MÉDIA",
      impacto: 8,
      nivel_impacto: "4: MUITO RELEVANTE",
      risco_inerente: 48,
      nivel_risco_inerente: "ALTO",
      nivel_controle: "MEDIANO",
      risco_residual: 28.8,
      nivel_risco_residual: "ALTO"
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
      ],
      probabilidade: 8,
      nivel_probabilidade: "4: ALTA",
      impacto: 10,
      nivel_impacto: "5: EXTREMO",
      risco_inerente: 80,
      nivel_risco_inerente: "EXTREMO",
      nivel_controle: "FRACO",
      risco_residual: 64,
      nivel_risco_residual: "EXTREMO"
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
  const { project_name, objectives, risks, processed_files, analysis_id } = analysisData;
  
  // Estado para avaliação de qualidade (ARES)
  const [riskItems, setRiskItems] = useState<RiskItem[] | null>(null);
  const [evaluatedItemIds, setEvaluatedItemIds] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<RiskItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  
  // Carregar config da API para fazer requests de forma síncrona
  // Evita condição de corrida onde o fetch roda com config nulo
  const [config, setConfig] = useState<ConfigSettings | null>(() => {
    try {
      const configStr = localStorage.getItem("app_config");
      return configStr ? (JSON.parse(configStr) as ConfigSettings) : null;
    } catch {
      return null;
    }
  });
  
  // Hook para submeter avaliações
  const { submit: submitEvaluation } = useEvaluationSubmit(
    config || { url: "", username: "", password: "", riskLevels: [], riskColors: [] }
  );
  
  // Buscar risk_items quando analysis_id muda
  useEffect(() => {
    if (!analysis_id) return;
    
    const fetchRiskItems = async () => {
      try {
        setIsLoadingItems(true);
        const cacheKey = `risk_items_v3_${analysis_id}`;
        
        // Tentar cache primeiro
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const parsedCache = JSON.parse(cached) as RiskItem[];
            setRiskItems(parsedCache);
            return;
          } catch (e) {
            console.warn("Failed to parse cached risk items");
          }
        }
        
        // Se config existe, tentar buscar do backend
        if (config) {
          try {
            const authHeader = btoa(`${config.username}:${config.password}`);
            const baseUrl = config.url.replace(/\/ingestion\/?$/, "");
            const response = await fetch(
              `${baseUrl}/analyses/${analysis_id}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Basic ${authHeader}`,
                  "Content-Type": "application/json",
                  "bypass-tunnel-reminder": "true",
                },
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              const items: RiskItem[] = data.risk_items || [];
              
              if (items.length > 0) {
                localStorage.setItem(cacheKey, JSON.stringify(items));
                setRiskItems(items);
                return;
              }
            }
          } catch (error) {
            console.warn("Failed to fetch risk items from backend, using mock data", error);
          }
        }
        
        // Fallback: usar mock items para desenvolvimento
        const mockItems = generateMockRiskItems(risks, analysis_id);
        // Não salvamos os Mocks no localStorage para não envenenar o cache de itens reais
        setRiskItems(mockItems);
        
      } catch (error) {
        console.error("Error loading risk items:", error);
        toast.error("Erro ao carregar itens para avaliação");
      } finally {
        setIsLoadingItems(false);
      }
    };
    
    fetchRiskItems();
  }, [analysis_id, config, risks]);
  
  // Handler para abrir modal de avaliação
  const handleOpenEvaluationModal = (item: RiskItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };
  
  // Handler para fechar modal
  const handleCloseEvaluationModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };
  
  // Handler para submeter avaliação
  const handleSubmitEvaluation = async (evaluation: EvaluationPayload) => {
    try {
      await submitEvaluation(evaluation);
      // Marcar item como avaliado no estado local
      setEvaluatedItemIds(prev => new Set([...prev, evaluation.risk_item_id]));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao salvar avaliação";
      throw new Error(errorMessage);
    }
  };

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

        <RiskTable 
          risks={risks} 
          riskItems={riskItems}
          evaluatedItemIds={evaluatedItemIds}
          onEvaluateItem={handleOpenEvaluationModal}
        />

        <RiskAssessmentDisclaimer />
      </main>
      
      {/* Evaluation Modal */}
      <EvaluationModal
        isOpen={isModalOpen}
        item={selectedItem}
        onClose={handleCloseEvaluationModal}
        onSubmit={handleSubmitEvaluation}
      />
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
