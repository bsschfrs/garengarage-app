import { Link } from "react-router-dom";
import { Calendar, ShoppingBag, Lightbulb, ArrowRight } from "lucide-react";
import logo from "@/assets/logo.png";

export default function Home() {
  return (
    <div className="animate-fade-in space-y-8">
      {/* Logo */}
      <div className="flex justify-center pt-2 pb-4">
        <img src={logo} alt="De Garengarage" className="h-28 w-28 object-contain" />
      </div>

      {/* Next Crochet Mee */}
      <section>
        <Link
          to="/crochet-mee"
          className="block rounded-xl bg-card p-5 shadow-sm border border-border hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/40">
              <Calendar className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Volgende Crochet Mee</p>
              <h3 className="font-medium text-sm">Binnenkort beschikbaar</h3>
              <p className="text-xs text-muted-foreground mt-1">Bekijk de agenda voor details</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground mt-1" />
          </div>
        </Link>
      </section>

      {/* Quick access grid */}
      <section className="grid grid-cols-2 gap-3">
        <Link
          to="/shop"
          className="flex flex-col items-center gap-2 rounded-xl bg-card p-5 shadow-sm border border-border hover:shadow-md transition-shadow"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/40">
            <ShoppingBag className="h-5 w-5 text-accent-foreground" />
          </div>
          <span className="text-sm font-medium">Shop</span>
        </Link>

        <Link
          to="/community"
          className="flex flex-col items-center gap-2 rounded-xl bg-card p-5 shadow-sm border border-border hover:shadow-md transition-shadow"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/40">
            <Lightbulb className="h-5 w-5 text-accent-foreground" />
          </div>
          <span className="text-sm font-medium">Community</span>
        </Link>
      </section>

      {/* Featured / Inspiration */}
      <section>
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Inspiratie</h2>
        <div className="rounded-xl bg-card p-5 shadow-sm border border-border">
          <p className="text-sm text-muted-foreground">
            Ontdek de nieuwste haakprojecten en laat je inspireren door de community.
          </p>
          <Link to="/community" className="inline-flex items-center gap-1 text-sm font-medium mt-3 text-accent-foreground">
            Bekijk meer <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
