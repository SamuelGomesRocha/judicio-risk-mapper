import { useState } from "react";
import { Controle } from "@/types/risk";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus, ChevronUp, ChevronDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EditableControlsListProps {
  items: Controle[];
  onSave: (items: Controle[]) => void;
}

export function EditableControlsList({ items, onSave }: EditableControlsListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editItems, setEditItems] = useState<Controle[]>(items);
  const [itemHeights, setItemHeights] = useState<number[]>(items.map(() => 60));

  const handleSave = () => {
    onSave(editItems);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditItems(items);
    setIsEditing(false);
  };

  const handleNomeChange = (index: number, value: string) => {
    const newItems = [...editItems];
    newItems[index].nome = value;
    setEditItems(newItems);
  };

  const handleDetalheChange = (index: number, value: string) => {
    const newItems = [...editItems];
    newItems[index].detalhe = value;
    setEditItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setEditItems(editItems.filter((_, i) => i !== index));
    setItemHeights(itemHeights.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    setEditItems([...editItems, { nome: "", detalhe: "" }]);
    setItemHeights([...itemHeights, 60]);
  };

  const increaseHeight = (index: number) => {
    const newHeights = [...itemHeights];
    newHeights[index] += 20;
    setItemHeights(newHeights);
  };

  const decreaseHeight = (index: number) => {
    const newHeights = [...itemHeights];
    newHeights[index] = Math.max(60, newHeights[index] - 20);
    setItemHeights(newHeights);
  };

  if (isEditing) {
    return (
      <div className="space-y-3">
        {editItems.map((item, idx) => (
          <div key={idx} className="border border-gray-300 rounded p-3 space-y-2">
            <div className="flex gap-2 items-start">
              <span className="text-gray-600 font-bold flex-shrink-0 pt-2">{idx + 1}.</span>
              <div className="flex-1 space-y-2">
                <Input
                  value={item.nome}
                  onChange={(e) => handleNomeChange(idx, e.target.value)}
                  className="flex-1 text-sm"
                  placeholder="Nome do controle"
                />
                <div className="flex gap-2 items-start">
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button
                      onClick={() => increaseHeight(idx)}
                      className="p-1 hover:bg-blue-100 rounded"
                      title="Aumentar altura"
                    >
                      <ChevronUp className="w-3 h-3 text-blue-600" />
                    </button>
                    <button
                      onClick={() => decreaseHeight(idx)}
                      className="p-1 hover:bg-blue-100 rounded"
                      title="Diminuir altura"
                    >
                      <ChevronDown className="w-3 h-3 text-blue-600" />
                    </button>
                  </div>
                  <textarea
                    value={item.detalhe}
                    onChange={(e) => handleDetalheChange(idx, e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded resize-none w-full"
                    placeholder="Referência/Detalhe do controle"
                    style={{ height: `${itemHeights[idx]}px`, minHeight: `${itemHeights[idx]}px` }}
                  />
                </div>
              </div>
              <button
                onClick={() => handleRemoveItem(idx)}
                className="p-2 text-red-500 hover:bg-red-50 rounded flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleAddItem}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Adicionar Controle
          </Button>
          <Button
            onClick={handleSave}
            size="sm"
            className="bg-green-500 text-white text-xs hover:bg-green-600"
          >
            ✓ Salvar
          </Button>
          <Button
            onClick={handleCancel}
            size="sm"
            variant="destructive"
            className="text-xs"
          >
            ✕ Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => setIsEditing(true)} className="cursor-text">
      {items && items.length > 0 ? (
        <TooltipProvider>
          <ul className="space-y-2">
            {items.map((ctrl, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-gray-600 font-bold flex-shrink-0">{idx + 1}.</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help border-b border-dashed border-gray-400 hover:border-gray-600">
                      {ctrl.nome}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent 
                    className="max-w-sm"
                    side="left"
                  >
                    <p className="font-semibold mb-2">{ctrl.nome}</p>
                    <p className="text-xs">{ctrl.detalhe}</p>
                  </TooltipContent>
                </Tooltip>
              </li>
            ))}
          </ul>
        </TooltipProvider>
      ) : (
        <span className="text-muted-foreground">—</span>
      )}
    </div>
  );
}
