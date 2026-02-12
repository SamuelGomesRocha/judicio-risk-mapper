import { useRef } from "react";
import { UseFormSetValue } from "react-hook-form";
import { Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConfigSettings } from "@/types/config";
import { RagData, isValidRagData } from "@/types/rag";

interface RagTabProps {
  form: any;
}

/**
 * RAG Tab Component
 * Handles JSON file upload for RAG (Retrieval-Augmented Generation) configuration
 */
export const RagTab = ({ form }: RagTabProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith(".json")) {
      form.setError("ragData", {
        type: "manual",
        message: "Por favor, selecione um arquivo .json válido",
      });
      return;
    }

    try {
      const content = await file.text();
      const jsonData = JSON.parse(content);

      // Validate that it's an array
      if (!Array.isArray(jsonData)) {
        throw new Error("JSON deve ser um array de objetos");
      }

      if (jsonData.length === 0) {
        throw new Error("Array não pode estar vazio");
      }

      // Validate RAG data structure
      if (!isValidRagData(jsonData)) {
        throw new Error(
          "Estrutura inválida. O array deve conter objetos com os campos obrigatórios: Projeto, Causa, Evento_de_Risco, Consequencia, Probabilidade, Impacto, Risco_Inerente, Controles, Fator_de_Controle, Risco_Residual e Resposta"
        );
      }

      // Store the validated RAG data
      form.setValue("ragData", jsonData as RagData);
      form.clearErrors("ragData");
    } catch (error) {
      const errorMessage =
        error instanceof SyntaxError
          ? "JSON inválido. Verifique a sintaxe do arquivo."
          : error instanceof Error
            ? error.message
            : "Erro ao processar arquivo";

      form.setError("ragData", {
        type: "manual",
        message: errorMessage,
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveData = () => {
    form.setValue("ragData", undefined);
    form.clearErrors("ragData");
  };

  const ragData = form.watch("ragData");
  const hasError = form.formState.errors.ragData;

  return (
    <div className="space-y-4">
      {/* Info Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900 ml-2">
          Configuração RAG Array (Retrieval-Augmented Generation)
        </AlertTitle>
        <AlertDescription className="text-blue-800 text-xs ml-6 mt-2">
          <p className="mb-2">
            Carregue um array JSON com dados de análise de risco para enriquecer o processamento.
          </p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Formato: Array de objetos com campos de análise de risco</li>
            <li>Campos obrigatórios: Projeto, Causa, Evento_de_Risco, Consequencia, Probabilidade, Impacto, Risco_Inerente, Controles, Fator_de_Controle, Risco_Residual, Resposta</li>
            <li>O array será enviado junto com a análise para processamento</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* File Upload Area */}
      <div className="space-y-3">
        <FormLabel>Upload de Array JSON</FormLabel>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="font-medium text-gray-600 mb-1">
            Clique para selecionar um arquivo JSON com array de dados
          </p>
          <p className="text-sm text-gray-400">ou arraste aqui</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Upload arquivo JSON array para RAG"
          />
        </div>
      </div>

      {/* Error Message */}
      {hasError && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-900 ml-2">Erro no JSON</AlertTitle>
          <AlertDescription className="text-red-800 text-sm ml-6 mt-1">
            {hasError.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Success State - JSON Array Loaded */}
      {ragData && !hasError && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900 ml-2">
            Array JSON Carregado com Sucesso
          </AlertTitle>
          <AlertDescription className="text-green-800 text-sm ml-6 mt-2">
            <div className="space-y-2">
              <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono overflow-auto max-h-40">
                {JSON.stringify(ragData, null, 2)}
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemoveData}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Remover Array
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {!ragData && !hasError && (
        <Alert className="bg-gray-50 border-gray-200">
          <AlertCircle className="h-4 w-4 text-gray-600" />
          <AlertTitle className="text-gray-900 ml-2">Nenhum array RAG</AlertTitle>
          <AlertDescription className="text-gray-600 text-sm ml-6">
            Nenhum arquivo JSON foi carregado. Você pode prosseguir com a análise sem dados RAG customizados.
          </AlertDescription>
        </Alert>
      )}

      {/* Array Preview Info */}
      {ragData && (
        <div className="p-3 bg-blue-50 rounded border border-blue-200">
          <p className="text-xs font-medium text-blue-900 mb-1">
            Quantidade de registros: {ragData.length}
          </p>
          <p className="text-xs text-blue-800">
            Tamanho total: {JSON.stringify(ragData).length} bytes
          </p>
          <p className="text-xs text-blue-800 mt-1">
            Primeiro registro: Projeto "{ragData[0]?.Projeto || "—"}"
          </p>
        </div>
      )}
    </div>
  );
};
