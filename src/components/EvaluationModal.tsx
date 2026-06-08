import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { RiskItem, EvaluationPayload } from "@/types/risk";
import {
  getEvaluationQuestions,
  getFieldTypeLabel,
  METRIC_LABELS,
  EvaluationState,
  createEmptyEvaluationState,
  isEvaluationComplete,
  evaluationStateToPayload,
} from "@/types/evaluation";
import { cn } from "@/lib/utils";

interface EvaluationModalProps {
  isOpen: boolean;
  item: RiskItem | null;
  onClose: () => void;
  onSubmit: (evaluation: EvaluationPayload) => Promise<void>;
}

/**
 * EvaluationModal Component
 * 
 * Displays a modal with 3 ARES metric sliders (Context Relevance, Faithfulness, Answer Relevance)
 * Questions are dynamically displayed based on field_type of the item being evaluated.
 * 
 * Features:
 * - Dynamic questions based on field_type (evento, causa, consequencia, controle)
 * - 3 sliders for -1.0 to 1.0 range with visual indicators
 * - Optional feedback_notes textarea
 * - Submit button disabled until all 3 metrics are filled
 * - Loading state during async submission
 * - Validation and error handling
 */
export function EvaluationModal({
  isOpen,
  item,
  onClose,
  onSubmit,
}: EvaluationModalProps) {
  const [state, setState] = useState<EvaluationState>(
    createEmptyEvaluationState()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal closes or item changes
  useEffect(() => {
    if (!isOpen) {
      setState(createEmptyEvaluationState());
    }
  }, [isOpen]);

  if (!item) return null;

  const questions = getEvaluationQuestions(item.field_type);
  const fieldTypeLabel = getFieldTypeLabel(item.field_type);
  const isComplete = isEvaluationComplete(state);

  const handleSliderChange = (
    metric: "context_relevance" | "faithfulness" | "answer_relevance",
    value: number
  ) => {
    setState((prev) => ({
      ...prev,
      [metric]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!isComplete) {
      toast.error("Preencha todas as 3 métricas antes de salvar");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = evaluationStateToPayload(state, item.content, item.trace_id);
      await onSubmit(payload);
      onClose();
      toast.success(`Avaliação de ${fieldTypeLabel} registrada com sucesso!`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao salvar avaliação";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Avaliar Qualidade: {fieldTypeLabel}</DialogTitle>
          <DialogDescription>
            Avalie a qualidade do conteúdo usando as métricas ARES
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Content Preview */}
          <div className="bg-muted p-3 rounded-md">
            <p className="text-xs text-muted-foreground mb-1">Conteúdo:</p>
            <p className="text-sm line-clamp-2">{item.content}</p>
          </div>

          {/* Sliders Section */}
          <div className="space-y-6">
            {/* Context Relevance Buttons */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <Label className="text-sm font-semibold">
                    {METRIC_LABELS.context_relevance}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {questions.context_relevance}
                  </p>
                </div>
                <span className="text-sm font-mono font-bold min-w-fit">
                  {state.context_relevance !== null
                    ? state.context_relevance === 1 ? "+1.0" : state.context_relevance === -1 ? "-1.0" : "-0.0"
                    : "—"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={state.context_relevance === -1.0 ? "default" : "outline"}
                  className={cn(
                    "w-full transition-colors",
                    state.context_relevance === -1.0 && "bg-red-500 hover:bg-red-600 text-white border-red-500"
                  )}
                  onClick={() => handleSliderChange("context_relevance", -1.0)}
                >
                  Negativo
                </Button>
                <Button
                  type="button"
                  variant={state.context_relevance === 0.0 ? "default" : "outline"}
                  className={cn(
                    "w-full transition-colors",
                    state.context_relevance === 0.0 && "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500"
                  )}
                  onClick={() => handleSliderChange("context_relevance", -0.0)}
                >
                  Neutro
                </Button>
                <Button
                  type="button"
                  variant={state.context_relevance === 1.0 ? "default" : "outline"}
                  className={cn(
                    "w-full transition-colors",
                    state.context_relevance === 1.0 && "bg-green-500 hover:bg-green-600 text-white border-green-500"
                  )}
                  onClick={() => handleSliderChange("context_relevance", 1.0)}
                >
                  Positivo
                </Button>
              </div>
            </div>

            {/* Faithfulness Buttons */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <Label className="text-sm font-semibold">
                    {METRIC_LABELS.faithfulness}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {questions.faithfulness}
                  </p>
                </div>
                <span className="text-sm font-mono font-bold min-w-fit">
                  {state.faithfulness !== null
                    ? state.faithfulness === 1 ? "+1.0" : state.faithfulness === -1 ? "-1.0" : "-0.0"
                    : "—"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={state.faithfulness === -1.0 ? "default" : "outline"}
                  className={cn(
                    "w-full transition-colors",
                    state.faithfulness === -1.0 && "bg-red-500 hover:bg-red-600 text-white border-red-500"
                  )}
                  onClick={() => handleSliderChange("faithfulness", -1.0)}
                >
                  Negativo
                </Button>
                <Button
                  type="button"
                  variant={state.faithfulness === 0.0 ? "default" : "outline"}
                  className={cn(
                    "w-full transition-colors",
                    state.faithfulness === 0.0 && "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500"
                  )}
                  onClick={() => handleSliderChange("faithfulness", -0.0)}
                >
                  Neutro
                </Button>
                <Button
                  type="button"
                  variant={state.faithfulness === 1.0 ? "default" : "outline"}
                  className={cn(
                    "w-full transition-colors",
                    state.faithfulness === 1.0 && "bg-green-500 hover:bg-green-600 text-white border-green-500"
                  )}
                  onClick={() => handleSliderChange("faithfulness", 1.0)}
                >
                  Positivo
                </Button>
              </div>
            </div>

            {/* Answer Relevance Buttons */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <Label className="text-sm font-semibold">
                    {METRIC_LABELS.answer_relevance}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {questions.answer_relevance}
                  </p>
                </div>
                <span className="text-sm font-mono font-bold min-w-fit">
                  {state.answer_relevance !== null
                    ? state.answer_relevance === 1 ? "+1.0" : state.answer_relevance === -1 ? "-1.0" : "-0.0"
                    : "—"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={state.answer_relevance === -1.0 ? "default" : "outline"}
                  className={cn(
                    "w-full transition-colors",
                    state.answer_relevance === -1.0 && "bg-red-500 hover:bg-red-600 text-white border-red-500"
                  )}
                  onClick={() => handleSliderChange("answer_relevance", -1.0)}
                >
                  Negativo
                </Button>
                <Button
                  type="button"
                  variant={state.answer_relevance === 0.0 ? "default" : "outline"}
                  className={cn(
                    "w-full transition-colors",
                    state.answer_relevance === 0.0 && "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500"
                  )}
                  onClick={() => handleSliderChange("answer_relevance", -0.0)}
                >
                  Neutro
                </Button>
                <Button
                  type="button"
                  variant={state.answer_relevance === 1.0 ? "default" : "outline"}
                  className={cn(
                    "w-full transition-colors",
                    state.answer_relevance === 1.0 && "bg-green-500 hover:bg-green-600 text-white border-green-500"
                  )}
                  onClick={() => handleSliderChange("answer_relevance", 1.0)}
                >
                  Positivo
                </Button>
              </div>
            </div>
          </div>

          {/* Optional Feedback Notes */}
          <div className="space-y-2">
            <Label htmlFor="feedback-notes" className="text-sm">
              Observações (opcional)
            </Label>
            <Textarea
              id="feedback-notes"
              placeholder="Adicione comentários ou observações sobre esta avaliação..."
              value={state.feedback_notes}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  feedback_notes: e.target.value,
                }))
              }
              className="min-h-20 resize-none text-sm"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !isComplete}
            className="gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Salvando..." : "Salvar Avaliação"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
