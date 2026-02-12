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
import { CONTROL_FACTOR_LEVELS, getControlFactorLevelByName } from "@/types/scales";
import { getColorForControlFactor } from "@/types/risk-colors";

interface EditableControlFactorProps {
  value?: string;
  onSave: (value: string, factor: number) => void;
}

/**
 * Editable Control Factor Component
 * Allows selection of control factor level from predefined scale
 */
export function EditableControlFactor({ value, onSave }: EditableControlFactorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLevel = getControlFactorLevelByName(value || "");
  const color = getColorForControlFactor(value || "");

  const handleValueChange = (levelName: string) => {
    const level = getControlFactorLevelByName(levelName);
    if (level) {
      onSave(levelName, level.factor);
      setIsOpen(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Select value={value || ""} onValueChange={handleValueChange} onOpenChange={setIsOpen} open={isOpen}>
            <SelectTrigger className="w-full min-w-fit">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {CONTROL_FACTOR_LEVELS.map((level) => (
                <SelectItem key={level.name} value={level.name}>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: getColorForControlFactor(level.name) }}
                    />
                    {level.name} ({level.factor})
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          {selectedLevel ? (
            <div>
              <p className="font-semibold mb-1">{selectedLevel.name}</p>
              <p className="text-xs">{selectedLevel.description}</p>
              <p className="text-xs mt-2">
                <span className="font-semibold">Fator:</span> {selectedLevel.factor}
              </p>
            </div>
          ) : (
            "Selecione um nível de fator de controle"
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
