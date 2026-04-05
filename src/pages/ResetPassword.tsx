import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, KeyRound, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) setIsRecovery(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => { if (event === "PASSWORD_RECOVERY") setIsRecovery(true); });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast({ title: t("resetPassword", "error"), description: t("resetPassword", "passwordsNoMatch"), variant: "destructive" }); return; }
    if (password.length < 6) { toast({ title: t("resetPassword", "error"), description: t("resetPassword", "tooShort"), variant: "destructive" }); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast({ title: t("resetPassword", "success") });
      setTimeout(() => navigate("/"), 2000);
    } catch (error: any) {
      toast({ title: t("resetPassword", "error"), description: error.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  if (!isRecovery) return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-foreground">{t("resetPassword", "invalidLink")}</CardTitle>
          <CardDescription className="text-muted-foreground">{t("resetPassword", "invalidLinkDesc")}</CardDescription>
        </CardHeader>
        <CardContent><Button className="w-full" onClick={() => navigate("/login")}>{t("resetPassword", "backToLogin")}</Button></CardContent>
      </Card>
    </div>
  );

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-2"><CheckCircle className="h-12 w-12 text-green-500" /></div>
          <CardTitle className="text-2xl text-foreground">{t("resetPassword", "passwordChanged")}</CardTitle>
          <CardDescription className="text-muted-foreground">{t("resetPassword", "redirecting")}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="gradient-glow absolute top-0 left-0 right-0 h-96 pointer-events-none" />
      <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2"><div className="p-2 rounded-lg bg-primary/10"><KeyRound className="h-6 w-6 text-primary" /></div></div>
          <CardTitle className="text-2xl text-foreground">{t("resetPassword", "newPassword")}</CardTitle>
          <CardDescription className="text-muted-foreground">{t("resetPassword", "newPasswordDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">{t("resetPassword", "newPassword")}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder={t("resetPassword", "minChars")} className="bg-input border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">{t("resetPassword", "confirmPassword")}</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} placeholder={t("resetPassword", "repeatPassword")} className="bg-input border-border" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("resetPassword", "savePassword")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
