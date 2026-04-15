import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function ShopOntwerpen() {
  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/shop" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold">Ontwerpen</h1>
      </div>

      <div className="rounded-xl bg-muted/50 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Ontwerpen worden geladen vanuit Shopify zodra de koppeling actief is.
        </p>
      </div>
    </div>
  );
}
