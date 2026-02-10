import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ChevronUp, ChevronDown } from "lucide-react";

interface EditableCellProps {
  value: string;
  onSave: (value: string) => void;
  isMultiline?: boolean;
}

export function EditableCell({ value, onSave, isMultiline = false }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [textareaHeight, setTextareaHeight] = useState(80);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isMultiline) {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const increaseHeight = () => {
    setTextareaHeight(prev => prev + 40);
  };

  const decreaseHeight = () => {
    setTextareaHeight(prev => Math.max(80, prev - 40));
  };

  if (isEditing) {
    return (
      <div className="flex gap-2 items-start">
        <div className="flex flex-col gap-1 flex-shrink-0 pt-2">
          <button
            onClick={increaseHeight}
            className="p-1 hover:bg-blue-100 rounded"
            title="Aumentar altura"
          >
            <ChevronUp className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={decreaseHeight}
            className="p-1 hover:bg-blue-100 rounded"
            title="Diminuir altura"
          >
            <ChevronDown className="w-4 h-4 text-blue-600" />
          </button>
        </div>
        {isMultiline ? (
          <textarea
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-2 py-1 text-sm border border-primary rounded resize-none"
            style={{ height: `${textareaHeight}px`, minHeight: `${textareaHeight}px` }}
          />
        ) : (
          <Input
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 text-sm"
          />
        )}
        <div className="flex gap-1 flex-shrink-0 flex-col pt-2">
          <button
            onClick={handleSave}
            className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
            title="Salvar (Enter)"
          >
            ✓
          </button>
          <button
            onClick={handleCancel}
            className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
            title="Cancelar (Esc)"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => setIsEditing(true)} className="cursor-text">
      {value}
    </div>
  );
}
