import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UploadedFiles } from "@/types/risk";
import { ConfigSettings, DEFAULT_RISK_SCALE } from "@/types/config";
import { Header } from "@/components/Header";
import { FileUploadCard } from "@/components/FileUploadCard";
import { RiskAssessmentDisclaimer } from "@/components/RiskAssessmentDisclaimer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Upload, Settings } from "lucide-react";
import { toast } from "sonner";
import { ConfigModal } from "@/components/ConfigModal";

const CONFIG_KEY = "app_config";

export default function UploadPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<UploadedFiles>({
    dod: null,
    etp: null,
    tr: null,
  });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [config, setConfig] = useState<ConfigSettings | null>(null);

  useEffect(() => {
    // Carregar configuração salva do localStorage
    const savedConfig = localStorage.getItem(CONFIG_KEY);
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    } else {
      // Se não tem configuração, abrir o modal automaticamente
      setShowConfigModal(true);
    }
  }, []);

  const allFilesUploaded = files.dod && files.etp && files.tr;
  const canSubmit = allFilesUploaded && config;

  const handleSaveConfig = (newConfig: ConfigSettings) => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
    setConfig(newConfig);
    toast.success("Configurações salvas com sucesso!");
  };

  const handleSubmit = async () => {
    if (!config) {
      toast.error("Configure a aplicação antes de enviar os arquivos");
      setShowConfigModal(true);
      return;
    }

    if (!allFilesUploaded) {
      toast.error("Por favor, envie todos os três arquivos");
      return;
    }

    try {
      // Navigate to loading screen with files and config
      navigate("/loading", { 
        state: { 
          files: {
            dod: files.dod,
            etp: files.etp,
            tr: files.tr
          },
          config: config,
          riskColors: config?.riskColors
        } 
      });
    } catch (error) {
      toast.error("Erro ao enviar arquivos");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Header />
      
      <ConfigModal 
        open={showConfigModal}
        onOpenChange={setShowConfigModal}
        onSave={handleSaveConfig}
        initialConfig={config || undefined}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8 shadow-xl">
          <div className="mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <FileText className="w-9 h-9 text-primary-foreground" />
                </div>
                <div className="text-left">
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    Análise Simplificada de Riscos
                  </h1>
                  <p className="text-muted-foreground">
                    Conforme ISO 31000 - Envie os documentos de contratação para análise
                  </p>
                </div>
              </div>
              
              <Button
                variant={config ? "outline" : "default"}
                onClick={() => setShowConfigModal(true)}
                className="flex items-center gap-2 flex-shrink-0"
              >
                <Settings className="w-4 h-4" />
                {config ? "Reconfigurar" : "Configurar"}
              </Button>
            </div>

            {config && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-foreground font-medium">Configurações Ativas:</span>
                  <span className="text-muted-foreground">{config.url}</span>
                </div>
              </div>
            )}
            
            {!config && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-4">
                <p className="text-destructive text-sm font-medium flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  Configure a aplicação (API e escalas de risco) antes de enviar os documentos
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4 mb-8">
            <FileUploadCard
              title="Documento de Oficialização da Demanda (DOD)"
              description="Arquivo em formato PDF contendo o DOD da contratação"
              file={files.dod}
              onFileChange={(file) => setFiles({ ...files, dod: file })}
            />
            
            <FileUploadCard
              title="Estudo Técnico Preliminar (ETP)"
              description="Arquivo em formato PDF contendo o ETP da contratação"
              file={files.etp}
              onFileChange={(file) => setFiles({ ...files, etp: file })}
            />
            
            <FileUploadCard
              title="Termo de Referência (TR)"
              description="Arquivo em formato PDF contendo o TR da contratação"
              file={files.tr}
              onFileChange={(file) => setFiles({ ...files, tr: file })}
            />
          </div>

          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="min-w-[200px]"
            >
              <Upload className="w-5 h-5 mr-2" />
              Analisar Documentos
            </Button>
          </div>
        </Card>

        <div className="mt-6 p-4 bg-primary-light border border-primary/20 rounded-lg">
          <p className="text-sm text-foreground">
            <strong className="text-primary">Nota:</strong> Os três arquivos devem estar em formato PDF 
            e serão enviados simultaneamente para análise.
          </p>
        </div>

        <RiskAssessmentDisclaimer />
      </main>
    </div>
  );
}
