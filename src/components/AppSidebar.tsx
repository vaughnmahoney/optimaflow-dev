
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { SidebarLogo } from "@/components/sidebar/SidebarLogo";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";
import { SidebarLogout } from "@/components/sidebar/SidebarLogout";

export function AppSidebar() {
  return (
    <Sidebar
      className="border-r border-gray-200 bg-white shadow-sm transition-all duration-300"
      collapsible="icon"
    >
      <SidebarHeader className="px-4 py-6">
        <SidebarLogo />
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarNavigation />
      </SidebarContent>

      <SidebarFooter className="mt-auto p-4 border-t border-gray-100">
        <SidebarLogout />
      </SidebarFooter>
    </Sidebar>
  );
}
