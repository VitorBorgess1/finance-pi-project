import { NavLink as RouterNavLink } from "react-router-dom";
import { Home, Calculator, LayoutGrid, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Início", icon: Home, end: true },
  { to: "/calculadora", label: "Calculadora", icon: Calculator },
  { to: "/categorias", label: "Categorias", icon: LayoutGrid },
  { to: "/lancamentos", label: "Histórico", icon: Receipt },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 safe-bottom bg-background/85 backdrop-blur-xl border-t border-border">
      <ul className="flex items-stretch justify-around max-w-md mx-auto px-2 pt-2 pb-2">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <RouterNavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 py-2 px-1 rounded-2xl transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn("h-5 w-5", isActive && "stroke-[2.25]")} />
                  <span className="text-[10px] font-medium tracking-wide">{label}</span>
                </>
              )}
            </RouterNavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
