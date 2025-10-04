import { StatCard } from "@/components/StatCard";
import { AlertBanner } from "@/components/AlertBanner";
import { ProximosAgendamentos } from "@/components/ProximosAgendamentos";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  XCircle,
  Clock,
  Star,
  ArrowRight,
  Download,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const weekData = [
  { day: "Seg", reservas: 12 },
  { day: "Ter", reservas: 8 },
  { day: "Qua", reservas: 15 },
  { day: "Qui", reservas: 10 },
  { day: "Sex", reservas: 18 },
  { day: "Sáb", reservas: 24 },
  { day: "Dom", reservas: 20 },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("7");

  const handleExport = () => {
    toast({
      title: "Exportando dados",
      description: "O relatório será baixado em instantes.",
    });
    // Lógica de exportação será implementada aqui
  };

  const alerts = [
    {
      type: "warning" as const,
      message: "Alerta: A taxa de cancelamento subiu para 2,5% nesta semana.",
      icon: "alert" as const,
    },
    {
      type: "info" as const,
      message: "Notificação: Horário mais reservado esgotou – 19h às 20h",
      icon: "clock" as const,
    },
  ];

  const getPeriodText = () => {
    switch (selectedPeriod) {
      case "1":
        return "hoje";
      case "7":
        return "nos últimos 7 dias";
      case "30":
        return "nos últimos 30 dias";
      default:
        return "no período selecionado";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bem-vindo de volta!</h1>
          <p className="text-muted-foreground mt-1">
            Aqui está um resumo do desempenho da sua arena {getPeriodText()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Hoje</SelectItem>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="custom">Período personalizado</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Exportar dados
          </Button>
        </div>
      </div>

      <AlertBanner alerts={alerts} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Receita da Semana"
          value="R$ 4.850,00"
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
          onClick={() => navigate("/desempenho")}
          helpText="A Receita da Semana é a soma dos valores recebidos com base nas reservas confirmadas no período selecionado."
          status="excellent"
        />
        <StatCard
          title="Ticket Médio"
          value="R$ 105,00"
          icon={TrendingUp}
          trend={{ value: 8.3, isPositive: true }}
          onClick={() => navigate("/desempenho")}
          helpText="O Ticket Médio representa o valor médio gasto por cliente em cada reserva."
          status="good"
        />
        <StatCard
          title="Reservas Concluídas"
          value="107"
          icon={Calendar}
          description="No período"
          onClick={() => navigate("/desempenho")}
          helpText="Número total de reservas concluídas com sucesso no período selecionado."
        />
        <StatCard
          title="Taxa de Cancelamento"
          value="2.5%"
          icon={XCircle}
          trend={{ value: 0.7, isPositive: false }}
          onClick={() => navigate("/desempenho")}
          helpText="Percentual de reservas canceladas em relação ao total de reservas realizadas."
          status="warning"
        />
        <StatCard
          title="Horário Mais Reservado"
          value="19h - 20h"
          icon={Clock}
          description="Segunda a Sexta"
          onClick={() => navigate("/desempenho")}
          helpText="Faixa de horário com maior número de reservas no período analisado."
        />
        <StatCard
          title="Avaliação Média"
          value="4.8"
          icon={Star}
          description="Baseado em 89 avaliações"
          onClick={() => navigate("/avaliacoes")}
          helpText="Média de todas as avaliações recebidas pelos clientes."
          status="excellent"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Reservas da Semana</CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/desempenho")}
          >
            Ver detalhes
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="day" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="reservas"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <ProximosAgendamentos />

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <h3 className="text-lg font-semibold">Impulsione sua arena!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Apareça em destaque no app e receba até 3x mais reservas
            </p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Ver Planos
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
