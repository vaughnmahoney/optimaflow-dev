
import { useLocation } from "react-router-dom";
import { 
  AlertCircle, Database, Users, BarChart2,
  LucideIcon, FileText  // Added FileText icon
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
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  badge?: number;
  roles?: string[];
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
      roles: ["admin", "lead", "user"] 
    },
    { 
      to: "/order-history", 
      icon: FileText, 
      label: "Order History", 
      isActive: location.pathname.startsWith("/order-history"),
      roles: ["admin", "lead", "user", "technician"] // Include technician role
    },
    { 
      to: "/bulk-orders", 
      icon: Database, 
      label: "Bulk Import Test", 
      isActive: location.pathname.startsWith("/bulk-orders"),
      roles: ["admin"] 
    },
    {
      to: "/reports",
      icon: BarChart2,
      label: "Reports",
      isActive: location.pathname.startsWith("/reports"),
      roles: ["admin"] 
    },
    { 
      to: "/users", 
      icon: Users, 
      label: "User Management", 
      isActive: location.pathname.startsWith("/users"),
      roles: ["admin"] 
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
