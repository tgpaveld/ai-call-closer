import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (forgotMode) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        toast({ title: t("login", "emailSent"), description: t("login", "checkEmail") });
        setForgotMode(false);
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: t("login", "loginSuccess") });
      } else {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        toast({ title: t("login", "registerSuccess"), description: t("login", "checkEmailConfirm") });
      }
    } catch (error: any) {
      toast({ title: t("login", "error"), description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="gradient-glow absolute top-0 left-0 right-0 h-96 pointer-events-none" />
      <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-primary/10"><Phone className="h-6 w-6 text-primary" /></div>
          </div>
          <CardTitle className="text-2xl text-foreground">{t("login", "appName")}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {forgotMode ? t("login", "forgotEmailPrompt") : isLogin ? t("login", "loginPrompt") : t("login", "registerPrompt")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">{t("login", "email")}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com" className="bg-input border-border" />
            </div>
            {!forgotMode && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">{t("login", "password")}</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder={t("login", "minChars")} className="bg-input border-border" />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {forgotMode ? t("login", "sendLink") : isLogin ? t("login", "signIn") : t("login", "signUp")}
            </Button>
          </form>
          <div className="mt-4 text-center space-y-2">
            {isLogin && !forgotMode && (
              <button type="button" onClick={() => setForgotMode(true)} className="text-sm text-muted-foreground hover:text-primary hover:underline block w-full">{t("login", "forgotPassword")}</button>
            )}
            <button type="button" onClick={() => { setForgotMode(false); setIsLogin(!isLogin); }} className="text-sm text-primary hover:underline">
              {forgotMode ? t("login", "backToLogin") : isLogin ? t("login", "noAccount") : t("login", "hasAccount")}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
