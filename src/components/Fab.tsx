import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FabProps {
  onClick: () => void;
  className?: string;
}

export function Fab({ onClick, className }: FabProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Novo lançamento"
      className={cn(
        "fixed right-5 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground",
        "flex items-center justify-center transition-transform active:scale-95",
        "hover:scale-105",
        className
      )}
      style={{
        bottom: "calc(5.5rem + env(safe-area-inset-bottom))",
        boxShadow: "var(--shadow-fab)",
      }}
    >
      <Plus className="h-6 w-6" strokeWidth={2.5} />
    </button>
  );
}
