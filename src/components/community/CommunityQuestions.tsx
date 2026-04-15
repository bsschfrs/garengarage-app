import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Question {
  id: string;
  title: string;
  body: string;
  user_id: string;
  author_name?: string;
  created_at: string;
  reply_count: number;
}

interface Reply {
  id: string;
  body: string;
  created_at: string;
  author_name?: string;
}

export default function CommunityQuestions() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState("");

  const fetchQuestions = async () => {
    const { data } = await supabase
      .from("questions")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false });

    if (!data) return;

    const withCounts = await Promise.all(
      data.map(async (q) => {
        const { count } = await supabase
          .from("question_replies")
          .select("*", { count: "exact", head: true })
          .eq("question_id", q.id);
        return { ...q, reply_count: count || 0 };
      })
    );
    setQuestions(withCounts);
  };

  useEffect(() => { fetchQuestions(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("questions").insert({ title, body, user_id: user.id });
    if (error) { toast.error("Vraag kon niet worden geplaatst."); return; }
    toast.success("Vraag geplaatst!");
    setTitle(""); setBody(""); setShowForm(false);
    fetchQuestions();
  };

  const toggleExpand = async (id: string) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    const { data } = await supabase
      .from("question_replies")
      .select("*, profiles(full_name)")
      .eq("question_id", id)
      .order("created_at", { ascending: true });
    setReplies(data || []);
  };

  const handleReply = async (questionId: string) => {
    if (!user || !replyText.trim()) return;
    const { error } = await supabase.from("question_replies").insert({
      question_id: questionId, body: replyText, user_id: user.id,
    });
    if (error) { toast.error("Antwoord mislukt."); return; }
    setReplyText("");
    toggleExpand(questionId);
    fetchQuestions();
  };

  const timeAgo = (d: string) => {
    const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (mins < 60) return `${mins}m`;
    if (mins < 1440) return `${Math.floor(mins / 60)}u`;
    return `${Math.floor(mins / 1440)}d`;
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
          <Input placeholder="Onderwerp" value={title} onChange={e => setTitle(e.target.value)} required />
          <Textarea placeholder="Je vraag..." value={body} onChange={e => setBody(e.target.value)} required rows={3} />
          <Button type="submit" size="sm">Plaats vraag</Button>
        </form>
      )}

      {questions.length === 0 ? (
        <div className="rounded-xl bg-card p-6 text-center text-sm text-muted-foreground">
          Nog geen vragen. Stel de eerste!
        </div>
      ) : (
        questions.map((q) => (
          <div key={q.id} className="rounded-xl bg-card p-4 shadow-sm border border-border">
            <h3 className="font-medium text-sm">{q.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{q.body}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-muted-foreground">
                {q.profiles?.full_name || "Anoniem"} · {timeAgo(q.created_at)}
              </span>
              <button onClick={() => toggleExpand(q.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <MessageCircle className="h-3.5 w-3.5" />{q.reply_count}
              </button>
            </div>

            {expandedId === q.id && (
              <div className="mt-3 pt-3 border-t border-border space-y-3">
                {replies.map((r) => (
                  <div key={r.id} className="text-xs">
                    <span className="font-medium">{r.profiles?.full_name || "Anoniem"}</span>
                    <span className="text-muted-foreground ml-2">{timeAgo(r.created_at)}</span>
                    <p className="text-muted-foreground mt-0.5">{r.body}</p>
                  </div>
                ))}
                {user && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Je antwoord..."
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      className="text-xs h-8"
                    />
                    <Button size="sm" className="h-8 text-xs" onClick={() => handleReply(q.id)}>
                      Verstuur
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
