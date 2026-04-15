import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Heart, MessageCircle, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Creation {
  id: string;
  title: string;
  caption: string;
  image_url: string;
  user_id: string;
  created_at: string;
  like_count: number;
  user_liked: boolean;
  author_name?: string;
}

export default function CommunityCreations() {
  const { user } = useAuth();
  const [creations, setCreations] = useState<Creation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCreations = async () => {
    const { data } = await supabase
      .from("community_creations")
      .select("*")
      .order("created_at", { ascending: false });

    if (!data) return;

    const withLikes = await Promise.all(
      data.map(async (c) => {
        const { count } = await supabase
          .from("creation_likes")
          .select("*", { count: "exact", head: true })
          .eq("creation_id", c.id);

        let userLiked = false;
        if (user) {
          const { data: like } = await supabase
            .from("creation_likes")
            .select("id")
            .eq("creation_id", c.id)
            .eq("user_id", user.id)
            .maybeSingle();
          userLiked = !!like;
        }

        const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", c.user_id).maybeSingle();

        return { ...c, like_count: count || 0, user_liked: userLiked, author_name: profile?.full_name || "Anoniem" };
      })
    );

    setCreations(withLikes as Creation[]);
  };

  useEffect(() => { fetchCreations(); }, [user]);

  const handleLike = async (id: string, liked: boolean) => {
    if (!user) { toast.error("Log eerst in."); return; }
    if (liked) {
      await supabase.from("creation_likes").delete().eq("creation_id", id).eq("user_id", user.id);
    } else {
      await supabase.from("creation_likes").insert({ creation_id: id, user_id: user.id });
    }
    fetchCreations();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !imageFile) return;
    setSubmitting(true);

    const ext = imageFile.name.split(".").pop();
    const path = `creations/${user.id}/${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("community-images").upload(path, imageFile);
    if (uploadErr) { toast.error("Upload mislukt."); setSubmitting(false); return; }

    const { data: urlData } = supabase.storage.from("community-images").getPublicUrl(path);

    const { error } = await supabase.from("community_creations").insert({
      title, caption, image_url: urlData.publicUrl, user_id: user.id,
    });

    if (error) { toast.error("Plaatsen mislukt."); }
    else {
      toast.success("Creatie gedeeld!");
      setTitle(""); setCaption(""); setImageFile(null); setShowForm(false);
      fetchCreations();
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {user && (
          <button onClick={() => setShowForm(!showForm)} className="text-muted-foreground hover:text-foreground">
            {showForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl bg-card p-4 shadow-sm border border-border space-y-3">
          <Input placeholder="Titel" value={title} onChange={e => setTitle(e.target.value)} required />
          <Textarea placeholder="Beschrijving..." value={caption} onChange={e => setCaption(e.target.value)} rows={2} />
          <Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} required />
          <Button type="submit" disabled={submitting} size="sm">{submitting ? "Bezig..." : "Delen"}</Button>
        </form>
      )}

      {creations.length === 0 ? (
        <div className="rounded-xl bg-card p-6 text-center text-sm text-muted-foreground">
          Deel je eigen haakcreaties met de community!
        </div>
      ) : (
        <div className="space-y-4">
          {creations.map((c) => (
            <div key={c.id} className="rounded-xl bg-card shadow-sm border border-border overflow-hidden">
              <img src={c.image_url} alt={c.title} className="w-full aspect-square object-cover" />
              <div className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <button
                    onClick={() => handleLike(c.id, c.user_liked)}
                    className={`flex items-center gap-1 text-sm ${c.user_liked ? "text-destructive" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Heart className="h-4 w-4" fill={c.user_liked ? "currentColor" : "none"} />
                    {c.like_count}
                  </button>
                </div>
                <h3 className="font-medium text-sm">{c.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{c.caption}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {c.author_name || "Anoniem"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
