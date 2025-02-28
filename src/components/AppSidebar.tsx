
import { useSidebar } from "@/components/ui/sidebar";
import { Menu, ChevronLeft } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { SidebarLogo } from "@/components/sidebar/SidebarLogo";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";
import { SidebarLogout } from "@/components/sidebar/SidebarLogout";
import { SidebarProfile } from "@/components/sidebar/SidebarProfile";

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      className={`fixed top-[var(--header-height)] left-0 bottom-0 z-40 border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out overflow-hidden ${
        isCollapsed ? 'w-[4.5rem]' : 'w-64'
      }`}
    >
      <div className="h-full flex flex-col overflow-hidden">
        <SidebarHeader className="p-4 flex flex-col gap-6 border-b border-sidebar-border">
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
          <SidebarProfile isCollapsed={isCollapsed} />
        </SidebarHeader>
  
        <SidebarContent className="p-3 overflow-y-auto flex-1 hover:overflow-y-auto">
          <SidebarNavigation isCollapsed={isCollapsed} />
        </SidebarContent>
  
        <SidebarFooter className="mt-auto p-3 border-t border-sidebar-border">
          <SidebarLogout isCollapsed={isCollapsed} />
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
