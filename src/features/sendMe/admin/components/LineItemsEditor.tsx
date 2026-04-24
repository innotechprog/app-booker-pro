import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import type { SendMeLineItem } from "../types";

interface LineItemsEditorProps {
  items: SendMeLineItem[];
  onChange: (items: SendMeLineItem[]) => void;
}

export default function LineItemsEditor({ items, onChange }: LineItemsEditorProps) {
  const update = (id: string, patch: Partial<SendMeLineItem>) => {
    onChange(items.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const addRow = () => {
    onChange([
      ...items,
      { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeRow = (id: string) => {
    if (items.length <= 1) return;
    onChange(items.filter((row) => row.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-white">Line items</Label>
        <Button type="button" size="sm" variant="secondary" onClick={addRow} className="gap-1">
          <Plus className="h-4 w-4" />
          Add line
        </Button>
      </div>
      <div className="space-y-2 rounded-lg border border-white/20 bg-white/5 p-3">
        {items.map((row) => (
          <div key={row.id} className="grid gap-2 sm:grid-cols-[1fr_72px_100px_auto] sm:items-end">
            <div>
              <Label className="text-xs text-white/70">Description</Label>
              <Input
                value={row.description}
                onChange={(e) => update(row.id, { description: e.target.value })}
                placeholder="Service or product"
                className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <div>
              <Label className="text-xs text-white/70">Qty</Label>
              <Input
                type="number"
                min={0}
                step={1}
                value={row.quantity}
                onChange={(e) => update(row.id, { quantity: Math.max(0, Number(e.target.value) || 0) })}
                className="border-white/20 bg-white/10 text-white"
              />
            </div>
            <div>
              <Label className="text-xs text-white/70">Unit (ZAR)</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={row.unitPrice}
                onChange={(e) => update(row.id, { unitPrice: Math.max(0, Number(e.target.value) || 0) })}
                className="border-white/20 bg-white/10 text-white"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-red-300 hover:bg-white/10 hover:text-red-200"
              onClick={() => removeRow(row.id)}
              disabled={items.length <= 1}
              aria-label="Remove line"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
