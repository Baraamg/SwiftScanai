
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export function Header() {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 gap-4">
        <div className="ml-auto flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground hidden sm:inline-block">
                {user?.email || ""}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={signOut}
              title={t("sidebar.logout")}
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">{t("sidebar.logout")}</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
