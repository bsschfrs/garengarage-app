import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { useCartSync } from "@/hooks/useCartSync";
import AppLayout from "@/components/layout/AppLayout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ShopGaren from "./pages/ShopGaren";
import ShopOntwerpen from "./pages/ShopOntwerpen";
import ProductDetail from "./pages/ProductDetail";
import CrochetMee from "./pages/CrochetMee";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  useCartSync();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/garen" element={<ShopGaren />} />
          <Route path="/shop/ontwerpen" element={<ShopOntwerpen />} />
          <Route path="/shop/product/:handle" element={<ProductDetail />} />
          <Route path="/crochet-mee" element={<CrochetMee />} />
          <Route path="/community" element={<Community />} />
          <Route path="/profiel" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
