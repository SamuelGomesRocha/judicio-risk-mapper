import { useEffect, useState } from "react";
import { RiskColorConfig, DEFAULT_RISK_COLORS } from "@/types/risk-colors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RotateCcw, AlertCircle } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface RiskColorsTabProps {
  form: UseFormReturn<any, any>;
}

export function RiskColorsTab({ form }: RiskColorsTabProps) {
  const riskColors = form.watch("riskColors") || DEFAULT_RISK_COLORS;
  const [colorLevels] = useState<string[]>(Object.keys(DEFAULT_RISK_COLORS));

  const updateColor = (level: string, color: string) => {
    const newColors = { ...riskColors, [level]: color };
    form.setValue("riskColors", newColors);
  };

  const resetToDefault = () => {
    if (window.confirm("Deseja resetar as cores para o padrão?")) {
      form.setValue("riskColors", DEFAULT_RISK_COLORS);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert about color customization */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 text-sm ml-2">
          Customize as cores para cada nível de risco. As cores serão aplicadas automaticamente na tabela de resultados.
        </AlertDescription>
      </Alert>

      {/* Color Pickers */}
      <Card>
        <CardHeader>
          <CardTitle>Cores por Nível de Risco</CardTitle>
          <CardDescription>
            Selecione a cor para cada nível de risco (ISO 31000)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {colorLevels.map((level) => (
            <div
              key={level}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
            >
              {/* Color Preview Circle */}
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-12 h-12 rounded-lg border border-gray-300 shadow-sm cursor-pointer transition-transform hover:scale-110"
                  style={{ backgroundColor: riskColors[level] || DEFAULT_RISK_COLORS[level] }}
                  onClick={() => {
                    const input = document.getElementById(`color-input-${level}`) as HTMLInputElement;
                    input?.click();
                  }}
                  title="Clique para alterar cor"
                />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{level}</p>
                  <p className="text-xs text-muted-foreground">
                    {riskColors[level] || DEFAULT_RISK_COLORS[level]}
                  </p>
                </div>
              </div>

              {/* Color Input (Hidden) */}
              <input
                id={`color-input-${level}`}
                type="color"
                value={riskColors[level] || DEFAULT_RISK_COLORS[level]}
                onChange={(e) => updateColor(level, e.target.value)}
                className="w-16 h-10 cursor-pointer border border-gray-300 rounded"
              />

              {/* Hex Input */}
              <Input
                type="text"
                value={riskColors[level] || DEFAULT_RISK_COLORS[level]}
                onChange={(e) => {
                  // Validate hex color
                  const val = e.target.value;
                  if (/^#[0-9A-F]{6}$/i.test(val)) {
                    updateColor(level, val);
                  }
                }}
                placeholder="#RRGGBB"
                className="w-24"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
        <CardHeader>
          <CardTitle className="text-base">Prévia das Cores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {colorLevels.map((level) => (
            <div key={level} className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded-full border border-gray-300"
                style={{ backgroundColor: riskColors[level] || DEFAULT_RISK_COLORS[level] }}
              />
              <span className="text-sm font-medium text-foreground flex-1">{level}</span>
              <span className="text-xs text-muted-foreground">
                {riskColors[level] || DEFAULT_RISK_COLORS[level]}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Reset Button */}
      <Button
        type="button"
        variant="outline"
        onClick={resetToDefault}
        className="w-full gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        Resetar Cores Padrão
      </Button>

      {/* Info */}
      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 text-xs ml-2">
          <strong>Cores Padrão Recomendadas:</strong>
          <ul className="mt-2 space-y-1 ml-4 list-disc">
            <li>Muito Baixo: Cinza Escuro (#1F2937)</li>
            <li>Baixo: Amarelo (#F59E0B)</li>
            <li>Médio: Laranja (#F97316)</li>
            <li>Alto: Vermelho (#EF4444)</li>
            <li>Extremo: Roxo (#7C3AED)</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
