import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { CartDrawer } from "@/components/shop/CartDrawer";

const categories = [
  {
    title: "Garen",
    description: "Ontdek ons assortiment garens",
    to: "/shop/garen",
  },
  {
    title: "Ontwerpen",
    description: "Handgemaakte knuffels, tassen & meer",
    to: "/shop/ontwerpen",
  },
];

export default function Shop() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Shop</h1>
        <CartDrawer />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.to}
            to={cat.to}
            className="flex flex-col items-center justify-center rounded-xl bg-card p-8 shadow-sm border border-border hover:shadow-md transition-shadow text-center"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/40 mb-3">
              <ShoppingBag className="h-5 w-5 text-accent-foreground" />
            </div>
            <h2 className="font-medium">{cat.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
