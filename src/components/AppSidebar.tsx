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
    <Sidebar>
      <SidebarHeader className="p-4">
        <SidebarLogo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarNavigation />
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarLogout />
      </SidebarFooter>
    </Sidebar>
  );
}