import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProductByHandle } from "@/lib/shopify";
import { ArrowLeft, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetail() {
  const { handle } = useParams<{ handle: string }>();
  const addItem = useCartStore((state) => state.addItem);
  const isCartLoading = useCartStore((state) => state.isLoading);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ["shopify-product", handle],
    queryFn: () => fetchProductByHandle(handle!),
    enabled: !!handle,
  });

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="aspect-square w-full rounded-xl" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="animate-fade-in space-y-4 text-center py-12">
        <p className="text-muted-foreground">Product niet gevonden</p>
        <Link to="/shop" className="text-sm text-primary underline">
          Terug naar shop
        </Link>
      </div>
    );
  }

  const images = product.images.edges;
  const variants = product.variants.edges;
  const selectedVariant = variants[selectedVariantIdx]?.node;
  const price = selectedVariant
    ? parseFloat(selectedVariant.price.amount).toFixed(2)
    : parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    const wrappedProduct = { node: product };
    await addItem({
      product: wrappedProduct,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions || [],
    });
    toast.success("Toegevoegd aan winkelwagen", { description: product.title });
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => window.history.back()} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold truncate">{product.title}</h1>
      </div>

      {/* Image */}
      {images.length > 0 && (
        <div className="rounded-xl overflow-hidden bg-muted aspect-square">
          <img
            src={images[0].node.url}
            alt={images[0].node.altText || product.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Price & variant */}
      <div className="space-y-3">
        <p className="text-xl font-semibold">€{price}</p>

        {variants.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {variants.map((v, idx) => (
              <button
                key={v.node.id}
                onClick={() => setSelectedVariantIdx(idx)}
                disabled={!v.node.availableForSale}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors border ${
                  idx === selectedVariantIdx
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80"
                } ${!v.node.availableForSale ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                {v.node.title}
              </button>
            ))}
          </div>
        )}

        {product.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
        )}

        <Button
          className="w-full"
          size="lg"
          onClick={handleAddToCart}
          disabled={isCartLoading || !selectedVariant?.availableForSale}
        >
          {isCartLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <ShoppingCart className="w-4 h-4 mr-2" />
          )}
          In winkelwagen
        </Button>
      </div>
    </div>
  );
}
