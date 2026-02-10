import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus, ChevronUp, ChevronDown } from "lucide-react";

interface EditableListProps {
  items: string[];
  onSave: (items: string[]) => void;
}

export function EditableList({ items, onSave }: EditableListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editItems, setEditItems] = useState<string[]>(items);
  const [itemHeights, setItemHeights] = useState<number[]>(items.map(() => 40));

  const handleSave = () => {
    onSave(editItems);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditItems(items);
    setIsEditing(false);
  };

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...editItems];
    newItems[index] = value;
    setEditItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setEditItems(editItems.filter((_, i) => i !== index));
    setItemHeights(itemHeights.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    setEditItems([...editItems, ""]);
    setItemHeights([...itemHeights, 40]);
  };

  const increaseHeight = (index: number) => {
    const newHeights = [...itemHeights];
    newHeights[index] += 20;
    setItemHeights(newHeights);
  };

  const decreaseHeight = (index: number) => {
    const newHeights = [...itemHeights];
    newHeights[index] = Math.max(40, newHeights[index] - 20);
    setItemHeights(newHeights);
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        {editItems.map((item, idx) => (
          <div key={idx} className="flex gap-2 items-start">
            <span className="text-gray-600 font-bold flex-shrink-0 pt-2">{idx + 1}.</span>
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
              value={item}
              onChange={(e) => handleItemChange(idx, e.target.value)}
              className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 resize-none"
              placeholder={`Item ${idx + 1}`}
              style={{ height: `${itemHeights[idx]}px`, minHeight: `${itemHeights[idx]}px` }}
            />
            <button
              onClick={() => handleRemoveItem(idx)}
              className="p-2 text-red-500 hover:bg-red-50 rounded flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
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
            Adicionar
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
    <ul className="space-y-2 cursor-text" onClick={() => setIsEditing(true)}>
      {items.map((item, idx) => (
        <li key={idx} className="flex gap-2">
          <span className="text-gray-600 font-bold flex-shrink-0">{idx + 1}.</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
