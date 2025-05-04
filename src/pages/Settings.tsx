
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, User, Moon, Sun, Languages, Lock, Building, CheckCircle
} from "lucide-react";
import supabase from "@/lib/supabaseClient";

export default function Settings() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: "",
    hospital: "",
    phone: ""
  });
  const [isProfileEditing, setIsProfileEditing] = useState(false);

  const fetchUserProfile = async () => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('name, phone_number, hospital_affiliation')
        .eq('email', user.email)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      if (data) {
        setUserProfile({
          name: data.name || "",
          hospital: data.hospital_affiliation || "",
          phone: data.phone_number || ""
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  // Fetch user profile on component mount
  useState(() => {
    fetchUserProfile();
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      
      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.email) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('doctors')
        .update({
          name: userProfile.name,
          hospital_affiliation: userProfile.hospital,
          phone_number: userProfile.phone
        })
        .eq('email', user.email);
        
      if (error) {
        throw error;
      }
      
      setIsProfileEditing(false);
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold noto-sans">{t("settings.title")}</h1>
        
        <Tabs defaultValue="profile">
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {t("settings.profile")}
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              {t("settings.appearance")}
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              {t("settings.security")}
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.profile")}</CardTitle>
                <CardDescription>
                  {t("settings.manageProfile")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="text-lg">
                        {user?.email?.substring(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1 space-y-4 w-full">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t("settings.name")}</Label>
                        <Input 
                          id="name" 
                          value={userProfile.name} 
                          onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                          disabled={!isProfileEditing}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">{t("auth.email")}</Label>
                        <Input 
                          id="email" 
                          value={user?.email || ""} 
                          disabled
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">{t("settings.phone")}</Label>
                          <Input 
                            id="phone" 
                            value={userProfile.phone} 
                            onChange={(e) => setUserProfile(prev => ({ ...prev, phone: e.target.value }))}
                            disabled={!isProfileEditing}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="hospital">{t("settings.hospital")}</Label>
                          <Input 
                            id="hospital" 
                            value={userProfile.hospital} 
                            onChange={(e) => setUserProfile(prev => ({ ...prev, hospital: e.target.value }))}
                            disabled={!isProfileEditing}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {isProfileEditing ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsProfileEditing(false)}
                    >
                      {t("actions.cancel")}
                    </Button>
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {t("actions.save")}
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => setIsProfileEditing(true)}
                    className="ml-auto"
                  >
                    {t("actions.edit")}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.appearance")}</CardTitle>
                <CardDescription>
                  {t("settings.appearanceDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{t("settings.theme")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card 
                      className={`cursor-pointer hover:border-primary transition-colors ${theme === 'light' ? 'border-primary' : ''}`}
                      onClick={() => theme === 'dark' && toggleTheme()}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center">
                          <Sun className="h-6 w-6 text-yellow-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{t("settings.light")}</h4>
                          <p className="text-sm text-muted-foreground">{t("settings.lightDesc")}</p>
                        </div>
                        {theme === 'light' && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card 
                      className={`cursor-pointer hover:border-primary transition-colors ${theme === 'dark' ? 'border-primary' : ''}`}
                      onClick={() => theme === 'light' && toggleTheme()}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center">
                          <Moon className="h-6 w-6 text-slate-200" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{t("settings.dark")}</h4>
                          <p className="text-sm text-muted-foreground">{t("settings.darkDesc")}</p>
                        </div>
                        {theme === 'dark' && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{t("settings.language")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card 
                      className={`cursor-pointer hover:border-primary transition-colors ${language === 'en' ? 'border-primary' : ''}`}
                      onClick={() => setLanguage('en')}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-lg font-bold text-blue-600">En</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{t("settings.english")}</h4>
                          <p className="text-sm text-muted-foreground">English</p>
                        </div>
                        {language === 'en' && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card 
                      className={`cursor-pointer hover:border-primary transition-colors ${language === 'ar' ? 'border-primary' : ''}`}
                      onClick={() => setLanguage('ar')}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-lg font-bold text-green-600">ع</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{t("settings.arabic")}</h4>
                          <p className="text-sm text-muted-foreground">العربية</p>
                        </div>
                        {language === 'ar' && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <form onSubmit={handlePasswordChange}>
                <CardHeader>
                  <CardTitle>{t("settings.changePassword")}</CardTitle>
                  <CardDescription>
                    {t("settings.passwordDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">{t("settings.currentPassword")}</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">{t("settings.newPassword")}</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">{t("settings.confirmPassword")}</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={loading} className="flex items-center gap-2">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                    {t("settings.changePassword")}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
