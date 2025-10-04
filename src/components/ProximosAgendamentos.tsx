import { useState } from "react";
import { format, addDays, isToday, isTomorrow, startOfDay, endOfDay, addHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, ArrowRight, CheckCircle2, Copy, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Mock data - próximos agendamentos
const mockProximosAgendamentos = [
  {
    id: "1",
    codigo: "FLIK-A1B2C",
    cliente: { nome: "João Silva" },
    data: new Date(),
    horarioInicio: new Date(),
    horarioFim: addHours(new Date(), 1),
    modalidade: "Futebol",
    quadra: "Quadra 1 - Society",
    status: "confirmado" as const,
  },
  {
    id: "2",
    codigo: "FLIK-D3E4F",
    cliente: { nome: "Maria Santos" },
    data: addHours(new Date(), 3),
    horarioInicio: addHours(new Date(), 3),
    horarioFim: addHours(new Date(), 4),
    modalidade: "Beach Tennis",
    quadra: "Quadra 3 - Areia",
    status: "confirmado" as const,
  },
  {
    id: "3",
    codigo: "FLIK-G5H6I",
    cliente: { nome: "Pedro Costa" },
    data: addDays(new Date(), 1),
    horarioInicio: addDays(new Date(), 1),
    horarioFim: addHours(addDays(new Date(), 1), 1),
    modalidade: "Futebol",
    quadra: "Quadra 2 - Society",
    status: "confirmado" as const,
  },
  {
    id: "4",
    codigo: "FLIK-J7K8L",
    cliente: { nome: "Ana Oliveira" },
    data: addDays(new Date(), 2),
    horarioInicio: addDays(new Date(), 2),
    horarioFim: addHours(addDays(new Date(), 2), 1),
    modalidade: "Vôlei",
    quadra: "Quadra 4 - Cobertura",
    status: "confirmado" as const,
  },
  {
    id: "5",
    codigo: "FLIK-M9N0O",
    cliente: { nome: "Carlos Pereira" },
    data: addDays(new Date(), 3),
    horarioInicio: addDays(new Date(), 3),
    horarioFim: addHours(addDays(new Date(), 3), 1),
    modalidade: "Beach Tennis",
    quadra: "Quadra 3 - Areia",
    status: "confirmado" as const,
  },
];

type FilterType = "hoje" | "24h" | "7dias";

export function ProximosAgendamentos() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [timeFilter, setTimeFilter] = useState<FilterType>("7dias");
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<typeof mockProximosAgendamentos[0] | null>(null);
  const [checkInCode, setCheckInCode] = useState("");

  const getFilteredAgendamentos = () => {
    const now = new Date();
    
    switch (timeFilter) {
      case "hoje":
        return mockProximosAgendamentos.filter((a) => isToday(a.data));
      case "24h":
        const next24h = addHours(now, 24);
        return mockProximosAgendamentos.filter((a) => a.data >= now && a.data <= next24h);
      case "7dias":
      default:
        const next7days = addDays(now, 7);
        return mockProximosAgendamentos.filter((a) => a.data >= now && a.data <= next7days);
    }
  };

  const filteredAgendamentos = getFilteredAgendamentos().slice(0, 5);

  const isReservaDoHoje = (data: Date) => {
    return isToday(data);
  };

  const handleCopyCode = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    toast({
      title: "Código copiado!",
      description: "Código de confirmação copiado para a área de transferência.",
    });
  };

  const handleCheckIn = (agendamento: typeof mockProximosAgendamentos[0]) => {
    setSelectedAgendamento(agendamento);
    setCheckInDialogOpen(true);
    setCheckInCode("");
  };

  const confirmCheckIn = () => {
    if (checkInCode.toUpperCase() === selectedAgendamento?.codigo) {
      toast({
        title: "Check-in realizado!",
        description: `Cliente ${selectedAgendamento.cliente.nome} confirmado na ${selectedAgendamento.quadra}.`,
      });
      setCheckInDialogOpen(false);
    } else {
      toast({
        title: "Código inválido",
        description: "O código de confirmação não corresponde a esta reserva.",
        variant: "destructive",
      });
    }
  };

  const getClienteNomeOculto = (nome: string) => {
    const partes = nome.split(" ");
    if (partes.length === 1) return nome;
    return `${partes[0]} ${partes[partes.length - 1].charAt(0)}.`;
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Próximos Agendamentos</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    O cliente deve apresentar o código de confirmação no momento da chegada
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeFilter} onValueChange={(value) => setTimeFilter(value as FilterType)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="24h">Próximas 24h</SelectItem>
                <SelectItem value="7dias">Próximos 7 dias</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/agendamentos")}
            >
              Ver todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAgendamentos.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Modalidade</TableHead>
                    <TableHead>Quadra</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgendamentos.map((agendamento) => (
                    <TableRow 
                      key={agendamento.id}
                      className={cn(
                        isReservaDoHoje(agendamento.data) && "bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30"
                      )}
                    >
                      <TableCell className="font-medium">
                        {format(agendamento.data, "dd/MM/yyyy", { locale: ptBR })}
                        {isToday(agendamento.data) && (
                          <Badge variant="secondary" className="ml-2 bg-green-500/20 text-green-700 dark:text-green-400">
                            Hoje
                          </Badge>
                        )}
                        {isTomorrow(agendamento.data) && (
                          <Badge variant="secondary" className="ml-2">
                            Amanhã
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(agendamento.horarioInicio, "HH:mm", { locale: ptBR })} - {format(agendamento.horarioFim, "HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>{agendamento.modalidade}</TableCell>
                      <TableCell>{agendamento.quadra}</TableCell>
                      <TableCell>{getClienteNomeOculto(agendamento.cliente.nome)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{agendamento.codigo.split('-')[1]}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleCopyCode(agendamento.codigo)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {isReservaDoHoje(agendamento.data) && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleCheckIn(agendamento)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Check-in
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum agendamento confirmado para os próximos dias.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={checkInDialogOpen} onOpenChange={setCheckInDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check-in da Reserva</DialogTitle>
            <DialogDescription>
              Digite o código de confirmação para realizar o check-in
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Código de Confirmação</Label>
              <Input
                placeholder="FLIK-XXXXX"
                value={checkInCode}
                onChange={(e) => setCheckInCode(e.target.value)}
                className="font-mono uppercase"
              />
            </div>
            {selectedAgendamento && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Cliente:</p>
                <p className="font-medium">{selectedAgendamento.cliente.nome}</p>
                <p className="text-sm text-muted-foreground mt-2">Quadra:</p>
                <p className="font-medium">{selectedAgendamento.quadra}</p>
                <p className="text-sm text-muted-foreground mt-2">Horário:</p>
                <p className="font-medium">
                  {format(selectedAgendamento.horarioInicio, "HH:mm")} - {format(selectedAgendamento.horarioFim, "HH:mm")}
                </p>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button onClick={confirmCheckIn} className="flex-1">
                Confirmar Check-in
              </Button>
              <Button onClick={() => setCheckInDialogOpen(false)} variant="outline">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
