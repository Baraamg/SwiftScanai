
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { BarChart2, History, Home, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function Sidebar() {
  const { t } = useLanguage();
  const { signOut } = useAuth();

  return (
    <div className="h-full bg-sidebar border-r flex flex-col fixed w-64">
      <div className="py-4 flex-1 overflow-hidden">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-sidebar-foreground noto-sans">
            {t("app.title")}
          </h2>
          <div className="space-y-1">
            <Link to="/">
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground"
              >
                <Home className="me-2 h-4 w-4" />
                <span className="noto-sans">{t("sidebar.dashboard")}</span>
              </Button>
            </Link>
            <Link to="/cases">
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground"
              >
                <BarChart2 className="me-2 h-4 w-4" />
                <span className="noto-sans">{t("sidebar.cases")}</span>
              </Button>
            </Link>
            <Link to="/history">
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground"
              >
                <History className="me-2 h-4 w-4" />
                <span className="noto-sans">{t("sidebar.history")}</span>
              </Button>
            </Link>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-sidebar-foreground noto-sans">
            {t("settings.title")}
          </h2>
          <div className="space-y-1">
            <Link to="/settings">
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground"
              >
                <Settings className="me-2 h-4 w-4" />
                <span className="noto-sans">{t("sidebar.settings")}</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground"
              onClick={signOut}
            >
              <LogOut className="me-2 h-4 w-4" />
              <span className="noto-sans">{t("sidebar.logout")}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
