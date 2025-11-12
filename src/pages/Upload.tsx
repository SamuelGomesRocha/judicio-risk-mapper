import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UploadedFiles } from "@/types/risk";
import { Header } from "@/components/Header";
import { FileUploadCard } from "@/components/FileUploadCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Upload, Settings } from "lucide-react";
import { toast } from "sonner";
import { ApiConfigModal, ApiConfig } from "@/components/ApiConfigModal";

const API_CONFIG_KEY = "api_config";

export default function UploadPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<UploadedFiles>({
    dod: null,
    etp: null,
    tr: null,
  });
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig | null>(null);

  useEffect(() => {
    // Carregar configuração salva do localStorage
    const savedConfig = localStorage.getItem(API_CONFIG_KEY);
    if (savedConfig) {
      setApiConfig(JSON.parse(savedConfig));
    } else {
      // Se não tem configuração, abrir o modal automaticamente
      setShowApiModal(true);
    }
  }, []);

  const allFilesUploaded = files.dod && files.etp && files.tr;
  const canSubmit = allFilesUploaded && apiConfig;

  const handleSaveApiConfig = (config: ApiConfig) => {
    localStorage.setItem(API_CONFIG_KEY, JSON.stringify(config));
    setApiConfig(config);
    toast.success("Configuração da API salva com sucesso!");
  };

  const handleSubmit = async () => {
    if (!apiConfig) {
      toast.error("Configure a API antes de enviar os arquivos");
      setShowApiModal(true);
      return;
    }

    if (!allFilesUploaded) {
      toast.error("Por favor, envie todos os três arquivos");
      return;
    }

    try {
      // Navigate to loading screen with files
      navigate("/loading", { 
        state: { 
          files: {
            dod: files.dod,
            etp: files.etp,
            tr: files.tr
          }
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
      
      <ApiConfigModal 
        open={showApiModal}
        onOpenChange={setShowApiModal}
        onSave={handleSaveApiConfig}
        initialConfig={apiConfig || undefined}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8 shadow-xl">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                <FileText className="w-9 h-9 text-primary-foreground" />
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <h1 className="text-3xl font-bold text-foreground">
                Análise Simplificada de Riscos
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowApiModal(true)}
                className="rounded-full"
                title="Configurar API"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-muted-foreground">
              Conforme ISO 31000 - Envie os documentos de contratação para análise
            </p>
            {!apiConfig && (
              <p className="text-destructive text-sm mt-2 font-medium">
                ⚠️ Configure a API antes de enviar os documentos
              </p>
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
            e serão enviados simultaneamente para análise. O sistema realizará uma análise de riscos 
            baseada nas diretrizes da ISO 31000.
          </p>
        </div>
      </main>
    </div>
  );
}
