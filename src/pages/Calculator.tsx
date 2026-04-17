import { useState, useEffect } from "react";
import { useFinance } from "@/store/finance";
import { formatBRL } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const PRESETS = [
  { label: "50 / 30 / 20", values: { fixed: 50, lifestyle: 30, invest: 20 } },
  { label: "60 / 20 / 20", values: { fixed: 60, lifestyle: 20, invest: 20 } },
  { label: "40 / 30 / 30", values: { fixed: 40, lifestyle: 30, invest: 30 } },
];

export default function Calculator() {
  const income = useFinance((s) => s.income);
  const split = useFinance((s) => s.split);
  const setIncome = useFinance((s) => s.setIncome);
  const setSplit = useFinance((s) => s.setSplit);

  const [incomeInput, setIncomeInput] = useState(income.toString());
  const [fixed, setFixed] = useState(split.fixed);
  const [lifestyle, setLifestyle] = useState(split.lifestyle);
  const invest = Math.max(0, 100 - fixed - lifestyle);

  useEffect(() => setIncomeInput(income.toString()), [income]);

  const apply = () => {
    const value = parseFloat(incomeInput.replace(",", "."));
    if (!value || value <= 0) {
      toast.error("Informe uma renda válida");
      return;
    }
    setIncome(value);
    setSplit({ fixed, lifestyle, invest });
    toast.success("Plano salvo");
  };

  const usePreset = (p: typeof PRESETS[number]["values"]) => {
    setFixed(p.fixed);
    setLifestyle(p.lifestyle);
  };

  const incomeNum = parseFloat(incomeInput.replace(",", ".")) || 0;

  return (
    <>
      <header className="flex items-center justify-between pt-4 pb-6">
        <Link to="/" className="h-10 w-10 rounded-full hover:bg-secondary flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-medium">Renda doméstica</h1>
        <ThemeToggle />
      </header>

      <section className="card-soft p-6 animate-slide-up">
        <label className="text-xs uppercase tracking-widest text-muted-foreground">Renda mensal</label>
        <div className="relative mt-2">
          <span className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground text-2xl">R$</span>
          <Input
            value={incomeInput}
            onChange={(e) => setIncomeInput(e.target.value)}
            type="text"
            inputMode="decimal"
            className="h-14 pl-12 text-3xl font-semibold tabular-nums border-0 bg-transparent focus-visible:ring-0 px-0"
          />
        </div>
      </section>

      <section className="mt-3 card-soft p-6 space-y-6 animate-slide-up">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Sugestões</p>
          <div className="flex gap-2 flex-wrap">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => usePreset(p.values)}
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-muted hover:bg-secondary transition-colors"
              >
                {p.label}
              </button>
            ))}
            <button
              onClick={() => { setFixed(50); setLifestyle(30); }}
              className="px-3 py-1.5 text-xs font-medium rounded-full bg-muted hover:bg-secondary transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="h-3 w-3" /> Resetar
            </button>
          </div>
        </div>

        <BucketSlider
          label="Gastos fixos"
          hint="Aluguel, contas, mercado essencial"
          color="hsl(var(--foreground))"
          value={fixed}
          onChange={(v) => {
            const next = Math.min(v, 100 - lifestyle);
            setFixed(next);
          }}
          amount={(incomeNum * fixed) / 100}
        />

        <BucketSlider
          label="Estilo de vida"
          hint="Lazer, restaurantes, assinaturas"
          color="hsl(var(--muted-foreground))"
          value={lifestyle}
          onChange={(v) => {
            const next = Math.min(v, 100 - fixed);
            setLifestyle(next);
          }}
          amount={(incomeNum * lifestyle) / 100}
        />

        <div>
          <div className="flex items-baseline justify-between mb-1">
            <div>
              <p className="text-sm font-medium">Investimentos</p>
              <p className="text-[11px] text-muted-foreground">Calculado automaticamente</p>
            </div>
            <p className="text-sm font-semibold tabular-nums">{invest}%</p>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-success rounded-full transition-all" style={{ width: `${invest}%` }} />
          </div>
          <p className="text-xs text-muted-foreground tabular-nums mt-1.5">{formatBRL((incomeNum * invest) / 100)}</p>
        </div>
      </section>

      <Button onClick={apply} className="w-full h-12 rounded-2xl mt-4 text-base font-medium">
        Salvar plano
      </Button>
    </>
  );
}

function BucketSlider({
  label,
  hint,
  value,
  onChange,
  amount,
}: {
  label: string;
  hint: string;
  color: string;
  value: number;
  onChange: (v: number) => void;
  amount: number;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-[11px] text-muted-foreground">{hint}</p>
        </div>
        <p className="text-sm font-semibold tabular-nums">{value}%</p>
      </div>
      <Slider
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        max={100}
        step={1}
        className="my-3"
      />
      <p className="text-xs text-muted-foreground tabular-nums">{formatBRL(amount)}</p>
    </div>
  );
}
