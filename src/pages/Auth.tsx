import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.png";
import { toast } from "sonner";

function ForgotPassword({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Voer je e-mailadres in");
      return;
    }
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (resetError) {
      toast.error("Er ging iets mis. Probeer het opnieuw.");
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <div className="w-full max-w-sm animate-fade-in text-center space-y-6">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="De Garengarage" className="h-24 w-24 object-contain" />
        </div>
        <h1 className="text-xl font-semibold">Controleer je e-mail</h1>
        <p className="text-sm text-muted-foreground">
          Als er een account bestaat voor <strong>{email}</strong>, ontvang je een e-mail met een link om je wachtwoord te resetten.
        </p>
        <Button onClick={onBack} variant="outline" className="w-full h-12 text-base">
          Terug naar inloggen
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm animate-fade-in">
      <div className="flex justify-center mb-8">
        <img src={logo} alt="De Garengarage" className="h-24 w-24 object-contain" />
      </div>

      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Terug
      </button>

      <h1 className="text-xl font-semibold mb-2">Wachtwoord vergeten</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Voer je e-mailadres in. Je ontvangt een link om je wachtwoord te resetten.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="reset-email">E-mailadres</Label>
          <Input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="je@email.nl"
            className="h-12 text-base"
            autoComplete="email"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
          {loading ? "Bezig..." : "Verstuur resetlink"}
        </Button>
      </form>
    </div>
  );
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        navigate("/");
      }
    } else {
      const { error } = await signUp(email, password, name);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account aangemaakt! Controleer je e-mail om te bevestigen.");
      }
    }
    setLoading(false);
  };

  if (showForgot) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <ForgotPassword onBack={() => setShowForgot(false)} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="De Garengarage" className="h-24 w-24 object-contain" />
        </div>

        <h1 className="text-xl font-semibold text-center mb-6">
          {isLogin ? "Inloggen" : "Registreren"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Naam</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Je naam"
                required={!isLogin}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">E-mailadres</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="je@email.nl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Wachtwoord</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-sm text-muted-foreground underline underline-offset-2"
              >
                Wachtwoord vergeten?
              </button>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Even geduld..." : isLogin ? "Inloggen" : "Account aanmaken"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? "Nog geen account?" : "Al een account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-accent-foreground underline underline-offset-2"
          >
            {isLogin ? "Registreren" : "Inloggen"}
          </button>
        </p>
      </div>
    </div>
  );
}
