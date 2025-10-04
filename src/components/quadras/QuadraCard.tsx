import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Lock, Percent, Copy, Unlock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface Quadra {
  id: number;
  nome: string;
  tipo: string;
  preco: number;
  status: string;
  imagem: string;
  totalReservas?: number;
  promocoes?: Array<{
    nome: string;
    valorDesconto: number;
    tipoDesconto: "porcentagem" | "fixo";
    status: boolean;
  }>;
}

interface QuadraCardProps {
  quadra: Quadra;
  onEdit: () => void;
  onToggleStatus: () => void;
  onAddPromotion: () => void;
  onDuplicate: () => void;
  isMostBooked?: boolean;
}

export function QuadraCard({
  quadra,
  onEdit,
  onToggleStatus,
  onAddPromotion,
  onDuplicate,
  isMostBooked,
}: QuadraCardProps) {
  const statusStyles = {
    disponivel: "border-green-500 bg-green-50 dark:bg-green-950",
    bloqueada: "border-gray-400 bg-gray-50 dark:bg-gray-900",
  };

  const promocoesAtivas = quadra.promocoes?.filter((p) => p.status) || [];

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-lg",
        isMostBooked && "ring-2 ring-primary"
      )}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={quadra.imagem}
          alt={quadra.nome}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
        {isMostBooked && (
          <Badge className="absolute top-2 left-2 bg-primary">
            🏆 Mais Reservada
          </Badge>
        )}
        {quadra.status === "bloqueada" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <Badge variant="secondary" className="text-sm">
              <Lock className="mr-1 h-3 w-3" />
              Bloqueada
            </Badge>
          </div>
        )}
        <div
          className={cn(
            "absolute top-0 right-0 left-0 h-1",
            quadra.status === "disponivel" ? "bg-green-500" : "bg-gray-400"
          )}
        />
      </div>

      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{quadra.nome}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{quadra.tipo}</p>
          </div>
          <Badge variant="outline" className="ml-2">
            R$ {quadra.preco}/h
          </Badge>
        </div>
        {quadra.totalReservas !== undefined && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
            <Calendar className="h-3 w-3" />
            <span>{quadra.totalReservas} reservas este mês</span>
          </div>
        )}
      </CardHeader>

      {promocoesAtivas.length > 0 && (
        <CardContent className="pt-0">
          <div className="space-y-1">
            {promocoesAtivas.slice(0, 2).map((promo, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs bg-green-50 dark:bg-green-950/20 p-2 rounded-md"
              >
                <Percent className="h-3 w-3 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-700 dark:text-green-300">
                  {promo.nome}:{" "}
                  {promo.tipoDesconto === "porcentagem"
                    ? `${promo.valorDesconto}%`
                    : `R$ ${promo.valorDesconto}`}{" "}
                  OFF
                </span>
              </div>
            ))}
            {promocoesAtivas.length > 2 && (
              <p className="text-xs text-muted-foreground">
                +{promocoesAtivas.length - 2} promoções ativas
              </p>
            )}
          </div>
        </CardContent>
      )}

      <CardContent className={cn(promocoesAtivas.length === 0 && "pt-0")}>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="mr-1 h-3 w-3" />
            Editar
          </Button>
          <Button variant="outline" size="sm" onClick={onToggleStatus}>
            {quadra.status === "disponivel" ? (
              <>
                <Lock className="mr-1 h-3 w-3" />
                Bloquear
              </>
            ) : (
              <>
                <Unlock className="mr-1 h-3 w-3" />
                Ativar
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={onDuplicate}>
            <Copy className="mr-1 h-3 w-3" />
            Duplicar
          </Button>
          <Button variant="outline" size="sm" onClick={onAddPromotion} className="text-primary">
            <Percent className="mr-1 h-3 w-3" />
            Promoção
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
