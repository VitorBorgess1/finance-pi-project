import { useState } from "react";
import { useFinance, monthlyExpensesByCategory } from "@/store/finance";
import { formatBRL } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProgressBar } from "@/components/ProgressBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getBudgetState } from "@/hooks/use-budget-alerts";
import { ArrowLeft, Plus, Trash2, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import type { Category } from "@/lib/types";
import { toast } from "sonner";

const EMOJI_OPTIONS = ["🛒","🍔","🚗","🏠","🎬","🩺","✈️","📚","💪","🎁","☕","🐾","💡","👕","💼"];

export default function Categories() {
  const categories = useFinance((s) => s.categories);
  const transactions = useFinance((s) => s.transactions);
  const addCategory = useFinance((s) => s.addCategory);
  const updateCategory = useFinance((s) => s.updateCategory);
  const removeCategory = useFinance((s) => s.removeCategory);

  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between pt-4 pb-6">
        <Link to="/" className="h-10 w-10 rounded-full hover:bg-secondary flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-medium">Categorias</h1>
        <button
          onClick={() => setCreating(true)}
          className="h-10 w-10 rounded-full hover:bg-secondary flex items-center justify-center"
          aria-label="Adicionar categoria"
        >
          <Plus className="h-5 w-5" />
        </button>
      </header>

      <div className="space-y-3">
        {categories.map((c) => {
          const spent = monthlyExpensesByCategory(transactions, c.id);
          const { state, ratio } = getBudgetState(spent, c.budget);
          return (
            <div key={c.id} className="card-soft p-5 animate-slide-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl">{c.emoji}</span>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{c.name}</p>
                    <p className={`text-xs tabular-nums ${state === "danger" ? "text-destructive" : state === "warning" ? "text-warning" : "text-muted-foreground"}`}>
                      {formatBRL(spent)} de {formatBRL(c.budget)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditing(c)}
                  className="h-9 w-9 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground"
                  aria-label="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
              <ProgressBar value={ratio * 100} state={state} className="mt-4" />
              <p className="text-[11px] text-muted-foreground mt-2 tabular-nums">
                {Math.round(ratio * 100)}% utilizado
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-3 hidden">
        <ThemeToggle />
      </div>

      <CategoryDialog
        open={creating}
        onOpenChange={setCreating}
        onSave={(data) => {
          addCategory(data);
          toast.success("Categoria criada");
          setCreating(false);
        }}
      />

      <CategoryDialog
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        category={editing ?? undefined}
        onSave={(data) => {
          if (editing) {
            updateCategory(editing.id, data);
            toast.success("Categoria atualizada");
            setEditing(null);
          }
        }}
        onDelete={
          editing
            ? () => {
                removeCategory(editing.id);
                toast.success("Categoria removida");
                setEditing(null);
              }
            : undefined
        }
      />
    </>
  );
}

function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSave,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  category?: Category;
  onSave: (data: Omit<Category, "id">) => void;
  onDelete?: () => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [emoji, setEmoji] = useState(category?.emoji ?? "🛒");
  const [budget, setBudget] = useState(category?.budget?.toString() ?? "");

  // Reset when opened
  useState(() => {
    setName(category?.name ?? "");
    setEmoji(category?.emoji ?? "🛒");
    setBudget(category?.budget?.toString() ?? "");
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (v) {
          setName(category?.name ?? "");
          setEmoji(category?.emoji ?? "🛒");
          setBudget(category?.budget?.toString() ?? "");
        }
      }}
    >
      <DialogContent className="rounded-3xl max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {category ? "Editar categoria" : "Nova categoria"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Ícone</p>
            <div className="flex gap-1.5 flex-wrap">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`h-10 w-10 rounded-2xl text-lg transition-colors ${emoji === e ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-secondary"}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Nome</p>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-2xl bg-muted border-0"
              placeholder="Ex: Mercado"
            />
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Teto mensal (R$)</p>
            <Input
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              type="text"
              inputMode="decimal"
              className="h-12 rounded-2xl bg-muted border-0 tabular-nums"
              placeholder="0,00"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          {onDelete && (
            <Button
              variant="ghost"
              onClick={onDelete}
              className="rounded-2xl text-destructive hover:text-destructive hover:bg-destructive/10"
              size="icon"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={() => {
              const b = parseFloat(budget.replace(",", "."));
              if (!name.trim() || !b || b <= 0) {
                toast.error("Preencha nome e teto válidos");
                return;
              }
              onSave({ name: name.trim(), emoji, budget: b });
            }}
            className="flex-1 h-12 rounded-2xl"
          >
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
