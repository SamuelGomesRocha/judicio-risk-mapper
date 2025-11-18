import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { LoadingScreen } from "@/components/LoadingScreen";
import { API_CONFIG } from "@/config/api";
import { RiskAnalysis } from "@/types/risk";
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

    if (!filesData || !filesData.dod || !filesData.etp || !filesData.tr) {
      addLog('error', 'Arquivos não encontrados');
      toast.error("Arquivos não encontrados. Redirecionando...");
      navigate("/");
      return;
    }

    const submitToWebhook = async () => {
      try {
        // Obter configuração da API do localStorage
        const apiConfigStr = localStorage.getItem("api_config");
        if (!apiConfigStr) {
          toast.error("Configuração da API não encontrada. Configure a API antes de enviar.");
          navigate("/");
          return;
        }
        
        const apiConfig = JSON.parse(apiConfigStr);
        
        // Criar FormData com os arquivos
        const formData = new FormData();
        formData.append("dod", filesData.dod);
        formData.append("etp", filesData.etp);
        formData.append("tr", filesData.tr);

        addLog('info', 'Enviando documentos para processamento...');

        const response = await fetch(apiConfig.url, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${apiConfig.username}:${apiConfig.password}`)}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const responseText = await response.text();
          addLog('error', `Erro HTTP ${response.status}: ${response.statusText}`, { responseBody: responseText });
          throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
        }

        const responseText = await response.text();
        const data: RiskAnalysis[] = JSON.parse(responseText);
        
        addLog('success', 'Documentos processados com sucesso');
        
        // Navegar para a página de resultados com os dados
        navigate("/results", { state: { risks: data } });
        
      } catch (error) {
        console.error("Erro ao processar documentos:", error);
        
        const errorMessage = error instanceof Error ? error.message : "Erro ao processar documentos";
        
        addLog('error', errorMessage, {
          error: error instanceof Error ? error.name : 'Unknown',
          details: error instanceof Error ? error.stack : undefined
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
      </div>
    </div>
  );
}
