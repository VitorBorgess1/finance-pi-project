import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children?: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-md mx-auto w-full px-5 pt-2 pb-32 safe-top safe-x animate-fade-in">
        {children ?? <Outlet />}
      </main>
      <BottomNav />
    </div>
  );
}
