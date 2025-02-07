
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
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
      <SidebarRail className="border-r border-gray-100 bg-gray-50/50 hover:bg-gray-100/50 transition-colors flex flex-col items-center" />
      <SidebarHeader className="p-6">
        <SidebarLogo />
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarNavigation />
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-100">
        <SidebarLogout />
      </SidebarFooter>
    </Sidebar>
  );
}
