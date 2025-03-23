
import { useLocation } from "react-router-dom";
import { 
  LayoutDashboard, AlertCircle, Clock, Users, Database
} from "lucide-react";
import { SidebarNavItem } from "./SidebarNavItem";

interface SidebarNavigationProps {
  isCollapsed: boolean;
  searchTerm: string;
  flaggedWorkOrdersCount?: number;
}

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  badge?: number;
}

export function SidebarNavigation({ 
  isCollapsed, 
  searchTerm,
  flaggedWorkOrdersCount = 0
}: SidebarNavigationProps) {
  const location = useLocation();
  
  // Create navigation items
  const navItems: NavItem[] = [
    { 
      to: "/work-orders", 
      icon: AlertCircle, 
      label: "Quality Control", 
      isActive: location.pathname.startsWith("/work-orders"),
      badge: flaggedWorkOrdersCount > 0 ? flaggedWorkOrdersCount : undefined
    },
    { 
      to: "/bulk-orders-test", 
      icon: Database, 
      label: "Bulk Import Test", 
      isActive: location.pathname.startsWith("/bulk-orders-test") 
    },
    {
      to: "/attendance", 
      icon: Clock, 
      label: "Attendance", 
      isActive: location.pathname.startsWith("/attendance") || location.pathname.startsWith("/supervisor")
    },
    { 
      to: "/employees", 
      icon: Users, 
      label: "Employees", 
      isActive: location.pathname.startsWith("/employees") || location.pathname.startsWith("/admin") 
    },
    { 
      to: "/users", 
      icon: Users, 
      label: "User Management", 
      isActive: location.pathname.startsWith("/users") 
    }
  ];

  // Filter navigation items based on search
  const filteredNavItems = navItems.filter(item => 
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
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
