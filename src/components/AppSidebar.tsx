
import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { useLocation, Link } from "react-router-dom";
import { 
  Menu, X, ChevronLeft, ChevronRight, Search, 
  LayoutDashboard, AlertCircle, CreditCard, Car, 
  Package2, Clock, Users, Receipt, ExternalLink,
  CalendarDays
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { SidebarLogo } from "@/components/sidebar/SidebarLogo";
import { SidebarProfile } from "@/components/sidebar/SidebarProfile";
import { SidebarLogout } from "@/components/sidebar/SidebarLogout";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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

  // Handle keyboard navigation
  const handleKeyboardNavigation = (e: KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

  // Focus search input when sidebar expands
  useEffect(() => {
    if (!isCollapsed && searchInputRef.current) {
      // Small delay to wait for transition
      const timer = setTimeout(() => {
        if (document.activeElement?.tagName !== "INPUT") {
          searchInputRef.current?.focus();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isCollapsed]);

  // Create navigation items
  const navItems = [
    { 
      to: "/", 
      icon: LayoutDashboard, 
      label: "Dashboard", 
      isActive: location.pathname === "/" 
    },
    { 
      to: "/work-orders", 
      icon: AlertCircle, 
      label: "Quality Control", 
      isActive: location.pathname.startsWith("/work-orders"),
      badge: 14
    },
    { 
      to: "/payroll", 
      icon: CreditCard, 
      label: "Payroll", 
      isActive: location.pathname.startsWith("/payroll") 
    },
    { 
      to: "/vehicle-maintenance", 
      icon: Car, 
      label: "Vehicle Maintenance", 
      isActive: location.pathname.startsWith("/vehicle-maintenance") 
    },
    {
      to: "/storage", 
      icon: Package2, 
      label: "Storage Units", 
      isActive: location.pathname.startsWith("/storage") || location.pathname.startsWith("/inventory")
    },
    {
      to: "/attendance", 
      icon: Clock, 
      label: "Attendance", 
      isActive: location.pathname.startsWith("/attendance")
    },
    { 
      to: "/employees", 
      icon: Users, 
      label: "Employees", 
      isActive: location.pathname.startsWith("/employees") 
    },
    { 
      to: "/receipts", 
      icon: Receipt, 
      label: "Receipts", 
      isActive: location.pathname.startsWith("/receipts") || location.pathname.startsWith("/reports")
    },
    { 
      to: "/integrations", 
      icon: ExternalLink, 
      label: "Integrations", 
      isActive: location.pathname.startsWith("/integrations") || location.pathname.startsWith("/api") 
    },
  ];

  // Filter navigation items based on search
  const filteredNavItems = navItems.filter(item => 
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Mobile Toggle Button - Fixed to the screen for easy access */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed bottom-4 right-4 z-50 shadow-md rounded-full md:hidden"
        aria-label={isMobileOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

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
        {/* Sidebar Header with Logo and Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {/* Logo - Hidden when collapsed */}
          <div className={cn(
            "transition-all duration-300", 
            isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 flex-1"
          )}>
            <SidebarLogo />
          </div>
          
          {/* Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            onKeyDown={(e) => handleKeyboardNavigation(e, toggleSidebar)}
            className="text-sidebar-icon hover:bg-sidebar-hover hover:text-sidebar-hover-text rounded-full"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>
        
        {/* Profile Section */}
        <div className="px-3 py-4 border-b border-sidebar-border">
          <SidebarProfile isCollapsed={isCollapsed} />
        </div>
        
        {/* Search Input - Hidden when collapsed */}
        {!isCollapsed && (
          <div className="p-3 border-b border-sidebar-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-sidebar-icon" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9 bg-sidebar-hover/50 text-sidebar-text placeholder:text-sidebar-icon border-sidebar-border"
              />
            </div>
          </div>
        )}
        
        {/* Navigation Items - Scrollable Area */}
        <div className="overflow-y-auto flex-1 py-3 px-2">
          <nav className="flex flex-col gap-1">
            {filteredNavItems.map((item, index) => (
              <TooltipProvider key={item.to} delayDuration={300}>
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.to}
                        className={cn(
                          "relative flex items-center justify-center h-10 w-10 mx-auto rounded-md",
                          "transition-colors duration-200",
                          item.isActive
                            ? "bg-sidebar-active text-sidebar-active-text"
                            : "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-hover-text"
                        )}
                        aria-label={item.label}
                        tabIndex={0}
                        role="menuitem"
                      >
                        <item.icon size={20} strokeWidth={1.8} />
                        {item.badge && (
                          <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs w-4 h-4 flex items-center justify-center rounded-full">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Link
                    to={item.to}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md",
                      "transition-colors duration-200",
                      item.isActive
                        ? "bg-sidebar-active text-sidebar-active-text font-medium"
                        : "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-hover-text"
                    )}
                    tabIndex={0}
                    role="menuitem"
                  >
                    <item.icon size={20} strokeWidth={1.8} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )}
              </TooltipProvider>
            ))}
          </nav>
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
