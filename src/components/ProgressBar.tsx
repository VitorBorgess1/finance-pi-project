import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100+
  state: "ok" | "warning" | "danger";
  className?: string;
}

export function ProgressBar({ value, state, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const color =
    state === "danger"
      ? "bg-destructive"
      : state === "warning"
      ? "bg-warning"
      : "bg-foreground";

  return (
    <div className={cn("h-1.5 w-full bg-muted rounded-full overflow-hidden", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500", color)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
