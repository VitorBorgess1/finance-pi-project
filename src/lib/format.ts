export const BRL = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  });
  
  export const formatBRL = (n: number) => BRL.format(n || 0);
  
  export const formatCompact = (n: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: Math.abs(n) >= 10000 ? "compact" : "standard",
      maximumFractionDigits: 1,
    }).format(n || 0);
  
  export const todayLabel = () =>
    new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date());
  