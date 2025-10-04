import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Upload, Trash2 } from "lucide-react";
import { TimeSlotSelector } from "./quadras/TimeSlotSelector";
import { toast } from "@/hooks/use-toast";

const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const esportesComRaquete = ["Beach Tennis", "Tênis", "Padel"];

interface TimeSlot {
  inicio: string;
  fim: string;
}

interface Quadra {
  id: number;
  nome: string;
  tipo: string;
  preco: number;
  status: string;
  imagem: string;
  fotos?: string[];
  horariosPorDia?: Record<string, { slots: TimeSlot[]; disabled: boolean }>;
  mensalistas?: Array<{ id: number; nome: string; dia: string; horario: string; dataInicio?: string; dataFim?: string }>;
  precosEspeciais?: Array<{ id: number; dia: string; horario: string; valor: number; tipo: "fixo" | "desconto" }>;
  adicionais?: Array<{ nome: string; valor: number; enabled: boolean }>;
}

interface EditQuadraDialogProps {
  quadra: Quadra | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
}

const quadraSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  tipo: z.string().min(1, "Selecione o tipo de esporte"),
  precoBase: z.number().min(1, "Valor deve ser maior que zero"),
  status: z.string(),
});

export function EditQuadraDialog({ quadra, open, onOpenChange, onSave }: EditQuadraDialogProps) {
  const [fotos, setFotos] = useState<string[]>([]);
  const [horariosPorDia, setHorariosPorDia] = useState<Record<string, { slots: TimeSlot[]; disabled: boolean }>>({});
  const [mensalistas, setMensalistas] = useState<Array<{ id: number; nome: string; dia: string; horario: string; dataInicio?: string; dataFim?: string }>>([]);
  const [precosEspeciais, setPrecosEspeciais] = useState<Array<{ id: number; dia: string; horario: string; valor: number; tipo: "fixo" | "desconto" }>>([]);
  const [adicionais, setAdicionais] = useState<Array<{ nome: string; valor: number; enabled: boolean }>>([]);

  const form = useForm({
    resolver: zodResolver(quadraSchema),
    defaultValues: {
      nome: "",
      tipo: "",
      precoBase: 100,
      status: "disponivel",
    },
  });

  // Preencher automaticamente quando editar
  useEffect(() => {
    if (quadra && open) {
      form.reset({
        nome: quadra.nome,
        tipo: quadra.tipo,
        precoBase: quadra.preco,
        status: quadra.status,
      });
      
      setFotos(quadra.fotos || (quadra.imagem ? [quadra.imagem] : []));
      setHorariosPorDia(quadra.horariosPorDia || {});
      setMensalistas(quadra.mensalistas || []);
      setPrecosEspeciais(quadra.precosEspeciais || []);
      
      // Configurar adicionais
      const baseAdicionais = [
        { nome: "Bola", valor: 10, enabled: false },
        { nome: "Coletes", valor: 15, enabled: false },
      ];
      
      if (esportesComRaquete.includes(quadra.tipo)) {
        baseAdicionais.push({ nome: "Raquetes", valor: 20, enabled: false });
      }
      
      if (quadra.adicionais) {
        // Mesclar adicionais salvos com os base
        const merged = [...baseAdicionais];
        quadra.adicionais.forEach((saved) => {
          const index = merged.findIndex((a) => a.nome === saved.nome);
          if (index >= 0) {
            merged[index] = saved;
          } else {
            merged.push(saved);
          }
        });
        setAdicionais(merged);
      } else {
        setAdicionais(baseAdicionais);
      }
    } else if (!quadra && open) {
      // Resetar para nova quadra
      form.reset({
        nome: "",
        tipo: "",
        precoBase: 100,
        status: "disponivel",
      });
      setFotos([]);
      setHorariosPorDia({});
      setMensalistas([]);
      setPrecosEspeciais([]);
      setAdicionais([
        { nome: "Bola", valor: 10, enabled: false },
        { nome: "Coletes", valor: 15, enabled: false },
      ]);
    }
  }, [quadra, open, form]);

  const tipoEsporte = form.watch("tipo");
  
  // Atualizar adicionais quando tipo de esporte mudar
  useEffect(() => {
    if (esportesComRaquete.includes(tipoEsporte)) {
      setAdicionais((prev) => {
        if (!prev.find((a) => a.nome === "Raquetes")) {
          return [...prev, { nome: "Raquetes", valor: 20, enabled: false }];
        }
        return prev;
      });
    } else {
      setAdicionais((prev) => prev.filter((a) => a.nome !== "Raquetes"));
    }
  }, [tipoEsporte]);

  const handleAddFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (fotos.length + files.length > 5) {
      toast({
        title: "Limite excedido",
        description: "Máximo de 5 fotos permitido",
        variant: "destructive",
      });
      return;
    }

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotos((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFoto = (index: number) => {
    setFotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddMensalista = () => {
    const novoId = Math.max(0, ...mensalistas.map((m) => m.id)) + 1;
    setMensalistas((prev) => [...prev, { id: novoId, nome: "", dia: "Segunda", horario: "" }]);
  };

  const handleRemoveMensalista = (id: number) => {
    setMensalistas((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddPrecoEspecial = () => {
    const novoId = Math.max(0, ...precosEspeciais.map((p) => p.id)) + 1;
    setPrecosEspeciais((prev) => [...prev, { id: novoId, dia: "Segunda", horario: "", valor: 0, tipo: "fixo" }]);
  };

  const handleRemovePrecoEspecial = (id: number) => {
    setPrecosEspeciais((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddAdicionalCustom = () => {
    const nome = prompt("Nome do adicional:");
    if (!nome) return;
    const valorStr = prompt("Valor (R$):");
    if (!valorStr) return;
    const valor = parseFloat(valorStr);
    if (isNaN(valor)) {
      toast({
        title: "Erro",
        description: "Valor inválido",
        variant: "destructive",
      });
      return;
    }
    
    setAdicionais((prev) => [...prev, { nome, valor, enabled: true }]);
  };

  const handleCopyHorarios = (fromDay: string, toDay: string) => {
    const sourceSchedule = horariosPorDia[fromDay];
    if (sourceSchedule) {
      setHorariosPorDia((prev) => ({
        ...prev,
        [toDay]: { ...sourceSchedule },
      }));
    }
  };

  const handleSubmit = form.handleSubmit((data) => {
    if (fotos.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione ao menos 1 foto",
        variant: "destructive",
      });
      return;
    }

    const quadraCompleta = {
      ...data,
      fotos,
      imagem: fotos[0],
      horariosPorDia,
      mensalistas,
      precosEspeciais,
      adicionais: adicionais.filter((a) => a.enabled),
    };

    onSave(quadraCompleta);
    toast({
      title: "Sucesso",
      description: "Quadra salva com sucesso!",
    });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {quadra ? "Editar Quadra" : "Adicionar Nova Quadra"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="fotos" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="fotos">Fotos</TabsTrigger>
              <TabsTrigger value="horarios">Horários</TabsTrigger>
              <TabsTrigger value="mensalistas">Mensalistas</TabsTrigger>
              <TabsTrigger value="valores">Valores</TabsTrigger>
              <TabsTrigger value="adicionais">Adicionais</TabsTrigger>
            </TabsList>

            <TabsContent value="fotos" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome da Quadra</Label>
                  <Input {...form.register("nome")} placeholder="Ex: Quadra Society 1" />
                  {form.formState.errors.nome && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.nome.message}</p>
                  )}
                </div>

                <div>
                  <Label>Tipo de Esporte</Label>
                  <Select value={form.watch("tipo")} onValueChange={(value) => form.setValue("tipo", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o esporte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Futebol Society">Futebol Society</SelectItem>
                      <SelectItem value="Beach Tennis">Beach Tennis</SelectItem>
                      <SelectItem value="Tênis">Tênis</SelectItem>
                      <SelectItem value="Padel">Padel</SelectItem>
                      <SelectItem value="Vôlei">Vôlei</SelectItem>
                      <SelectItem value="Futevôlei">Futevôlei</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.tipo && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.tipo.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>Status da Quadra</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.watch("status") === "disponivel"}
                    onCheckedChange={(checked) =>
                      form.setValue("status", checked ? "disponivel" : "bloqueada")
                    }
                  />
                  <span className="text-sm">
                    {form.watch("status") === "disponivel" ? "Ativa" : "Inativa"}
                  </span>
                </div>
              </div>

              <div>
                <Label>Fotos da Quadra (máximo 5)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Adicione fotos de alta qualidade da quadra. Ao menos 1 foto é obrigatória.
                </p>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  {fotos.map((foto, index) => (
                    <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border">
                      <img src={foto} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveFoto(index)}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {index === 0 && (
                        <Badge className="absolute bottom-2 left-2 bg-primary">Principal</Badge>
                      )}
                    </div>
                  ))}

                  {fotos.length < 5 && (
                    <label className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Adicionar foto</span>
                      <input type="file" accept="image/*" multiple onChange={handleAddFoto} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="horarios" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Configure os horários disponíveis para agendamento. Use horários personalizados e copie entre os dias.
              </p>

              {diasSemana.map((dia) => (
                <TimeSlotSelector
                  key={dia}
                  dia={dia}
                  slots={horariosPorDia[dia]?.slots || []}
                  isDisabled={horariosPorDia[dia]?.disabled || false}
                  onSlotsChange={(slots) => {
                    setHorariosPorDia((prev) => ({
                      ...prev,
                      [dia]: { slots, disabled: prev[dia]?.disabled || false },
                    }));
                  }}
                  onDisabledChange={(disabled) => {
                    setHorariosPorDia((prev) => ({
                      ...prev,
                      [dia]: { slots: prev[dia]?.slots || [], disabled },
                    }));
                  }}
                  mensalistasHorarios={mensalistas
                    .filter((m) => m.dia === dia)
                    .map((m) => m.horario)}
                />
              ))}
            </TabsContent>

            <TabsContent value="mensalistas" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Informe os mensalistas e seus horários fixos. Esses horários ficarão bloqueados para novas reservas.
                </p>
              </div>

              {mensalistas.map((mensalista, index) => (
                <div key={mensalista.id} className="border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Nome (interno)</Label>
                      <Input
                        placeholder="Ex: João Silva"
                        value={mensalista.nome}
                        onChange={(e) => {
                          const novos = [...mensalistas];
                          novos[index].nome = e.target.value;
                          setMensalistas(novos);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Dia da Semana</Label>
                      <Select
                        value={mensalista.dia}
                        onValueChange={(value) => {
                          const novos = [...mensalistas];
                          novos[index].dia = value;
                          setMensalistas(novos);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {diasSemana.map((dia) => (
                            <SelectItem key={dia} value={dia}>
                              {dia}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Horário</Label>
                      <Input
                        placeholder="08:00"
                        value={mensalista.horario}
                        onChange={(e) => {
                          const novos = [...mensalistas];
                          novos[index].horario = e.target.value;
                          setMensalistas(novos);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Data Início</Label>
                      <Input
                        type="date"
                        value={mensalista.dataInicio || ""}
                        onChange={(e) => {
                          const novos = [...mensalistas];
                          novos[index].dataInicio = e.target.value;
                          setMensalistas(novos);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Data Término</Label>
                      <Input
                        type="date"
                        value={mensalista.dataFim || ""}
                        onChange={(e) => {
                          const novos = [...mensalistas];
                          novos[index].dataFim = e.target.value;
                          setMensalistas(novos);
                        }}
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveMensalista(mensalista.id)}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover Mensalista
                  </Button>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={handleAddMensalista} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Mensalista
              </Button>
            </TabsContent>

            <TabsContent value="valores" className="space-y-4 mt-4">
              <div>
                <Label>Valor Padrão por Hora (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...form.register("precoBase", { valueAsNumber: true })}
                  placeholder="140.00"
                />
                {form.formState.errors.precoBase && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.precoBase.message}</p>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Preços Especiais por Horário</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure valores diferenciados para horários específicos
                </p>

                {precosEspeciais.map((preco, index) => (
                  <div key={preco.id} className="border rounded-lg p-4 mb-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Dia da Semana</Label>
                        <Select
                          value={preco.dia}
                          onValueChange={(value) => {
                            const novos = [...precosEspeciais];
                            novos[index].dia = value;
                            setPrecosEspeciais(novos);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {diasSemana.map((dia) => (
                              <SelectItem key={dia} value={dia}>
                                {dia}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Horário</Label>
                        <Input
                          placeholder="19:00"
                          value={preco.horario}
                          onChange={(e) => {
                            const novos = [...precosEspeciais];
                            novos[index].horario = e.target.value;
                            setPrecosEspeciais(novos);
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Tipo de Valor Especial</Label>
                        <Select
                          value={preco.tipo}
                          onValueChange={(value: "fixo" | "desconto") => {
                            const novos = [...precosEspeciais];
                            novos[index].tipo = value;
                            setPrecosEspeciais(novos);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixo">Valor Fixo (R$)</SelectItem>
                            <SelectItem value="desconto">Desconto (%)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>
                          {preco.tipo === "fixo" ? "Valor (R$)" : "Desconto (%)"}
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={preco.tipo === "fixo" ? "180.00" : "10"}
                          value={preco.valor || ""}
                          onChange={(e) => {
                            const novos = [...precosEspeciais];
                            novos[index].valor = parseFloat(e.target.value);
                            setPrecosEspeciais(novos);
                          }}
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemovePrecoEspecial(preco.id)}
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={handleAddPrecoEspecial} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Preço Especial
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="adicionais" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Configure os itens adicionais disponíveis para esta quadra
              </p>

              <div className="space-y-3">
                {adicionais.map((adicional, index) => (
                  <div key={index} className="flex items-center gap-3 border rounded-lg p-3">
                    <input
                      type="checkbox"
                      checked={adicional.enabled}
                      onChange={(e) => {
                        const novos = [...adicionais];
                        novos[index].enabled = e.target.checked;
                        setAdicionais(novos);
                      }}
                      className="h-4 w-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{adicional.nome}</p>
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        step="0.01"
                        value={adicional.valor}
                        onChange={(e) => {
                          const novos = [...adicionais];
                          novos[index].valor = parseFloat(e.target.value) || 0;
                          setAdicionais(novos);
                        }}
                        placeholder="R$ 0.00"
                      />
                    </div>
                    {!["Bola", "Coletes", "Raquetes"].includes(adicional.nome) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setAdicionais((prev) => prev.filter((_, i) => i !== index));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button type="button" variant="outline" onClick={handleAddAdicionalCustom} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Adicional Personalizado
              </Button>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Quadra</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
