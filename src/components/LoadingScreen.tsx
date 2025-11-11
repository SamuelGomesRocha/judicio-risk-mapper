import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, Lightbulb } from "lucide-react";

const ISO_TIPS = [
  "A gestão de riscos deve ser parte integrante de todas as atividades organizacionais.",
  "A gestão de riscos é customizada e proporcional ao contexto externo e interno da organização.",
  "A gestão de riscos considera fatores humanos e culturais que podem facilitar ou dificultar o alcance dos objetivos.",
  "A gestão de riscos é transparente e inclusiva, com envolvimento apropriado das partes interessadas.",
  "O processo de gestão de riscos é estruturado e abrangente, contribuindo para resultados consistentes e comparáveis.",
  "A gestão de riscos leva em consideração explicitamente qualquer limitação de informação ou conhecimento disponível.",
  "A gestão de riscos é dinâmica, iterativa e capaz de reagir a mudanças, pois novos riscos podem surgir.",
  "O propósito da gestão de riscos é criar e proteger valor, melhorando o desempenho e encorajando a inovação.",
];

export const LoadingScreen = () => {
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % ISO_TIPS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary-foreground animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-20 animate-ping" />
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Analisando documentos
            </h2>
            <p className="text-muted-foreground">
              Aguarde enquanto processamos os arquivos DOD, ETP e TR...
            </p>
          </div>

          <div className="bg-primary-light border border-primary/20 rounded-lg p-6 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Lightbulb className="w-5 h-5" />
              <span className="font-semibold">Dica ISO 31000</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed text-left">
              {ISO_TIPS[currentTip]}
            </p>
          </div>

          <div className="flex justify-center gap-2">
            {ISO_TIPS.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentTip ? "bg-primary w-8" : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

// Small utility function - normally imported from utils but defining here for clarity
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
