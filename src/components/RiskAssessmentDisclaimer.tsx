import { AlertCircle } from "lucide-react";

/**
 * Componente de disclaimer para informar que o sistema sugere elementos de risco
 * conforme ISO 31000, mas não os define. A análise subjetiva é responsabilidade do usuário.
 */
export function RiskAssessmentDisclaimer() {
  return (
    <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg">
      <div className="flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            <strong className="font-semibold">Importante:</strong> O processo de Avaliação de Riscos necessita de uma análise subjetiva que vai além da geração automática. 
            Este sistema <strong>sugere</strong> riscos, causas, consequências, controles, probabilidade, impacto e outros elementos conforme ISO 31000, 
            porém, <strong>não os define</strong>. A interpretação, validação e aprovação final dos elementos sugeridos é responsabilidade dos especialistas e gestores envolvidos.
          </p>
        </div>
      </div>
    </div>
  );
}
