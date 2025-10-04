import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const horarios = Array.from({ length: 15 }, (_, i) => {
  const hora = i + 6;
  return `${hora}:00 - ${hora + 1}:00`;
});

const promotionSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  tipoDesconto: z.enum(["porcentagem", "fixo"]),
  valorDesconto: z.number().min(0.01, "Valor deve ser maior que zero"),
  status: z.boolean(),
});

interface Promotion {
  id?: number;
  nome: string;
  tipoDesconto: "porcentagem" | "fixo";
  valorDesconto: number;
  dataInicio: Date;
  dataFim: Date;
  diasSemana: string[];
  horarios: string[];
  status: boolean;
}

interface PromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotion?: Promotion | null;
  onSave: (promotion: Promotion) => void;
}

export function PromotionDialog({
  open,
  onOpenChange,
  promotion,
  onSave,
}: PromotionDialogProps) {
  const [dataInicio, setDataInicio] = useState<Date | undefined>(promotion?.dataInicio);
  const [dataFim, setDataFim] = useState<Date | undefined>(promotion?.dataFim);
  const [diasSelecionados, setDiasSelecionados] = useState<string[]>(
    promotion?.diasSemana || []
  );
  const [horariosSelecionados, setHorariosSelecionados] = useState<string[]>(
    promotion?.horarios || []
  );

  const form = useForm({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      nome: promotion?.nome || "",
      tipoDesconto: promotion?.tipoDesconto || "porcentagem",
      valorDesconto: promotion?.valorDesconto || 0,
      status: promotion?.status ?? true,
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    if (!dataInicio || !dataFim) {
      toast({
        title: "Erro",
        description: "Selecione as datas de início e fim",
        variant: "destructive",
      });
      return;
    }

    if (diasSelecionados.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione ao menos um dia da semana",
        variant: "destructive",
      });
      return;
    }

    if (horariosSelecionados.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione ao menos um horário",
        variant: "destructive",
      });
      return;
    }

    const promotionData: Promotion = {
      ...data,
      dataInicio,
      dataFim,
      diasSemana: diasSelecionados,
      horarios: horariosSelecionados,
      id: promotion?.id,
    };

    onSave(promotionData);
    onOpenChange(false);
  });

  const toggleDia = (dia: string) => {
    setDiasSelecionados((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  const toggleHorario = (horario: string) => {
    setHorariosSelecionados((prev) =>
      prev.includes(horario) ? prev.filter((h) => h !== horario) : [...prev, horario]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {promotion ? "Editar Promoção" : "Nova Promoção"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nome/Descrição da Promoção</Label>
            <Input
              {...form.register("nome")}
              placeholder="Ex: Happy Hour - 50% OFF"
            />
            {form.formState.errors.nome && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.nome.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Desconto</Label>
              <Select
                value={form.watch("tipoDesconto")}
                onValueChange={(value: "porcentagem" | "fixo") =>
                  form.setValue("tipoDesconto", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="porcentagem">Porcentagem (%)</SelectItem>
                  <SelectItem value="fixo">Valor Fixo (R$)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>
                Valor do Desconto (
                {form.watch("tipoDesconto") === "porcentagem" ? "%" : "R$"})
              </Label>
              <Input
                type="number"
                step="0.01"
                {...form.register("valorDesconto", { valueAsNumber: true })}
                placeholder={form.watch("tipoDesconto") === "porcentagem" ? "10" : "20.00"}
              />
              {form.formState.errors.valorDesconto && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.valorDesconto.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data de Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataInicio && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataInicio ? (
                      format(dataInicio, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataInicio}
                    onSelect={setDataInicio}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Data de Término</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataFim && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataFim ? (
                      format(dataFim, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataFim}
                    onSelect={setDataFim}
                    disabled={(date) => dataInicio ? date < dataInicio : false}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label>Dias da Semana</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {diasSemana.map((dia) => (
                <div key={dia} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dia-${dia}`}
                    checked={diasSelecionados.includes(dia)}
                    onCheckedChange={() => toggleDia(dia)}
                  />
                  <label
                    htmlFor={`dia-${dia}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {dia.substring(0, 3)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Horários</Label>
            <div className="grid grid-cols-3 gap-2 mt-2 max-h-48 overflow-y-auto p-2 border rounded-md">
              {horarios.map((horario) => (
                <button
                  key={horario}
                  type="button"
                  onClick={() => toggleHorario(horario)}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm transition-colors",
                    horariosSelecionados.includes(horario)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {horario}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>Status da Promoção</Label>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.watch("status")}
                onCheckedChange={(checked) => form.setValue("status", checked)}
              />
              <span className="text-sm">
                {form.watch("status") ? "Ativa" : "Inativa"}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Promoção</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
