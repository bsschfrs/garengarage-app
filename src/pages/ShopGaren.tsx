import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const filters = [
  "Alle garens", "Braided Fine", "Coral", "Cosy Fine", "Comfy", "Dare", "Double Four", "Glam & Velvet"
];

export default function ShopGaren() {
  const [active, setActive] = useState("Alle garens");

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/shop" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold">Garen</h1>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              active === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-muted/50 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Producten worden geladen vanuit Shopify zodra de koppeling actief is.
        </p>
      </div>
    </div>
  );
}
