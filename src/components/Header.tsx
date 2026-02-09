import { Scale } from "lucide-react";

export const Header = () => {
  return (
    <header className="border-b border-border bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-primary">
            <Scale className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Sistema de Avaliação de Riscos</h1>
            <p className="text-sm text-muted-foreground">
              Tribunal de Justiça do Estado de Goiás
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
