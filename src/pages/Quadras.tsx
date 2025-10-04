import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EditQuadraDialog } from "@/components/EditQuadraDialog";
import { FilterBar } from "@/components/quadras/FilterBar";
import { QuadraCard } from "@/components/quadras/QuadraCard";
import { PromotionDialog } from "@/components/quadras/PromotionDialog";
import { BlockScheduleDialog } from "@/components/quadras/BlockScheduleDialog";
import { toast } from "@/hooks/use-toast";

const quadrasIniciais = [
  {
    id: 1,
    nome: "Quadra Society 1",
    tipo: "Futebol Society",
    preco: 120,
    status: "disponivel",
    imagem: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&q=80",
    totalReservas: 145,
    promocoes: [
      {
        nome: "Happy Hour",
        valorDesconto: 20,
        tipoDesconto: "porcentagem" as const,
        status: true,
      },
    ],
  },
  {
    id: 2,
    nome: "Quadra Society 2",
    tipo: "Futebol Society",
    preco: 120,
    status: "disponivel",
    imagem: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400&q=80",
    totalReservas: 98,
  },
  {
    id: 3,
    nome: "Quadra de Vôlei",
    tipo: "Vôlei",
    preco: 80,
    status: "disponivel",
    imagem: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&q=80",
    totalReservas: 67,
  },
  {
    id: 4,
    nome: "Quadra de Beach Tennis",
    tipo: "Beach Tennis",
    preco: 90,
    status: "bloqueada",
    imagem: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&q=80",
    totalReservas: 23,
  },
];

const Quadras = () => {
  const [quadras, setQuadras] = useState(quadrasIniciais);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [promotionDialogOpen, setPromotionDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [quadraSelecionada, setQuadraSelecionada] = useState<typeof quadrasIniciais[0] | null>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [sportFilter, setSportFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [sortBy, setSortBy] = useState("nome");

  const handleEditQuadra = (quadra: typeof quadrasIniciais[0]) => {
    setQuadraSelecionada(quadra);
    setDialogOpen(true);
  };

  const handleAddQuadra = () => {
    setQuadraSelecionada(null);
    setDialogOpen(true);
  };

  const handleSaveQuadra = (data: any) => {
    if (quadraSelecionada) {
      setQuadras((prev) =>
        prev.map((q) => (q.id === quadraSelecionada.id ? { ...q, ...data } : q))
      );
      toast({
        title: "Quadra atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
    } else {
      const novaQuadra = {
        ...data,
        id: Math.max(...quadras.map((q) => q.id)) + 1,
        totalReservas: 0,
      };
      setQuadras((prev) => [...prev, novaQuadra]);
      toast({
        title: "Quadra criada",
        description: "A nova quadra foi adicionada com sucesso.",
      });
    }
  };

  const handleToggleStatus = (quadra: typeof quadrasIniciais[0]) => {
    setQuadraSelecionada(quadra);
    setBlockDialogOpen(true);
  };

  const handleConfirmToggleStatus = (data: {
    agendar: boolean;
    dataReabertura?: Date;
    horaReabertura?: string;
  }) => {
    if (!quadraSelecionada) return;

    const isBlocking = quadraSelecionada.status === "disponivel";
    
    setQuadras((prev) =>
      prev.map((q) =>
        q.id === quadraSelecionada.id
          ? { ...q, status: q.status === "disponivel" ? "bloqueada" : "disponivel" }
          : q
      )
    );

    let message = isBlocking ? "Quadra bloqueada com sucesso" : "Quadra ativada com sucesso";
    
    if (isBlocking && data.agendar && data.dataReabertura) {
      message += `. Reabertura agendada para ${data.dataReabertura.toLocaleDateString()} às ${data.horaReabertura}`;
    }

    toast({
      title: isBlocking ? "Quadra Bloqueada" : "Quadra Ativada",
      description: message,
    });
  };

  const handleDuplicate = (quadra: typeof quadrasIniciais[0]) => {
    const novaQuadra = {
      ...quadra,
      id: Math.max(...quadras.map((q) => q.id)) + 1,
      nome: `${quadra.nome} (Cópia)`,
      totalReservas: 0,
    };
    setQuadras((prev) => [...prev, novaQuadra]);
    toast({
      title: "Quadra duplicada",
      description: "Uma cópia da quadra foi criada com sucesso.",
    });
  };

  const handleAddPromotion = (quadra: typeof quadrasIniciais[0]) => {
    setQuadraSelecionada(quadra);
    setPromotionDialogOpen(true);
  };

  const handleSavePromotion = (promotion: any) => {
    if (!quadraSelecionada) return;

    setQuadras((prev) =>
      prev.map((q) =>
        q.id === quadraSelecionada.id
          ? {
              ...q,
              promocoes: [...(q.promocoes || []), promotion],
            }
          : q
      )
    );

    toast({
      title: "Promoção criada",
      description: "A promoção foi adicionada à quadra com sucesso.",
    });
  };

  // Filtrar e ordenar quadras
  const quadrasFiltradas = useMemo(() => {
    let resultado = [...quadras];

    // Busca por nome
    if (searchTerm) {
      resultado = resultado.filter((q) =>
        q.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por esporte
    if (sportFilter !== "todos") {
      resultado = resultado.filter((q) => q.tipo === sportFilter);
    }

    // Filtro por status
    if (statusFilter !== "todos") {
      resultado = resultado.filter((q) => q.status === statusFilter);
    }

    // Ordenação
    switch (sortBy) {
      case "preco-asc":
        resultado.sort((a, b) => a.preco - b.preco);
        break;
      case "preco-desc":
        resultado.sort((a, b) => b.preco - a.preco);
        break;
      case "mais-reservada":
        resultado.sort((a, b) => (b.totalReservas || 0) - (a.totalReservas || 0));
        break;
      default:
        resultado.sort((a, b) => a.nome.localeCompare(b.nome));
    }

    return resultado;
  }, [quadras, searchTerm, sportFilter, statusFilter, sortBy]);

  const quadraMaisReservada = useMemo(() => {
    return quadras.reduce((max, q) =>
      (q.totalReservas || 0) > (max.totalReservas || 0) ? q : max
    );
  }, [quadras]);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quadras</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as quadras da sua arena
          </p>
        </div>
        <Button onClick={handleAddQuadra}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Quadra
        </Button>
      </div>

      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sportFilter={sportFilter}
        onSportFilterChange={setSportFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      {quadrasFiltradas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhuma quadra encontrada com os filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quadrasFiltradas.map((quadra) => (
            <QuadraCard
              key={quadra.id}
              quadra={quadra}
              onEdit={() => handleEditQuadra(quadra)}
              onToggleStatus={() => handleToggleStatus(quadra)}
              onAddPromotion={() => handleAddPromotion(quadra)}
              onDuplicate={() => handleDuplicate(quadra)}
              isMostBooked={quadra.id === quadraMaisReservada.id && sortBy === "mais-reservada"}
            />
          ))}
        </div>
      )}

      <EditQuadraDialog
        quadra={quadraSelecionada}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveQuadra}
      />

      <PromotionDialog
        open={promotionDialogOpen}
        onOpenChange={setPromotionDialogOpen}
        onSave={handleSavePromotion}
      />

      <BlockScheduleDialog
        open={blockDialogOpen}
        onOpenChange={setBlockDialogOpen}
        quadraNome={quadraSelecionada?.nome || ""}
        isBlocking={quadraSelecionada?.status === "disponivel"}
        onConfirm={handleConfirmToggleStatus}
      />
    </div>
  );
};

export default Quadras;
