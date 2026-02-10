import { useState } from "react";
import { RiskLevel, DEFAULT_RISK_SCALE } from "@/types/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, RotateCcw, AlertCircle } from "lucide-react";
import { UseFormReturn, FieldValues } from "react-hook-form";

interface RiskScaleTabProps {
  form: UseFormReturn<any, any>;
}

export function RiskScaleTab({ form }: RiskScaleTabProps) {
  const riskLevels = form.watch("riskLevels") || DEFAULT_RISK_SCALE;
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});

  const addLevel = () => {
    const newLevels = [
      ...riskLevels,
      { level: "", minValue: 0, maxValue: 0 },
    ];
    form.setValue("riskLevels", newLevels);
    setValidationErrors({});
  };

  const removeLevel = (index: number) => {
    if (riskLevels.length <= 1) {
      alert("Você deve manter pelo menos um nível de risco");
      return;
    }
    const newLevels = riskLevels.filter((_: RiskLevel, i: number) => i !== index);
    form.setValue("riskLevels", newLevels);
    const newErrors = { ...validationErrors };
    delete newErrors[index];
    setValidationErrors(newErrors);
  };

  const updateLevel = (index: number, field: keyof RiskLevel, value: any) => {
    const newLevels = [...riskLevels];
    newLevels[index] = { ...newLevels[index], [field]: value };
    form.setValue("riskLevels", newLevels);

    // Validar
    validateLevels(newLevels);
  };

  const validateLevels = (levels: RiskLevel[]) => {
    const errors: Record<number, string> = {};

    levels.forEach((level, index) => {
      if (!level.level.trim()) {
        errors[index] = "Nome do nível é obrigatório";
      }
      if (level.minValue >= level.maxValue) {
        errors[index] = "Valor mínimo deve ser menor que o máximo";
      }
      if (level.minValue < 0 || level.maxValue < 0) {
        errors[index] = "Valores devem ser positivos";
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetToDefault = () => {
    if (window.confirm("Deseja resetar para as escalas padrão?")) {
      form.setValue("riskLevels", DEFAULT_RISK_SCALE);
      setValidationErrors({});
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert about default scales */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 text-sm ml-2">
          Defina os níveis de risco e suas respectivas escalas. Caso não configure, os valores padrão serão utilizados.
        </AlertDescription>
      </Alert>

      {/* Current Scales */}
      <Card>
        <CardHeader>
          <CardTitle>Níveis de Risco</CardTitle>
          <CardDescription>
            Configure os níveis de risco com suas respectivas escalas numéricas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {riskLevels.map((level: RiskLevel, index: number) => (
            <div
              key={index}
              className={`p-4 border rounded-lg space-y-3 ${
                validationErrors[index] ? "border-red-300 bg-red-50" : "border-gray-200"
              }`}
            >
              <div className="grid grid-cols-12 gap-3 items-end">
                {/* Level Name */}
                <div className="col-span-4">
                  <label className="text-sm font-medium text-gray-700">Nível</label>
                  <Input
                    placeholder="Ex: EXTREMO"
                    value={level.level}
                    onChange={(e) => updateLevel(index, "level", e.target.value)}
                    className={validationErrors[index] ? "border-red-500" : ""}
                  />
                </div>

                {/* Min Value */}
                <div className="col-span-3">
                  <label className="text-sm font-medium text-gray-700">Mín.</label>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={level.minValue}
                    onChange={(e) => updateLevel(index, "minValue", parseInt(e.target.value) || 0)}
                    className={validationErrors[index] ? "border-red-500" : ""}
                  />
                </div>

                {/* Max Value */}
                <div className="col-span-3">
                  <label className="text-sm font-medium text-gray-700">Máx.</label>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={level.maxValue}
                    onChange={(e) => updateLevel(index, "maxValue", parseInt(e.target.value) || 0)}
                    className={validationErrors[index] ? "border-red-500" : ""}
                  />
                </div>

                {/* Delete Button */}
                <div className="col-span-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLevel(index)}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Error Message */}
              {validationErrors[index] && (
                <p className="text-sm text-red-600">{validationErrors[index]}</p>
              )}

              {/* Display Format */}
              <div className="bg-gray-50 p-2 rounded text-sm text-gray-600 border border-gray-200">
                <strong>{level.level}</strong> {level.minValue} ≤ x ≤ {level.maxValue}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={resetToDefault}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Resetar Padrão
        </Button>

        <Button
          type="button"
          onClick={addLevel}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Nível
        </Button>
      </div>

      {/* Preview */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-base">Prévia da Configuração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-sm">
            {riskLevels.map((level: RiskLevel, index: number) => (
              <div key={index} className="flex justify-between text-gray-700">
                <span className="font-semibold">{level.level}</span>
                <span className="text-gray-600">
                  {level.minValue} ≤ x ≤ {level.maxValue}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
