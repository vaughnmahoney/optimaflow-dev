import { useLocation } from "react-router-dom";
import { 
  LayoutDashboard, AlertCircle, Clock, Users, Database,
  LucideIcon  // Add explicit import for LucideIcon type
} from "lucide-react";
import { SidebarNavItem } from "./SidebarNavItem";
import { useAuth } from "@/components/AuthProvider";

interface SidebarNavigationProps {
  isCollapsed: boolean;
  searchTerm: string;
  flaggedWorkOrdersCount?: number;
}

interface NavItem {
  to: string;
  icon: LucideIcon;  // Now properly typed
  label: string;
  isActive: boolean;
  badge?: number;
  roles?: string[]; // Add roles to control visibility
}

export function SidebarNavigation({ 
  isCollapsed, 
  searchTerm,
  flaggedWorkOrdersCount = 0
}: SidebarNavigationProps) {
  const location = useLocation();
  const { userRole } = useAuth();
  
  // Create navigation items with role-based visibility
  const navItems: NavItem[] = [
    { 
      to: "/work-orders", 
      icon: AlertCircle, 
      label: "Quality Control", 
      isActive: location.pathname.startsWith("/work-orders"),
      badge: flaggedWorkOrdersCount > 0 ? flaggedWorkOrdersCount : undefined,
      roles: ["admin", "lead", "user"] // Everyone can see this
    },
    { 
      to: "/bulk-orders-test", 
      icon: Database, 
      label: "Bulk Import Test", 
      isActive: location.pathname.startsWith("/bulk-orders-test"),
      roles: ["admin"] // Only admins
    },
    {
      to: "/attendance", 
      icon: Clock, 
      label: "Attendance", 
      isActive: location.pathname.startsWith("/attendance") || location.pathname.startsWith("/supervisor"),
      roles: ["admin"] // Only admins
    },
    { 
      to: "/employees", 
      icon: Users, 
      label: "Employees", 
      isActive: location.pathname.startsWith("/employees") || location.pathname.startsWith("/admin"),
      roles: ["admin"] // Only admins
    },
    { 
      to: "/users", 
      icon: Users, 
      label: "User Management", 
      isActive: location.pathname.startsWith("/users"),
      roles: ["admin"] // Only admins
    }
  ];

  // Filter items by role and search term
  const filteredNavItems = navItems.filter(item => 
    item.label.toLowerCase().includes(searchTerm.toLowerCase()) && 
    (!item.roles || item.roles.includes(userRole))
  );

  return (
    <nav className="flex flex-col gap-1">
      {filteredNavItems.map((item) => (
        <SidebarNavItem
          key={item.to}
          to={item.to}
          icon={item.icon}
          label={item.label}
          isActive={item.isActive}
          isCollapsed={isCollapsed}
          badge={item.badge}
        />
      ))}
    </nav>
  );
}
