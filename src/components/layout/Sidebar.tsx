"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Briefcase,
  Mail,
  Activity,
  Settings,
  LogOut,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: TrendingUp },
  { label: "Customers", href: "/customers", icon: UserCheck },
  { label: "Deals", href: "/deals", icon: Briefcase },
  { label: "Activities", href: "/activities", icon: Activity },
  { label: "Emails", href: "/emails", icon: Mail },
  { label: "Team", href: "/team", icon: Users, roles: ["admin", "manager"] },
  { label: "Settings", href: "/settings", icon: Settings, roles: ["admin"] },
];

interface SidebarProps {
  user: { name: string; email: string; role: string };
  onLogout: () => void;
}

export function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const filteredNav = navItems.filter(
    (item) => !item.roles || item.roles.includes(user.role)
  );

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-gray-900 text-white transition-all duration-300 flex-shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">SalesCRM</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mx-auto">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-1 rounded-lg hover:bg-gray-800 transition-colors",
            collapsed && "mx-auto mt-0"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium",
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-gray-800">
        <div
          className={cn(
            "flex items-center gap-3 p-2 rounded-xl",
            collapsed && "justify-center"
          )}
        >
          <Avatar name={user.name} size="sm" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role.replace("_", " ")}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={onLogout}
            className="w-full flex justify-center p-2 rounded-xl hover:bg-gray-800 transition-colors mt-1"
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
    </aside>
  );
}
