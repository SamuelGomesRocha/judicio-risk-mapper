import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadedFiles } from "@/types/risk";
import { Header } from "@/components/Header";
import { FileUploadCard } from "@/components/FileUploadCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Upload } from "lucide-react";
import { toast } from "sonner";

export default function UploadPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<UploadedFiles>({
    dod: null,
    etp: null,
    tr: null,
  });

  const allFilesUploaded = files.dod && files.etp && files.tr;

  const handleSubmit = async () => {
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
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8 shadow-xl">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                <FileText className="w-9 h-9 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Análise Simplificada de Riscos
            </h1>
            <p className="text-muted-foreground">
              Conforme ISO 31000 - Envie os documentos de contratação para análise
            </p>
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
              disabled={!allFilesUploaded}
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
