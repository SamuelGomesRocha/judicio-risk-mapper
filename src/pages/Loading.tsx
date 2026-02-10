import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { LoadingScreen } from "@/components/LoadingScreen";
import { RiskAssessmentDisclaimer } from "@/components/RiskAssessmentDisclaimer";
import { API_CONFIG } from "@/config/api";
import { RiskAnalysisResponse } from "@/types/risk";
import { ConfigSettings } from "@/types/config";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface LogEntry {
  timestamp: string;
  type: 'info' | 'error' | 'success';
  message: string;
  details?: any;
}

export default function LoadingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [hasError, setHasError] = useState(false);

  const addLog = (type: LogEntry['type'], message: string, details?: any) => {
    const timestamp = new Date().toISOString();
    setLogs(prev => [...prev, { timestamp, type, message, details }]);
    console.log(`[${timestamp}] [${type.toUpperCase()}]`, message, details || '');
  };

  useEffect(() => {
    const filesData = location.state?.files;
    const configData = location.state?.config as ConfigSettings | undefined;

    if (!filesData || !filesData.dod || !filesData.etp || !filesData.tr) {
      addLog('error', 'Arquivos não encontrados');
      toast.error("Arquivos não encontrados. Redirecionando...");
      navigate("/");
      return;
    }

    const submitToWebhook = async () => {
      const startTime = Date.now();
      
      try {
        addLog('info', 'Iniciando processo de envio de documentos');
        
        // Log dos arquivos
        addLog('info', 'Arquivos detectados', {
          dod: { name: filesData.dod.name, size: `${(filesData.dod.size / 1024).toFixed(2)} KB`, type: filesData.dod.type },
          etp: { name: filesData.etp.name, size: `${(filesData.etp.size / 1024).toFixed(2)} KB`, type: filesData.etp.type },
          tr: { name: filesData.tr.name, size: `${(filesData.tr.size / 1024).toFixed(2)} KB`, type: filesData.tr.type }
        });
        
        // Usar configuração do state ou carregar do localStorage
        let apiConfig = configData;
        
        if (!apiConfig) {
          addLog('info', 'Carregando configuração do localStorage');
          const configStr = localStorage.getItem("app_config");
          if (!configStr) {
            addLog('error', 'Configuração não encontrada no localStorage');
            toast.error("Configuração não encontrada. Configure a aplicação antes de enviar.");
            navigate("/");
            return;
          }
          apiConfig = JSON.parse(configStr);
        }
        
        addLog('info', 'Configuração carregada com sucesso', {
          url: apiConfig.url,
          username: apiConfig.username,
          hasPassword: !!apiConfig.password,
          riskLevelsCount: apiConfig.riskLevels.length
        });
        
        // Criar FormData com os arquivos
        addLog('info', 'Preparando FormData com os arquivos');
        const formData = new FormData();
        formData.append("dod", filesData.dod);
        formData.append("etp", filesData.etp);
        formData.append("tr", filesData.tr);
        
        // Adicionar configuração de escalas de risco
        formData.append("risk_scales", JSON.stringify({
          levels: apiConfig.riskLevels,
          timestamp: new Date().toISOString()
        }));
        
        addLog('info', 'FormData preparado com 3 arquivos + configuração de escalas');

        // Log completo da requisição
        const requestDetails = {
          url: apiConfig.url,
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${apiConfig.username}:${apiConfig.password}`)}`,
            'bypass-tunnel-reminder': 'true'
          },
          bodyType: 'multipart/form-data',
          files: {
            dod: filesData.dod.name,
            etp: filesData.etp.name,
            tr: filesData.tr.name
          },
          riskScales: apiConfig.riskLevels
        };
        addLog('info', 'Detalhes completos da requisição POST', requestDetails);

        addLog('info', `Enviando requisição POST para ${apiConfig.url}`);
        const fetchStartTime = Date.now();

        const response = await fetch(apiConfig.url, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${apiConfig.username}:${apiConfig.password}`)}`,
            'bypass-tunnel-reminder': 'true'
            // IMPORTANTE: Sem Content-Type - o navegador define automaticamente com boundary
          },
          body: formData,
        });

        const fetchDuration = Date.now() - fetchStartTime;
        addLog('info', `Resposta recebida em ${(fetchDuration / 1000).toFixed(2)}s`, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            contentType: response.headers.get('content-type'),
            contentLength: response.headers.get('content-length')
          }
        });

        if (!response.ok) {
          const errorBody = await response.text();
          addLog('error', `Erro HTTP ${response.status}: ${response.statusText}`, {
            responseBody: errorBody.substring(0, 500)
          });
          throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
        }

        addLog('info', 'Processando resposta JSON');
        const responseText = await response.text();
        addLog('info', `Resposta recebida (${responseText.length} caracteres)`, {
          preview: responseText.substring(0, 200)
        });
        
        const data: RiskAnalysisResponse = JSON.parse(responseText);
        addLog('success', `JSON parseado com sucesso: ${data.risks.length} riscos identificados`);
        addLog('info', 'Detalhes da resposta', {
          status: data.status,
          project_name: data.project_name,
          objectives_count: data.objectives.length,
          processed_files_count: data.processed_files.length
        });
        
        const totalDuration = Date.now() - startTime;
        addLog('success', `Processamento completo em ${(totalDuration / 1000).toFixed(2)}s`);
        
        // Navegar para a página de resultados com os dados completos
        addLog('info', 'Navegando para a página de resultados');
        navigate("/results", { state: { analysisData: data, riskColors: configData?.riskColors || apiConfig.riskColors } });
        
      } catch (error) {
        console.error("Erro ao processar documentos:", error);
        
        const errorMessage = error instanceof Error ? error.message : "Erro ao processar documentos";
        const totalDuration = Date.now() - startTime;
        
        addLog('error', `Falha após ${(totalDuration / 1000).toFixed(2)}s: ${errorMessage}`, {
          errorType: error instanceof Error ? error.constructor.name : 'Unknown',
          errorStack: error instanceof Error ? error.stack : undefined,
          errorDetails: error
        });
        
        setHasError(true);
        toast.error(errorMessage);
      }
    };

    submitToWebhook();
  }, [location.state, navigate]);

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {!hasError && <LoadingScreen />}
        
        {hasError && (
          <Card className="max-w-4xl mx-auto p-8 mb-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Erro no Processamento</h2>
              <p className="text-muted-foreground">
                Ocorreu um erro ao processar os documentos. Verifique os logs abaixo para mais detalhes.
              </p>
              <Button onClick={() => navigate("/")} size="lg" className="mt-4">
                Retornar à tela inicial
              </Button>
            </div>
          </Card>
        )}
        
        {logs.length > 0 && (
          <Card className="mt-8 p-6 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-foreground mb-4">Log de Processamento</h2>
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <div className="space-y-3">
                {logs.map((log, index) => (
                  <div key={index} className="border-b border-border pb-3 last:border-b-0">
                    <div className="flex items-start gap-3">
                      <span className={`text-xs font-mono px-2 py-1 rounded ${
                        log.type === 'error' ? 'bg-destructive/20 text-destructive' :
                        log.type === 'success' ? 'bg-green-500/20 text-green-700 dark:text-green-400' :
                        'bg-primary/20 text-primary'
                      }`}>
                        {log.type.toUpperCase()}
                      </span>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground font-mono mb-1">
                          {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                        </p>
                        <p className="text-sm text-foreground font-medium mb-2">{log.message}</p>
                        {log.details && (
                          <pre className="text-xs bg-muted p-3 rounded overflow-x-auto font-mono">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        )}

        <RiskAssessmentDisclaimer />
      </div>
    </div>
  );
}
