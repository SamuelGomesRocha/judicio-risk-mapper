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
    const formData = location.state?.formData;

    if (!formData) {
      navigate("/");
      return;
    }

    const submitToWebhook = async () => {
      try {
        const response = await fetch(API_CONFIG.webhookUrl, {
          method: 'POST',
          headers: {
            'Authorization': API_CONFIG.getAuthHeader(),
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: RiskAnalysis[] = await response.json();
        
        // Navegar para a página de resultados com os dados
        navigate("/results", { state: { risks: data } });
        
      } catch (error) {
        console.error("Erro ao processar documentos:", error);
        toast.error("Erro ao processar documentos. Verifique a conexão com o servidor.");
        
        // Em caso de erro, aguarda 2 segundos e volta para o início
        setTimeout(() => {
          navigate("/");
        }, 2000);
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
