import { useMemo, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SidebarNavItem } from "./SidebarNavItem";
import { SidebarSubmenu } from "./SidebarSubmenu";
import { navigationConfig } from "@/config/navigationConfig";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

export function SidebarNavigation({ 
  isCollapsed, 
  searchTerm,
  flaggedWorkOrdersCount = 0,
}: { 
  isCollapsed: boolean;
  searchTerm?: string;
  flaggedWorkOrdersCount?: number;
}) {
  const location = useLocation();
  const { session } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if the current user is an admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session) {
        try {
          const { data } = await supabase.rpc('is_admin');
          setIsAdmin(!!data);
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      }
    };
    
    checkAdminStatus();
  }, [session]);

  // Filter navigation items
  const filteredNavigation = useMemo(() => {
    return navigationConfig.filter(item => {
      // Show all items to admin users
      if (isAdmin) return true;
      
      // For non-admin users, only show non-admin-only items
      return !item.adminOnly;
    }).filter(item => {
      // Apply search filter if a search term is provided
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      
      // Check if the menu item title matches the search
      if (item.title.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Check if any child items match the search
      if (item.items && item.items.some(subItem => 
        subItem.title.toLowerCase().includes(searchLower)
      )) {
        return true;
      }
      
      return false;
    });
  }, [navigationConfig, searchTerm, isAdmin]);

  return (
    <div className="space-y-2">
      {filteredNavigation.map((item) => {
        // If item has subitems, render a submenu
        if (item.items && item.items.length > 0) {
          return (
            <SidebarSubmenu
              key={item.title}
              title={item.title}
              icon={item.icon}
              isCollapsed={isCollapsed}
            >
              {item.items.filter(subItem => {
                if (isAdmin) return true;
                return !subItem.adminOnly;
              }).map((subItem) => (
                <SidebarNavItem
                  key={subItem.title}
                  item={subItem}
                  isCollapsed={isCollapsed}
                  isActive={location.pathname === subItem.url}
                  flaggedCount={
                    subItem.url === "/quality-control/flagged" ? flaggedWorkOrdersCount : undefined
                  }
                />
              ))}
            </SidebarSubmenu>
          );
        }
        
        // Otherwise render a single nav item
        return (
          <SidebarNavItem
            key={item.title}
            item={item}
            isCollapsed={isCollapsed}
            isActive={location.pathname === item.url}
          />
        );
      })}
    </div>
  );
}
