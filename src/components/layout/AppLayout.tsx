import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import DesktopSidebar from "./DesktopSidebar";
import { useAuth } from "@/hooks/useAuth";

export default function AppLayout() {
  const { isAdmin } = useAuth();

  return (
    <div className="flex min-h-screen w-full">
      <DesktopSidebar isAdmin={isAdmin} />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="mx-auto max-w-2xl px-4 py-6 md:px-6 md:py-8">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
