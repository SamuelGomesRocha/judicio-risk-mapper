export const Header = () => {
  return (
    <header className="border-b border-border bg-card shadow-sm">
      <div className="mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <img 
            src="/logo.png" 
            alt="Logo SARS" 
            className="h-16 w-auto object-contain"
          />
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
