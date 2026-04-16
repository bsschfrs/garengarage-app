import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import DesktopSidebar from "./DesktopSidebar";
import { useAuth } from "@/hooks/useAuth";

export default function AppLayout() {
  const { isAdmin } = useAuth();

  return (
    <div className="flex min-h-screen w-full">
      <DesktopSidebar isAdmin={isAdmin} />
      <main className="flex-1 min-w-0 w-full pb-20 md:pb-0">
        <div className="mx-auto w-full max-w-2xl min-w-0 px-4 py-6 md:px-6 md:py-8">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
