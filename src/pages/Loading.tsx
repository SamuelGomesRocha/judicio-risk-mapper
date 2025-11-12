import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { LoadingScreen } from "@/components/LoadingScreen";
import { API_CONFIG } from "@/config/api";
import { RiskAnalysis } from "@/types/risk";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  const addLog = (type: LogEntry['type'], message: string, details?: any) => {
    const timestamp = new Date().toISOString();
    setLogs(prev => [...prev, { timestamp, type, message, details }]);
    console.log(`[${timestamp}] [${type.toUpperCase()}]`, message, details || '');
  };

  useEffect(() => {
    const filesData = location.state?.files;

    if (!filesData || !filesData.dod || !filesData.etp || !filesData.tr) {
      addLog('error', 'Arquivos não encontrados');
      toast.error("Arquivos não encontrados. Redirecionando...");
      navigate("/");
      return;
    }

    const submitToWebhook = async () => {
      try {
        addLog('info', 'Iniciando envio dos documentos...');
        
        // Obter configuração da API do localStorage
        const apiConfigStr = localStorage.getItem("api_config");
        if (!apiConfigStr) {
          throw new Error("Configuração da API não encontrada. Configure a API antes de enviar.");
        }
        
        const apiConfig = JSON.parse(apiConfigStr);
        addLog('info', 'Configuração da API carregada', {
          url: apiConfig.url,
          username: apiConfig.username
        });
        
        const authHeader = `Basic ${btoa(`${apiConfig.username}:${apiConfig.password}`)}`;
        
        // Criar FormData com os arquivos
        const formData = new FormData();
        formData.append("dod", filesData.dod);
        formData.append("etp", filesData.etp);
        formData.append("tr", filesData.tr);

        addLog('info', 'Arquivos adicionados ao FormData', {
          dod: filesData.dod.name,
          etp: filesData.etp.name,
          tr: filesData.tr.name
        });

        addLog('info', 'Enviando requisição POST...', {
          url: apiConfig.url,
          method: 'POST',
          headers: { Authorization: 'Basic [REDACTED]' },
          body: 'FormData com 3 arquivos'
        });

        const response = await fetch(apiConfig.url, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
          },
          body: formData,
        });

        addLog('info', 'Resposta recebida', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });

        if (!response.ok) {
          const responseText = await response.text();
          let errorMessage = "Erro ao processar documentos.";
          
          switch (response.status) {
            case 400:
              errorMessage = "Requisição inválida. Verifique se todos os arquivos são PDFs válidos.";
              break;
            case 401:
              errorMessage = "Falha na autenticação. Credenciais inválidas.";
              break;
            case 403:
              errorMessage = "Acesso negado. Sem permissão para acessar este recurso.";
              break;
            case 404:
              errorMessage = "Serviço não encontrado. Verifique a URL do webhook.";
              break;
            case 413:
              errorMessage = "Arquivos muito grandes. Reduza o tamanho dos PDFs.";
              break;
            case 500:
              errorMessage = "Erro interno do servidor. Tente novamente mais tarde.";
              break;
            case 502:
              errorMessage = "Servidor indisponível. Tente novamente em alguns instantes.";
              break;
            case 503:
              errorMessage = "Serviço temporariamente indisponível. Aguarde e tente novamente.";
              break;
            case 504:
              errorMessage = "Tempo limite excedido. O processamento está demorando mais que o esperado.";
              break;
            default:
              errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
          }
          
          addLog('error', errorMessage, {
            status: response.status,
            statusText: response.statusText,
            responseBody: responseText
          });
          
          throw new Error(errorMessage);
        }

        const responseText = await response.text();
        addLog('success', 'Resposta recebida com sucesso', { responseBody: responseText });
        
        const data: RiskAnalysis[] = JSON.parse(responseText);
        addLog('success', 'Dados parseados com sucesso', { risksCount: data.length });
        
        // Navegar para a página de resultados com os dados
        navigate("/results", { state: { risks: data } });
        
      } catch (error) {
        console.error("Erro ao processar documentos:", error);
        
        const errorMessage = error instanceof Error 
          ? error.message 
          : "Erro ao processar documentos. Verifique a conexão com o servidor.";
        
        addLog('error', 'Erro durante o processamento', {
          error: errorMessage,
          errorType: error instanceof Error ? error.name : 'Unknown',
          stack: error instanceof Error ? error.stack : undefined
        });
        
        toast.error(errorMessage, {
          duration: 5000,
        });
        
        // Em caso de erro, aguarda 3 segundos e volta para o início
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    };

    submitToWebhook();
  }, [location.state, navigate]);

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <LoadingScreen />
        
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
      </div>
    </div>
  );
}
