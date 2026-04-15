import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
}

export default function ChangePasswordDialog({ open, onOpenChange, userEmail }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
    setSuccess(false);
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!currentPassword) e.currentPassword = "Huidig wachtwoord is verplicht";
    if (!newPassword) e.newPassword = "Nieuw wachtwoord is verplicht";
    else if (newPassword.length < 6) e.newPassword = "Minimaal 6 tekens";
    if (!confirmPassword) e.confirmPassword = "Bevestig je nieuwe wachtwoord";
    else if (newPassword !== confirmPassword) e.confirmPassword = "Wachtwoorden komen niet overeen";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    // Verify current password by re-authenticating
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword,
    });

    if (signInError) {
      setErrors({ currentPassword: "Huidig wachtwoord is onjuist" });
      setLoading(false);
      return;
    }

    // Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (updateError) {
      toast.error("Wachtwoord wijzigen mislukt. Probeer het opnieuw.");
      return;
    }

    setSuccess(true);
  };

  const handleClose = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4" />
            Wachtwoord wijzigen
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center py-8 space-y-4">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
            <p className="text-sm font-medium text-center">
              Je wachtwoord is succesvol gewijzigd.
            </p>
            <Button onClick={() => handleClose(false)} className="w-full">
              Sluiten
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {/* Current password */}
            <div className="space-y-1.5">
              <Label htmlFor="current-pw" className="text-sm">Huidig wachtwoord</Label>
              <div className="relative">
                <Input
                  id="current-pw"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => { setCurrentPassword(e.target.value); setErrors((p) => ({ ...p, currentPassword: "" })); }}
                  className="pr-10 h-12 text-base"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowCurrent(!showCurrent)}
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword}</p>}
            </div>

            {/* New password */}
            <div className="space-y-1.5">
              <Label htmlFor="new-pw" className="text-sm">Nieuw wachtwoord</Label>
              <div className="relative">
                <Input
                  id="new-pw"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setErrors((p) => ({ ...p, newPassword: "" })); }}
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

            {/* Confirm password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirm-pw" className="text-sm">Bevestig nieuw wachtwoord</Label>
              <div className="relative">
                <Input
                  id="confirm-pw"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: "" })); }}
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

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-12 text-base mt-2"
            >
              {loading ? "Bezig met wijzigen..." : "Wachtwoord wijzigen"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
