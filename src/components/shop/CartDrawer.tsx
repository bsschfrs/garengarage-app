import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";

export const CartDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { items, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart } =
    useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + parseFloat(item.price.amount) * item.quantity,
    0
  );

  useEffect(() => {
    if (isOpen) syncCart();
  }, [isOpen, syncCart]);

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) {
      window.open(checkoutUrl, "_blank");
      setIsOpen(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px] bg-foreground text-background">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>Winkelwagen</SheetTitle>
          <SheetDescription>
            {totalItems === 0
              ? "Je winkelwagen is leeg"
              : `${totalItems} artikel${totalItems !== 1 ? "en" : ""} in je winkelwagen`}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col flex-1 pt-4 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Je winkelwagen is leeg</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-1 min-h-0 space-y-3">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-3 p-2 rounded-lg bg-muted/30">
                    <div className="w-14 h-14 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                      {item.product.node.images?.edges?.[0]?.node && (
                        <img
                          src={item.product.node.images.edges[0].node.url}
                          alt={item.product.node.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{item.product.node.title}</h4>
                      {item.variantTitle !== "Default Title" && (
                        <p className="text-xs text-muted-foreground">{item.variantTitle}</p>
                      )}
                      <p className="text-sm font-semibold mt-0.5">
                        €{parseFloat(item.price.amount).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeItem(item.variantId)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-xs">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex-shrink-0 space-y-3 pt-4 border-t mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Totaal</span>
                  <span className="text-lg font-semibold">€{totalPrice.toFixed(2)}</span>
                </div>
                <Button
                  onClick={handleCheckout}
                  className="w-full"
                  size="lg"
                  disabled={items.length === 0 || isLoading || isSyncing}
                >
                  {isLoading || isSyncing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Afrekenen
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
