import { Link } from "react-router-dom";
import type { ShopifyProduct } from "@/lib/shopify";
import { ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

interface ProductCardProps {
  product: ShopifyProduct;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);
  const p = product.node;
  const image = p.images.edges[0]?.node;
  const variant = p.variants.edges[0]?.node;
  const price = parseFloat(p.priceRange.minVariantPrice.amount).toFixed(2);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("Toegevoegd aan winkelwagen", { description: p.title });
  };

  return (
    <Link
      to={`/shop/product/${p.handle}`}
      className="group rounded-xl bg-card border border-border overflow-hidden hover:shadow-md transition-shadow min-w-0"
    >
      <div className="aspect-square bg-muted overflow-hidden">
        {image ? (
          <img
            src={image.url}
            alt={image.altText || p.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            Geen afbeelding
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-xs sm:text-sm font-medium truncate">{p.title}</h3>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-sm font-semibold">€{price}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleAddToCart}
            disabled={isLoading || !variant?.availableForSale}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ShoppingCart className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
    </Link>
  );
};
