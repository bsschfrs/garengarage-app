import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Clock, Users, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ProjectProposals from "@/components/crochet/ProjectProposals";

interface CrochetEvent {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  max_spots: number;
  status: string;
  registration_count: number;
  user_registered: boolean;
}

export default function CrochetMee() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CrochetEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CrochetEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    const { data: eventsData } = await supabase
      .from("crochet_events")
      .select("*")
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date", { ascending: true });

    if (!eventsData) { setLoading(false); return; }

    const eventsWithCounts = await Promise.all(
      eventsData.map(async (event) => {
        const { count } = await supabase
          .from("event_registrations")
          .select("*", { count: "exact", head: true })
          .eq("event_id", event.id);

        let userRegistered = false;
        if (user) {
          const { data: reg } = await supabase
            .from("event_registrations")
            .select("id")
            .eq("event_id", event.id)
            .eq("user_id", user.id)
            .maybeSingle();
          userRegistered = !!reg;
        }

        return {
          ...event,
          registration_count: count || 0,
          user_registered: userRegistered,
        };
      })
    );

    setEvents(eventsWithCounts);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, [user]);

  const handleRegister = async (eventId: string) => {
    if (!user) { toast.error("Log eerst in om je aan te melden."); return; }
    const { error } = await supabase.from("event_registrations").insert({ event_id: eventId, user_id: user.id });
    if (error) { toast.error("Aanmelden mislukt."); return; }
    toast.success("Je bent aangemeld!");
    setSelectedEvent(null);
    fetchEvents();
  };

  const handleCancel = async (eventId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("event_registrations")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", user.id);
    if (error) { toast.error("Afmelden mislukt."); return; }
    toast.success("Je bent afgemeld.");
    setSelectedEvent(null);
    fetchEvents();
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });

  const formatTime = (t: string) => t?.slice(0, 5);

  return (
    <div className="animate-fade-in space-y-8">
      <h1 className="text-lg font-semibold">Crochet Mee</h1>

      {/* Events */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Aankomende avonden</h2>
        {loading ? (
          <div className="rounded-xl bg-card p-6 text-center text-sm text-muted-foreground">Laden...</div>
        ) : events.length === 0 ? (
          <div className="rounded-xl bg-card p-6 text-center text-sm text-muted-foreground">
            Er zijn momenteel geen aankomende avonden.
          </div>
        ) : (
          <div className="grid gap-3">
            {events.map((event) => {
              const spotsLeft = event.max_spots - event.registration_count;
              return (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="w-full text-left rounded-xl bg-card p-4 shadow-sm border border-border hover:shadow-md transition-shadow"
                >
                  <h3 className="font-medium text-sm">{event.title}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(event.date)}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatTime(event.start_time)} – {formatTime(event.end_time)}</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {event.status === "vol" ? "Vol" : event.status === "gesloten" ? "Gesloten" : `${spotsLeft} plekken over`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Project Proposals */}
      <ProjectProposals />

      {/* Event Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-lg animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold">{selectedEvent.title}</h3>
              <button onClick={() => setSelectedEvent(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground mb-6">
              <p className="flex items-center gap-2"><Calendar className="h-4 w-4" />{formatDate(selectedEvent.date)}</p>
              <p className="flex items-center gap-2"><Clock className="h-4 w-4" />{formatTime(selectedEvent.start_time)} – {formatTime(selectedEvent.end_time)}</p>
              <p className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {selectedEvent.max_spots - selectedEvent.registration_count} van {selectedEvent.max_spots} plekken beschikbaar
              </p>
            </div>

            {selectedEvent.user_registered ? (
              <Button variant="outline" className="w-full" onClick={() => handleCancel(selectedEvent.id)}>
                Afmelden
              </Button>
            ) : selectedEvent.status === "open" && selectedEvent.registration_count < selectedEvent.max_spots ? (
              <Button className="w-full" onClick={() => handleRegister(selectedEvent.id)}>
                Aanmelden
              </Button>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                {selectedEvent.status === "vol" ? "Deze avond is vol." : "Aanmelden is gesloten."}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
