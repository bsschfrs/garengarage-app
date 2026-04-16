import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, extractYarnBrand } from "@/lib/shopify";
import { ProductCard } from "@/components/shop/ProductCard";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShopGaren() {
  const [active, setActive] = useState("Alle garens");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["shopify-garen"],
    queryFn: () => fetchProducts(100, "vendor:\"De Garengarage\""),
  });

  // Extract unique yarn brands from product titles
  const brands = useMemo(() => {
    const brandSet = new Set<string>();
    products.forEach((p) => {
      const brand = extractYarnBrand(p.node.title);
      if (brand) brandSet.add(brand);
    });
    return Array.from(brandSet).sort();
  }, [products]);

  const filters = ["Alle garens", ...brands];

  const filtered = useMemo(() => {
    if (active === "Alle garens") return products;
    return products.filter((p) => extractYarnBrand(p.node.title) === active);
  }, [products, active]);

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/shop" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">Garen</h1>
        </div>
        <CartDrawer />
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

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl bg-muted/50 p-6 text-center">
          <p className="text-sm text-muted-foreground">Geen producten gevonden.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((product) => (
            <ProductCard key={product.node.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
