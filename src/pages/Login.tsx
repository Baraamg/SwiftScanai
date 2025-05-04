
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { DashboardPreview } from "@/components/login/DashboardPreview";
import { Mail, Lock, ArrowRight, Home } from "lucide-react";

export default function Login() {
  const { user, signIn, loading } = useAuth();
  const { t, language, dir } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (user) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: t("auth.error"),
        description: t("auth.emailRequired"),
        variant: "destructive",
      });
      return;
    }

    if (!password) {
      toast({
        title: t("auth.error"),
        description: t("auth.passwordRequired"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error, success } = await signIn(email, password);
      
      if (error) {
        toast({
          title: t("auth.error"),
          description: t("auth.invalidCredentials"),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t("auth.error"),
        description: t("auth.invalidCredentials"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background animate-fade-in">
      {/* Theme and Language toggles in top right corner */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      {/* Left column: Login Form (shown on the left for LTR, right for RTL) */}
      <div className={`flex-1 flex items-center justify-center p-6 order-2 ${language === "ar" ? "md:order-1" : "md:order-1"}`}>
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Home className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">{t("auth.signin")}</h1>
            <p className="text-muted-foreground">{t("app.title")}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="block">{t("auth.email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  placeholder="doctor@example.com"
                  type="email"
                  autoComplete="email"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t("auth.rememberMe")}
              </label>
            </div>

            <Button 
              type="submit"
              className="w-full group"
              disabled={isLoading || loading}
              size="lg"
            >
              {isLoading ? "..." : t("auth.signin")}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <div className="text-center text-xs text-muted-foreground">
              {t("auth.contactSupport")}
            </div>
          </form>
        </div>
      </div>

      {/* Right column: Welcome & Dashboard Preview */}
      <div className={`hidden md:flex flex-1 bg-primary/10 items-center justify-center p-10 ${language === "ar" ? "md:order-2" : "md:order-2"}`}>
        <div className="w-full max-w-lg">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">{t("login.welcome")}</h1>
            <p className="text-lg text-muted-foreground">{t("login.mission")}</p>
            
            <DashboardPreview />
          </div>
        </div>
      </div>
    </div>
  );
}
