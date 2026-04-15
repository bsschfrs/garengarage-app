import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import logo from "@/assets/logo.png";
import { toast } from "sonner";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event from the auth redirect
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setSessionValid(true);
        }
      }
    );

    // Also check if we already have a session (user clicked link and was auto-logged in)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionValid(true);
      } else {
        // Give a moment for the auth state change to fire
        setTimeout(() => {
          setSessionValid((prev) => (prev === null ? false : prev));
        }, 2000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!newPassword) e.newPassword = "Nieuw wachtwoord is verplicht";
    else if (newPassword.length < 6) e.newPassword = "Minimaal 6 tekens";
    if (!confirmPassword) e.confirmPassword = "Bevestig je nieuwe wachtwoord";
    else if (newPassword !== confirmPassword) e.confirmPassword = "Wachtwoorden komen niet overeen";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      toast.error("Wachtwoord instellen mislukt. Probeer het opnieuw.");
      return;
    }

    setSuccess(true);
  };

  // Loading state while checking session
  if (sessionValid === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-sm text-muted-foreground">Bezig met laden...</p>
      </div>
    );
  }

  // Invalid or expired session
  if (sessionValid === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm animate-fade-in text-center space-y-6">
          <div className="flex justify-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-lg font-semibold">Ongeldige of verlopen link</h1>
          <p className="text-sm text-muted-foreground">
            Deze wachtwoord-resetlink is verlopen of ongeldig. Vraag een nieuwe link aan.
          </p>
          <Button onClick={() => navigate("/auth")} className="w-full h-12 text-base">
            Terug naar inloggen
          </Button>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm animate-fade-in text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-lg font-semibold">Wachtwoord gewijzigd</h1>
          <p className="text-sm text-muted-foreground">
            Je wachtwoord is succesvol ingesteld. Je kunt nu verdergaan.
          </p>
          <Button onClick={() => navigate("/")} className="w-full h-12 text-base">
            Ga naar de app
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="De Garengarage" className="h-24 w-24 object-contain" />
        </div>

        <h1 className="text-xl font-semibold text-center mb-2">Nieuw wachtwoord instellen</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Kies een nieuw wachtwoord voor je account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-pw">Nieuw wachtwoord</Label>
            <div className="relative">
              <Input
                id="new-pw"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setErrors((p) => ({ ...p, newPassword: "" })); }}
                placeholder="••••••••"
                className="pr-10 h-12 text-base"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowNew(!showNew)}
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-pw">Bevestig wachtwoord</Label>
            <div className="relative">
              <Input
                id="confirm-pw"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: "" })); }}
                placeholder="••••••••"
                className="pr-10 h-12 text-base"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
          </div>

          <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
            {loading ? "Bezig..." : "Wachtwoord opslaan"}
          </Button>
        </form>
      </div>
    </div>
  );
}
