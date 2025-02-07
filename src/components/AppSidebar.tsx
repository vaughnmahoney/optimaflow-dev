
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
    <Sidebar className="bg-[#1A1F2C] border-r border-white/10">
      <SidebarHeader className="p-4 border-b border-white/10">
        <SidebarLogo />
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarNavigation />
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-white/10">
        <SidebarLogout />
      </SidebarFooter>
    </Sidebar>
  );
}
