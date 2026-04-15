import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ThumbsUp, Trash2, Plus, X, ExternalLink, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Proposal {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  link: string | null;
  user_id: string;
  vote_count: number;
  user_voted: boolean;
}

export default function ProjectProposals() {
  const { user, isAdmin } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchProposals = async () => {
    const { data } = await supabase
      .from("proposals")
      .select("*")
      .order("created_at", { ascending: false });

    if (!data) return;

    const withVotes = await Promise.all(
      data.map(async (p) => {
        const { count } = await supabase
          .from("proposal_votes")
          .select("*", { count: "exact", head: true })
          .eq("proposal_id", p.id);

        let userVoted = false;
        if (user) {
          const { data: vote } = await supabase
            .from("proposal_votes")
            .select("id")
            .eq("proposal_id", p.id)
            .eq("user_id", user.id)
            .maybeSingle();
          userVoted = !!vote;
        }

        return { ...p, vote_count: count || 0, user_voted: userVoted };
      })
    );

    setProposals(withVotes);
  };

  useEffect(() => { fetchProposals(); }, [user]);

  const handleVote = async (proposalId: string, alreadyVoted: boolean) => {
    if (!user) { toast.error("Log eerst in."); return; }
    if (alreadyVoted) {
      await supabase.from("proposal_votes").delete().eq("proposal_id", proposalId).eq("user_id", user.id);
    } else {
      await supabase.from("proposal_votes").insert({ proposal_id: proposalId, user_id: user.id });
    }
    fetchProposals();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("proposals").delete().eq("id", id);
    if (error) { toast.error("Verwijderen mislukt."); return; }
    toast.success("Voorstel verwijderd.");
    fetchProposals();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    let imageUrl: string | null = null;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `proposals/${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("proposal-images").upload(path, imageFile);
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from("proposal-images").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from("proposals").insert({
      title,
      description,
      image_url: imageUrl,
      link: link || null,
      user_id: user.id,
    });

    if (error) { toast.error("Indienen mislukt."); }
    else {
      toast.success("Voorstel ingediend!");
      setTitle(""); setDescription(""); setLink(""); setImageFile(null);
      setShowForm(false);
      fetchProposals();
    }
    setSubmitting(false);
  };

  const canDelete = (p: Proposal) => isAdmin || (user && p.user_id === user.id);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Projectvoorstellen</h2>
        {user && (
          <button onClick={() => setShowForm(!showForm)} className="text-muted-foreground hover:text-foreground">
            {showForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl bg-card p-4 shadow-sm border border-border space-y-3">
          <div><Label htmlFor="p-title">Titel</Label><Input id="p-title" value={title} onChange={e => setTitle(e.target.value)} required /></div>
          <div><Label htmlFor="p-desc">Beschrijving</Label><Textarea id="p-desc" value={description} onChange={e => setDescription(e.target.value)} required rows={3} /></div>
          <div><Label htmlFor="p-link">Link (optioneel)</Label><Input id="p-link" value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." /></div>
          <div><Label htmlFor="p-img">Afbeelding (optioneel)</Label><Input id="p-img" type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} /></div>
          <Button type="submit" disabled={submitting} size="sm">{submitting ? "Bezig..." : "Indienen"}</Button>
        </form>
      )}

      {/* Proposals list */}
      {proposals.length === 0 ? (
        <div className="rounded-xl bg-card p-5 text-center text-sm text-muted-foreground">
          Nog geen voorstellen. Deel je ideeën!
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map((p) => (
            <div key={p.id} className="rounded-xl bg-card p-4 shadow-sm border border-border">
              <div className="flex gap-3">
                {p.image_url && (
                  <button
                    onClick={() => setPreviewImage(p.image_url)}
                    className="flex-shrink-0 relative group"
                  >
                    <img src={p.image_url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                    <div className="absolute inset-0 rounded-lg bg-foreground/0 group-hover:bg-foreground/10 flex items-center justify-center transition-colors">
                      <ZoomIn className="h-4 w-4 text-card opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm">{p.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{p.description}</p>
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent-foreground mt-1 hover:underline">
                      Bekijk link <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <button
                  onClick={() => handleVote(p.id, p.user_voted)}
                  className={`flex items-center gap-1.5 text-xs transition-colors ${p.user_voted ? "text-accent-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <ThumbsUp className="h-3.5 w-3.5" fill={p.user_voted ? "currentColor" : "none"} />
                  {p.vote_count}
                </button>
                {canDelete(p) && (
                  <button onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-6"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-lg w-full animate-fade-in" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewImage(null)} className="absolute -top-3 -right-3 bg-card rounded-full p-1.5 shadow-md text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
            <img src={previewImage} alt="" className="w-full rounded-xl object-contain max-h-[70vh]" />
          </div>
        </div>
      )}
    </section>
  );
}
