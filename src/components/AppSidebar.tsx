
import { useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { Menu, ChevronLeft, Search } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { SidebarLogo } from "@/components/sidebar/SidebarLogo";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";
import { SidebarLogout } from "@/components/sidebar/SidebarLogout";
import { SidebarProfile } from "@/components/sidebar/SidebarProfile";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [searchTerm, setSearchTerm] = useState("");

  // For mobile view
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const toggleMobileMenu = () => setIsMobileOpen(!isMobileOpen);

  return (
    <>
      {/* Mobile Toggle Button - Only visible on small screens */}
      <button
        onClick={toggleMobileMenu}
        className="fixed top-4 right-4 z-50 md:hidden bg-primary text-primary-foreground rounded-full p-2 shadow-md"
        aria-label="Toggle mobile menu"
      >
        <Menu size={20} />
      </button>

      {/* Main Sidebar */}
      <div 
        className={cn(
          "fixed left-0 top-[var(--header-height)] bottom-0 z-40 transition-all duration-300 ease-in-out",
          "md:translate-x-0", // Always visible on desktop
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0" // Toggle on mobile
        )}
        style={{
          width: isCollapsed ? '4.5rem' : '16rem',
          '--sidebar-width': isCollapsed ? '4.5rem' : '16rem',
        } as React.CSSProperties}
      >
        <Sidebar
          className="h-full border-r border-sidebar-border bg-sidebar shadow-lg"
        >
          <SidebarHeader className="p-4 flex flex-col gap-4 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              <div className={`transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 flex-1'}`}>
                <SidebarLogo />
              </div>
              <button
                onClick={toggleSidebar}
                className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-sidebar-hover text-sidebar-icon transition-colors"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <Menu size={20} />
                ) : (
                  <ChevronLeft size={20} />
                )}
              </button>
            </div>
            
            {/* Profile Section */}
            <SidebarProfile isCollapsed={isCollapsed} />
            
            {/* Search Input - Hidden when collapsed */}
            {!isCollapsed && (
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9 bg-sidebar-hover text-sidebar-foreground placeholder:text-sidebar-muted"
                />
              </div>
            )}
          </SidebarHeader>

          <SidebarContent className="px-3 py-2 overflow-y-auto">
            <SidebarNavigation isCollapsed={isCollapsed} searchTerm={searchTerm} />
          </SidebarContent>

          <SidebarFooter className="mt-auto p-3 border-t border-sidebar-border">
            <SidebarLogout isCollapsed={isCollapsed} />
          </SidebarFooter>
        </Sidebar>
      </div>
      
      {/* Backdrop overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />
      )}
    </>
  );
}
