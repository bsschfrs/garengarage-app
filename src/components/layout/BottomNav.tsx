import { Home, ShoppingBag, Scissors, Users, User } from "lucide-react";
import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/shop", icon: ShoppingBag, label: "Shop" },
  { to: "/crochet-mee", icon: Scissors, label: "Crochet Mee" },
  { to: "/community", icon: Users, label: "Community" },
  { to: "/profiel", icon: User, label: "Profiel" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm safe-bottom md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] transition-colors ${
                isActive ? "text-accent-foreground" : "text-nav-inactive"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <tab.icon className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.6} />
                <span className={isActive ? "font-medium" : ""}>{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
