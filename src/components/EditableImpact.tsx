import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IMPACT_LEVELS, getImpactGradeLabel } from "@/types/scales";
import { getColorForImpact } from "@/types/risk-colors";

interface EditableImpactProps {
  value?: number;
  onSave: (value: number) => void;
}

/**
 * Editable Impact Component
 * Allows selection of impact level from predefined scale
 */
export function EditableImpact({ value, onSave }: EditableImpactProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLevel = IMPACT_LEVELS.find((level) => level.value === value);
  const gradeLabel = selectedLevel?.grade || "—";
  const color = getColorForImpact(gradeLabel);

  const handleValueChange = (valueStr: string) => {
    const numValue = parseInt(valueStr, 10);
    onSave(numValue);
    setIsOpen(false);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Select value={value?.toString() || ""} onValueChange={handleValueChange} onOpenChange={setIsOpen} open={isOpen}>
            <SelectTrigger className="w-full min-w-fit">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {IMPACT_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value.toString()}>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: getColorForImpact(level.grade) }}
                    />
                    {level.grade} ({level.value})
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          {selectedLevel ? (
            <div>
              <p className="font-semibold mb-1">{selectedLevel.grade}</p>
              <p className="text-xs">{selectedLevel.description}</p>
            </div>
          ) : (
            "Selecione um nível de impacto"
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
