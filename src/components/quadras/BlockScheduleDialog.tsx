import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BlockScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quadraNome: string;
  isBlocking: boolean;
  onConfirm: (data: { agendar: boolean; dataReabertura?: Date; horaReabertura?: string }) => void;
}

export function BlockScheduleDialog({
  open,
  onOpenChange,
  quadraNome,
  isBlocking,
  onConfirm,
}: BlockScheduleDialogProps) {
  const [agendarReabertura, setAgendarReabertura] = useState(false);
  const [dataReabertura, setDataReabertura] = useState<Date>();
  const [horaReabertura, setHoraReabertura] = useState<string>("08:00");

  const handleConfirm = () => {
    onConfirm({
      agendar: agendarReabertura,
      dataReabertura: agendarReabertura ? dataReabertura : undefined,
      horaReabertura: agendarReabertura ? horaReabertura : undefined,
    });
    onOpenChange(false);
    setAgendarReabertura(false);
    setDataReabertura(undefined);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isBlocking ? "Bloquear" : "Ativar"} {quadraNome}
          </DialogTitle>
          <DialogDescription>
            {isBlocking
              ? "A quadra ficará indisponível para reservas até ser reativada manualmente ou na data agendada."
              : "A quadra voltará a aceitar reservas imediatamente."}
          </DialogDescription>
        </DialogHeader>

        {isBlocking && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label>Agendar reabertura automática</Label>
              <Switch checked={agendarReabertura} onCheckedChange={setAgendarReabertura} />
            </div>

            {agendarReabertura && (
              <>
                <div>
                  <Label>Data de Reabertura</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-2",
                          !dataReabertura && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dataReabertura ? (
                          format(dataReabertura, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dataReabertura}
                        onSelect={setDataReabertura}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Horário de Reabertura</Label>
                  <Select value={horaReabertura} onValueChange={setHoraReabertura}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gerarHorarios().map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>
            Confirmar {isBlocking ? "Bloqueio" : "Ativação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
