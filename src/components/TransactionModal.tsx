import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFinance } from "@/store/finance";
import { toast } from "sonner";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function TransactionModal({ open, onOpenChange }: Props) {
  const categories = useFinance((s) => s.categories);
  const addTransaction = useFinance((s) => s.addTransaction);

  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id ?? "");

  const reset = () => {
    setAmount("");
    setDescription("");
    setType("expense");
  };

  const submit = () => {
    const value = parseFloat(amount.replace(",", "."));
    if (!value || value <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    if (type === "expense" && !categoryId) {
      toast.error("Escolha uma categoria");
      return;
    }
    addTransaction({
      type,
      amount: value,
      categoryId: type === "expense" ? categoryId : null,
      description: description.trim() || (type === "income" ? "Receita" : "Despesa"),
      date: new Date().toISOString(),
    });
    toast.success(type === "income" ? "Receita registrada" : "Despesa registrada");
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="rounded-3xl border-border max-w-md p-6">
        <DialogHeader className="text-left space-y-1">
          <DialogTitle className="text-2xl font-semibold tracking-tight">Novo lançamento</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Registre rapidamente uma entrada ou saída.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 mt-2 p-1 bg-muted rounded-2xl">
          <button
            onClick={() => setType("expense")}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
              type === "expense" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            <ArrowDownLeft className="h-4 w-4" /> Despesa
          </button>
          <button
            onClick={() => setType("income")}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
              type === "income" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            <ArrowUpRight className="h-4 w-4" /> Receita
          </button>
        </div>

        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-xs uppercase tracking-wider text-muted-foreground">Valor</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">R$</span>
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-14 pl-12 text-2xl font-semibold tabular-nums rounded-2xl bg-muted border-0"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="desc" className="text-xs uppercase tracking-wider text-muted-foreground">Descrição</Label>
            <Input
              id="desc"
              placeholder={type === "income" ? "Salário, freelance…" : "Mercado, café…"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-12 rounded-2xl bg-muted border-0"
            />
          </div>

          {type === "expense" && (
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Categoria</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategoryId(c.id)}
                    className={cn(
                      "px-3 py-2 rounded-2xl text-sm font-medium border transition-colors",
                      categoryId === c.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-foreground border-transparent hover:border-border"
                    )}
                  >
                    <span className="mr-1.5">{c.emoji}</span>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button onClick={submit} className="w-full h-12 rounded-2xl text-base font-medium mt-2">
          Salvar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
