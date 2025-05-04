
import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { dir } = useLanguage();
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col bg-background text-foreground`} dir={dir} data-theme={theme}>
      <div className="hidden md:block md:fixed inset-y-0 start-0 w-64 bg-sidebar border-e border-sidebar-border z-30">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col md:ms-64">
        <Header />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
