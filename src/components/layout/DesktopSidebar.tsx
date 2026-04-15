import { Home, ShoppingBag, Scissors, Users, User, Shield } from "lucide-react";
import { NavLink } from "react-router-dom";
import logo from "@/assets/logo.png";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/shop", icon: ShoppingBag, label: "Shop" },
  { to: "/crochet-mee", icon: Scissors, label: "Crochet Mee" },
  { to: "/community", icon: Users, label: "Community" },
  { to: "/profiel", icon: User, label: "Profiel" },
];

interface Props {
  isAdmin?: boolean;
}

export default function DesktopSidebar({ isAdmin }: Props) {
  return (
    <aside className="hidden md:flex md:w-56 flex-col border-r border-border bg-sidebar min-h-screen">
      <div className="flex items-center justify-center py-6">
        <img src={logo} alt="De Garengarage" className="h-16 w-16 object-contain" />
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-primary/60 text-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`
            }
          >
            <item.icon className="h-4.5 w-4.5" strokeWidth={1.8} />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="my-3 border-t border-border" />
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-primary/60 text-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`
              }
            >
              <Shield className="h-4.5 w-4.5" strokeWidth={1.8} />
              <span>Admin</span>
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}
