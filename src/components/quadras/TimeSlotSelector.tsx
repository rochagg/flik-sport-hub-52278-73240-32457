import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Copy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface TimeSlot {
  inicio: string;
  fim: string;
}

interface TimeSlotSelectorProps {
  dia: string;
  slots: TimeSlot[];
  onSlotsChange: (slots: TimeSlot[]) => void;
  isDisabled: boolean;
  onDisabledChange: (disabled: boolean) => void;
  mensalistasHorarios?: string[];
}

const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

export function TimeSlotSelector({
  dia,
  slots,
  onSlotsChange,
  isDisabled,
  onDisabledChange,
  mensalistasHorarios = [],
}: TimeSlotSelectorProps) {
  const [showCopyMenu, setShowCopyMenu] = useState(false);

  const addSlot = () => {
    onSlotsChange([...slots, { inicio: "06:00", fim: "07:00" }]);
  };

  const removeSlot = (index: number) => {
    onSlotsChange(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: "inicio" | "fim", value: string) => {
    const newSlots = [...slots];
    newSlots[index][field] = value;
    onSlotsChange(newSlots);
  };

  const copyToDay = (targetDay: string) => {
    // Esta função será chamada pelo componente pai
    setShowCopyMenu(false);
    toast({
      title: "Horários copiados",
      description: `Horários de ${dia} copiados para ${targetDay}`,
    });
  };

  const gerarHorarios = () => {
    const horarios: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        horarios.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      }
    }
    return horarios;
  };

  const horarios = gerarHorarios();

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">{dia}</h4>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={!isDisabled} onCheckedChange={(v) => onDisabledChange(!v)} />
            <span className="text-sm">{isDisabled ? "Fechado" : "Aberto"}</span>
          </div>
          {!isDisabled && slots.length > 0 && (
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCopyMenu(!showCopyMenu)}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copiar
              </Button>
              {showCopyMenu && (
                <div className="absolute right-0 top-full mt-1 bg-popover border rounded-md shadow-lg z-10 p-2 min-w-[150px]">
                  {diasSemana
                    .filter((d) => d !== dia)
                    .map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => copyToDay(d)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-sm"
                      >
                        Para {d}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!isDisabled && (
        <div className="space-y-3">
          {slots.map((slot, index) => {
            const isMensalistaHorario = mensalistasHorarios.some(
              (mh) => mh >= slot.inicio && mh < slot.fim
            );

            return (
              <div
                key={index}
                className={cn(
                  "flex gap-2 items-center",
                  isMensalistaHorario && "bg-orange-50 dark:bg-orange-950/20 p-2 rounded-md"
                )}
              >
                <div className="flex-1">
                  <Label className="text-xs">Início</Label>
                  <Select value={slot.inicio} onValueChange={(v) => updateSlot(index, "inicio", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {horarios.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Fim</Label>
                  <Select value={slot.fim} onValueChange={(v) => updateSlot(index, "fim", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {horarios.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {isMensalistaHorario && (
                  <span className="text-xs text-orange-600 dark:text-orange-400">Mensalista</span>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSlot(index)}
                  className="mt-5"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}

          <Button type="button" variant="outline" size="sm" onClick={addSlot} className="w-full">
            <Plus className="h-3 w-3 mr-1" />
            Adicionar Horário
          </Button>
        </div>
      )}
    </div>
  );
}
