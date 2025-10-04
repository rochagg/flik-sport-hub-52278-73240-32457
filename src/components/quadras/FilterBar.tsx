import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sportFilter: string;
  onSportFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
}

export function FilterBar({
  searchTerm,
  onSearchChange,
  sportFilter,
  onSportFilterChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
}: FilterBarProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={sportFilter} onValueChange={onSportFilterChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por esporte" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os esportes</SelectItem>
          <SelectItem value="Futebol Society">Futebol Society</SelectItem>
          <SelectItem value="Beach Tennis">Beach Tennis</SelectItem>
          <SelectItem value="Tênis">Tênis</SelectItem>
          <SelectItem value="Padel">Padel</SelectItem>
          <SelectItem value="Vôlei">Vôlei</SelectItem>
          <SelectItem value="Futevôlei">Futevôlei</SelectItem>
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os status</SelectItem>
          <SelectItem value="disponivel">Apenas Ativas</SelectItem>
          <SelectItem value="bloqueada">Apenas Bloqueadas</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={onSortByChange}>
        <SelectTrigger>
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="nome">Nome</SelectItem>
          <SelectItem value="preco-asc">Menor Preço</SelectItem>
          <SelectItem value="preco-desc">Maior Preço</SelectItem>
          <SelectItem value="mais-reservada">Mais Reservada</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
