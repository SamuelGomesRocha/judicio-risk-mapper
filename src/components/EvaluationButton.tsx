import { useState } from "react";
import { MessageSquare, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RiskItem } from "@/types/risk";
import { cn } from "@/lib/utils";

interface EvaluationButtonProps {
  item: RiskItem;
  isEvaluated: boolean;
  onEvaluate: (item: RiskItem) => void;
}

/**
 * EvaluationButton Component
 * 
 * Renders a small icon button next to risk field content to trigger quality evaluation.
 * Displays different icons based on evaluation state:
 * - MessageSquare (neutral): not yet evaluated
 * - CheckCircle2 (green): already evaluated
 * 
 * Props:
 * - item: RiskItem containing id, field_type, and content
 * - isEvaluated: boolean indicating if this item has been evaluated
 * - onEvaluate: callback triggered when user clicks button
 */
export function EvaluationButton({
  item,
  isEvaluated,
  onEvaluate,
}: EvaluationButtonProps) {
  const [isHovering, setIsHovering] = useState(false);

  const handleClick = () => {
    onEvaluate(item);
  };

  const tooltipLabel = isEvaluated
    ? `Avaliado: ${item.field_type}`
    : `Avaliar qualidade: ${item.field_type}`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-6 w-6 p-0 rounded-full ml-2 inline-flex items-center justify-center",
              isEvaluated
                ? "text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              isHovering && "ring-1 ring-offset-1"
            )}
            onClick={handleClick}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            aria-label={tooltipLabel}
          >
            {isEvaluated ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <MessageSquare className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {tooltipLabel}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
