
import { Menu } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
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
      <SidebarHeader className="flex items-center justify-between p-4">
        <SidebarLogo />
        <SidebarTrigger className="h-8 w-8 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
          <Menu className="h-6 w-6" />
        </SidebarTrigger>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarNavigation />
      </SidebarContent>

      <SidebarFooter className="mt-auto p-4 border-t border-gray-100">
        <SidebarLogout />
      </SidebarFooter>
    </Sidebar>
  );
}
