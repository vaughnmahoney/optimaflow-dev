
import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { useLocation } from "react-router-dom";
import { X, Search } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { SidebarProfile } from "@/components/sidebar/SidebarProfile";
import { SidebarLogout } from "@/components/sidebar/SidebarLogout";
import { SidebarToggleButton } from "@/components/sidebar/SidebarToggleButton";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";
import { MobileSidebarToggle } from "@/components/sidebar/MobileSidebarToggle";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function AppSidebar() {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get sidebar state from context
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Read and set sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-state");
    if (savedState === "collapsed" || savedState === "expanded") {
      // Only update if the saved state is different from current state
      if ((savedState === "collapsed" && state !== "collapsed") || 
          (savedState === "expanded" && state === "collapsed")) {
        toggleSidebar();
      }
    }
  }, []);

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebar-state", state);
  }, [state]);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  // Fetch flagged work orders count for badge
  const { data: flaggedWorkOrdersCount = 0 } = useQuery({
    queryKey: ["flaggedWorkOrdersCount"],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from("work_orders")
        .select("id", { count: 'exact' })
        .in("status", ["flagged", "needs_review"]);
      
      if (error) {
        console.error("Error fetching flagged work orders count:", error);
        return 0;
      }
      
      return count || 0;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Handle keyboard navigation
  const handleKeyboardNavigation = (e: KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <MobileSidebarToggle 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
      />

      {/* Main Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          "fixed left-0 top-[var(--header-height)] bottom-0 z-40",
          "flex flex-col bg-sidebar border-r border-sidebar-border shadow-sm",
          "transition-all duration-300 ease-in-out",
          "md:translate-x-0", // Always visible on desktop
          isMobileOpen ? "translate-x-0" : "-translate-x-full" // Toggle on mobile
        )}
        style={{
          width: isCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)',
        }}
        aria-label="Main navigation"
        role="navigation"
      >
        {/* Profile Section - Moved to top of sidebar */}
        <div className="px-3 py-4 border-b border-sidebar-border">
          <SidebarProfile isCollapsed={isCollapsed} />
        </div>
        
        {/* Navigation Items - Scrollable Area */}
        <div className="overflow-y-auto flex-1 py-3 px-2">
          <SidebarNavigation 
            isCollapsed={isCollapsed} 
            searchTerm={searchTerm} 
            flaggedWorkOrdersCount={flaggedWorkOrdersCount} 
          />
        </div>
        
        {/* Sidebar Footer with Logout */}
        <div className="mt-auto p-3 border-t border-sidebar-border">
          <SidebarLogout isCollapsed={isCollapsed} />
        </div>
      </div>
      
      {/* Backdrop overlay for mobile - closes sidebar when clicked */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
