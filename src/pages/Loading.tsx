import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { LoadingScreen } from "@/components/LoadingScreen";
import { API_CONFIG } from "@/config/api";
import { RiskAnalysis } from "@/types/risk";
import { toast } from "sonner";

export default function LoadingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const filesData = location.state?.files;

    if (!filesData || !filesData.dod || !filesData.etp || !filesData.tr) {
      toast.error("Arquivos não encontrados. Redirecionando...");
      navigate("/");
      return;
    }

    const submitToWebhook = async () => {
      try {
        // Criar FormData com os arquivos
        const formData = new FormData();
        formData.append("dod", filesData.dod);
        formData.append("etp", filesData.etp);
        formData.append("tr", filesData.tr);

        const response = await fetch(API_CONFIG.webhookUrl, {
          method: 'POST',
          headers: {
            'Authorization': API_CONFIG.getAuthHeader(),
          },
          body: formData,
        });

        if (!response.ok) {
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
          
          throw new Error(errorMessage);
        }

        const data: RiskAnalysis[] = await response.json();
        
        // Navegar para a página de resultados com os dados
        navigate("/results", { state: { risks: data } });
        
      } catch (error) {
        console.error("Erro ao processar documentos:", error);
        
        const errorMessage = error instanceof Error 
          ? error.message 
          : "Erro ao processar documentos. Verifique a conexão com o servidor.";
        
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
      <LoadingScreen />
    </div>
  );
}
