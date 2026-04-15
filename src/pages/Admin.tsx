import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, X, Pencil, Trash2, Check, XCircle } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";

interface CrochetEvent {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  max_spots: number;
  status: string;
}

interface Registration {
  id: string;
  user_id: string;
  attended: boolean;
  profiles: { full_name: string } | null;
}

export default function Admin() {
  const { isAdmin, loading } = useAuth();
  const [events, setEvents] = useState<CrochetEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxSpots, setMaxSpots] = useState("10");
  const [status, setStatus] = useState("open");
  const [viewRegsId, setViewRegsId] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("crochet_events")
      .select("*")
      .order("date", { ascending: false });
    setEvents(data || []);
  };

  useEffect(() => { if (isAdmin) fetchEvents(); }, [isAdmin]);

  if (loading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  const resetForm = () => {
    setTitle(""); setDate(""); setStartTime(""); setEndTime(""); setMaxSpots("10"); setStatus("open");
    setEditingId(null); setShowForm(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { title, date, start_time: startTime, end_time: endTime, max_spots: parseInt(maxSpots), status };

    if (editingId) {
      const { error } = await supabase.from("crochet_events").update(payload).eq("id", editingId);
      if (error) { toast.error("Opslaan mislukt."); return; }
      toast.success("Evenement bijgewerkt.");
    } else {
      const { error } = await supabase.from("crochet_events").insert(payload);
      if (error) { toast.error("Aanmaken mislukt."); return; }
      toast.success("Evenement aangemaakt.");
    }
    resetForm();
    fetchEvents();
  };

  const handleEdit = (event: CrochetEvent) => {
    setTitle(event.title);
    setDate(event.date);
    setStartTime(event.start_time);
    setEndTime(event.end_time);
    setMaxSpots(String(event.max_spots));
    setStatus(event.status);
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("crochet_events").delete().eq("id", id);
    if (error) { toast.error("Verwijderen mislukt."); return; }
    toast.success("Evenement verwijderd.");
    fetchEvents();
  };

  const viewRegistrations = async (eventId: string) => {
    setViewRegsId(eventId);
    const { data } = await supabase
      .from("event_registrations")
      .select("*, profiles(full_name)")
      .eq("event_id", eventId);
    setRegistrations(data || []);
  };

  const toggleAttendance = async (regId: string, current: boolean) => {
    await supabase.from("event_registrations").update({ attended: !current }).eq("id", regId);
    if (viewRegsId) viewRegistrations(viewRegsId);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/profiel" className="text-muted-foreground hover:text-foreground md:hidden">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold">Admin Dashboard</h1>
      </div>

      {/* Create/Edit form */}
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Crochet Mee Avonden</h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="text-muted-foreground hover:text-foreground">
          {showForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="rounded-xl bg-card p-4 shadow-sm border border-border space-y-3">
          <div><Label>Titel</Label><Input value={title} onChange={e => setTitle(e.target.value)} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Datum</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} required /></div>
            <div><Label>Status</Label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="open">Open</option>
                <option value="vol">Vol</option>
                <option value="gesloten">Gesloten</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Begintijd</Label><Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required /></div>
            <div><Label>Eindtijd</Label><Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required /></div>
            <div><Label>Max plekken</Label><Input type="number" value={maxSpots} onChange={e => setMaxSpots(e.target.value)} required min={1} /></div>
          </div>
          <Button type="submit" size="sm">{editingId ? "Opslaan" : "Aanmaken"}</Button>
        </form>
      )}

      {/* Events list */}
      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className="rounded-xl bg-card p-4 shadow-sm border border-border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-sm">{event.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(event.date).toLocaleDateString("nl-NL")} · {event.start_time?.slice(0, 5)} – {event.end_time?.slice(0, 5)}
                </p>
                <p className="text-xs text-muted-foreground">Max: {event.max_spots} · Status: {event.status}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(event)} className="p-1.5 text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => handleDelete(event.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => viewRegistrations(event.id)}>
              Bekijk aanmeldingen
            </Button>
          </div>
        ))}
      </div>

      {/* Registrations modal */}
      {viewRegsId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4" onClick={() => setViewRegsId(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-lg animate-fade-in max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-sm">Aanmeldingen</h3>
              <button onClick={() => setViewRegsId(null)} className="text-muted-foreground"><X className="h-5 w-5" /></button>
            </div>
            {registrations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">Geen aanmeldingen.</p>
            ) : (
              <div className="space-y-2">
                {registrations.map((reg) => (
                  <div key={reg.id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                    <span className="text-sm">{reg.profiles?.full_name || "Onbekend"}</span>
                    <button
                      onClick={() => toggleAttendance(reg.id, reg.attended)}
                      className={`flex items-center gap-1 text-xs font-medium ${reg.attended ? "text-green-600" : "text-muted-foreground"}`}
                    >
                      {reg.attended ? <Check className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                      {reg.attended ? "Aanwezig" : "Afwezig"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
