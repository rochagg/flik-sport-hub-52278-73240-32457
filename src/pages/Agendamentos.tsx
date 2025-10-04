import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Search, Filter, Download, Eye, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Mock data - será substituído por dados reais do backend
const mockAgendamentos = [
  {
    id: "1",
    codigo: "FLIK-A1B2C",
    cliente: { nome: "João Silva", telefone: "(11) 98765-4321", email: "joao@email.com" },
    data: new Date(2025, 9, 15, 18, 0),
    modalidade: "Futebol",
    quadra: "Quadra 1 - Society",
    valorTotal: 150.00,
    status: "confirmado" as const,
    adicionais: ["Bola"],
    criadoEm: new Date(2025, 9, 1),
  },
  {
    id: "2",
    codigo: "FLIK-D3E4F",
    cliente: { nome: "Maria Santos", telefone: "(11) 91234-5678", email: "maria@email.com" },
    data: new Date(2025, 9, 16, 20, 0),
    modalidade: "Beach Tennis",
    quadra: "Quadra 3 - Areia",
    valorTotal: 120.00,
    status: "confirmado" as const,
    adicionais: ["Raquete", "Bola"],
    criadoEm: new Date(2025, 9, 2),
  },
  {
    id: "3",
    codigo: "FLIK-G5H6I",
    cliente: { nome: "Pedro Costa", telefone: "(11) 99876-5432", email: "pedro@email.com" },
    data: new Date(2025, 9, 5, 19, 0),
    modalidade: "Futebol",
    quadra: "Quadra 2 - Society",
    valorTotal: 150.00,
    status: "concluido" as const,
    adicionais: [],
    criadoEm: new Date(2025, 8, 25),
  },
  {
    id: "4",
    codigo: "FLIK-J7K8L",
    cliente: { nome: "Ana Oliveira", telefone: "(11) 97654-3210", email: "ana@email.com" },
    data: new Date(2025, 9, 3, 21, 0),
    modalidade: "Vôlei",
    quadra: "Quadra 4 - Cobertura",
    valorTotal: 100.00,
    status: "cancelado" as const,
    adicionais: [],
    criadoEm: new Date(2025, 8, 28),
  },
];

type StatusType = "confirmado" | "cancelado" | "concluido" | "em_uso";

const statusConfig = {
  confirmado: { label: "Confirmado", variant: "default" as const, color: "bg-primary" },
  em_uso: { label: "Em Uso", variant: "secondary" as const, color: "bg-blue-500" },
  concluido: { label: "Concluído", variant: "outline" as const, color: "bg-green-500" },
  cancelado: { label: "Cancelado", variant: "destructive" as const, color: "bg-destructive" },
};

export default function Agendamentos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [modalidadeFilter, setModalidadeFilter] = useState<string>("todas");
  const [selectedAgendamento, setSelectedAgendamento] = useState<typeof mockAgendamentos[0] | null>(null);
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [checkInCode, setCheckInCode] = useState("");
  const { toast } = useToast();

  const filteredAgendamentos = mockAgendamentos.filter((agendamento) => {
    const matchesSearch = agendamento.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agendamento.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || agendamento.status === statusFilter;
    const matchesModalidade = modalidadeFilter === "todas" || agendamento.modalidade === modalidadeFilter;
    return matchesSearch && matchesStatus && matchesModalidade;
  });

  const agendamentosFuturos = filteredAgendamentos.filter(
    (a) => a.status === "confirmado"
  );

  const agendamentosHistorico = filteredAgendamentos.filter(
    (a) => a.status === "concluido" || a.status === "cancelado"
  );

  const handleCheckIn = (agendamento: typeof mockAgendamentos[0]) => {
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

  const handleMarcarConcluida = () => {
    toast({
      title: "Reserva concluída",
      description: "A reserva foi marcada como concluída com sucesso.",
    });
    setSelectedAgendamento(null);
  };

  const handleCancelarReserva = () => {
    toast({
      title: "Reserva cancelada",
      description: "A reserva foi cancelada. O cliente será notificado.",
      variant: "destructive",
    });
    setSelectedAgendamento(null);
  };

  const handleReenviarCodigo = () => {
    toast({
      title: "Código reenviado",
      description: `Código de confirmação enviado para ${selectedAgendamento?.cliente.email}`,
    });
  };

  const AgendamentoRow = ({ agendamento }: { agendamento: typeof mockAgendamentos[0] }) => (
    <TableRow key={agendamento.id}>
      <TableCell className="font-mono font-semibold">{agendamento.codigo}</TableCell>
      <TableCell>{agendamento.cliente.nome}</TableCell>
      <TableCell>
        {format(agendamento.data, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
      </TableCell>
      <TableCell>{agendamento.modalidade}</TableCell>
      <TableCell>{agendamento.quadra}</TableCell>
      <TableCell className="font-semibold">
        R$ {agendamento.valorTotal.toFixed(2)}
      </TableCell>
      <TableCell>
        <Badge variant={statusConfig[agendamento.status].variant}>
          {statusConfig[agendamento.status].label}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAgendamento(agendamento)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Detalhes da Reserva</DialogTitle>
                <DialogDescription>
                  Código: {agendamento.codigo}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Cliente</Label>
                    <p className="font-medium">{agendamento.cliente.nome}</p>
                    <p className="text-sm text-muted-foreground">{agendamento.cliente.telefone}</p>
                    <p className="text-sm text-muted-foreground">{agendamento.cliente.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      <Badge variant={statusConfig[agendamento.status].variant}>
                        {statusConfig[agendamento.status].label}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Data e Horário</Label>
                    <p className="font-medium">
                      {format(agendamento.data, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Modalidade</Label>
                    <p className="font-medium">{agendamento.modalidade}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Quadra</Label>
                    <p className="font-medium">{agendamento.quadra}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Valor Total</Label>
                    <p className="font-medium text-lg">R$ {agendamento.valorTotal.toFixed(2)}</p>
                  </div>
                </div>
                {agendamento.adicionais.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Itens Adicionais</Label>
                    <div className="flex gap-2 mt-1">
                      {agendamento.adicionais.map((item) => (
                        <Badge key={item} variant="secondary">{item}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Criado em</Label>
                  <p className="text-sm">
                    {format(agendamento.criadoEm, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  {agendamento.status === "confirmado" && (
                    <Button onClick={handleMarcarConcluida} variant="default">
                      Marcar como Concluída
                    </Button>
                  )}
                  {agendamento.status === "confirmado" && (
                    <Button onClick={handleCancelarReserva} variant="destructive">
                      Cancelar Reserva
                    </Button>
                  )}
                  <Button onClick={handleReenviarCodigo} variant="outline">
                    Reenviar Código
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {agendamento.status === "confirmado" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCheckIn(agendamento)}
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agendamentos</h1>
          <p className="text-muted-foreground">
            Gerencie todas as reservas da sua arena
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Refine sua busca por agendamentos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="em_uso">Em Uso</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={modalidadeFilter} onValueChange={setModalidadeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Modalidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Modalidades</SelectItem>
                <SelectItem value="Futebol">Futebol</SelectItem>
                <SelectItem value="Beach Tennis">Beach Tennis</SelectItem>
                <SelectItem value="Vôlei">Vôlei</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Mais Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="futuros" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="futuros">
            Reservas Futuras ({agendamentosFuturos.length})
          </TabsTrigger>
          <TabsTrigger value="historico">
            Histórico ({agendamentosHistorico.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="futuros" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Próximas Reservas</CardTitle>
              <CardDescription>
                Reservas confirmadas e em andamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data/Horário</TableHead>
                    <TableHead>Modalidade</TableHead>
                    <TableHead>Quadra</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agendamentosFuturos.length > 0 ? (
                    agendamentosFuturos.map((agendamento) => (
                      <AgendamentoRow key={agendamento.id} agendamento={agendamento} />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        Nenhuma reserva futura encontrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Reservas</CardTitle>
              <CardDescription>
                Reservas concluídas e canceladas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data/Horário</TableHead>
                    <TableHead>Modalidade</TableHead>
                    <TableHead>Quadra</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agendamentosHistorico.length > 0 ? (
                    agendamentosHistorico.map((agendamento) => (
                      <AgendamentoRow key={agendamento.id} agendamento={agendamento} />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        Nenhum histórico encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={confirmCheckIn} className="flex-1">
                Confirmar Check-in
              </Button>
              <Button
                variant="outline"
                onClick={() => setCheckInDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
