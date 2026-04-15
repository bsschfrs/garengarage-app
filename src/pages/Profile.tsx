import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Shield, LogOut, Calendar, Lightbulb, Image, KeyRound } from "lucide-react";
import ChangePasswordDialog from "@/components/profile/ChangePasswordDialog";

export default function Profile() {
  const { user, isAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name: string; avatar_url: string | null } | null>(null);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [proposalCount, setProposalCount] = useState(0);
  const [creationCount, setCreationCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).maybeSingle()
      .then(({ data }) => setProfile(data));

    supabase.from("event_registrations").select("*", { count: "exact", head: true })
      .eq("user_id", user.id).eq("attended", true)
      .then(({ count }) => setAttendanceCount(count || 0));

    supabase.from("proposals").select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .then(({ count }) => setProposalCount(count || 0));

    supabase.from("community_creations").select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .then(({ count }) => setCreationCount(count || 0));
  }, [user]);

  if (loading) return <div className="p-6 text-center text-sm text-muted-foreground">Laden...</div>;

  if (!user) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-muted-foreground text-sm">Log in om je profiel te bekijken.</p>
        <Button onClick={() => navigate("/auth")}>Inloggen</Button>
      </div>
    );
  }

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Gebruiker";

  return (
    <div className="animate-fade-in space-y-6">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/40 flex items-center justify-center text-lg font-semibold text-accent-foreground">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-lg font-semibold">{displayName}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-card p-4 shadow-sm border border-border text-center">
          <Calendar className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-lg font-semibold">{attendanceCount}</p>
          <p className="text-xs text-muted-foreground">Bijgewoond</p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-sm border border-border text-center">
          <Lightbulb className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-lg font-semibold">{proposalCount}</p>
          <p className="text-xs text-muted-foreground">Voorstellen</p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-sm border border-border text-center">
          <Image className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-lg font-semibold">{creationCount}</p>
          <p className="text-xs text-muted-foreground">Creaties</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Je hebt al {attendanceCount} Crochet Mee {attendanceCount === 1 ? "avond" : "avonden"} bijgewoond.
      </p>

      {/* Admin link on mobile */}
      {isAdmin && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate("/admin")}
        >
          <Shield className="h-4 w-4 mr-2" />
          Admin dashboard
        </Button>
      )}

      <Button variant="ghost" className="w-full text-muted-foreground" onClick={signOut}>
        <LogOut className="h-4 w-4 mr-2" />
        Uitloggen
      </Button>
    </div>
  );
}
