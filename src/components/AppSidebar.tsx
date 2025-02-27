
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
import { SidebarProfile } from "@/components/sidebar/SidebarProfile";

export function AppSidebar() {
  return (
    <Sidebar
      className="w-64 border-r border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm transition-all duration-300 ease-in-out group data-[state=closed]:w-16"
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between w-full p-4">
          <div className="flex-1 overflow-hidden transition-all duration-300">
            <SidebarLogo />
          </div>
          <SidebarTrigger className="h-8 w-8 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
            <Menu className="h-6 w-6" />
          </SidebarTrigger>
        </div>
        <SidebarProfile />
      </SidebarHeader>

      <SidebarContent>
        <SidebarNavigation />
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t border-gray-100">
        <SidebarLogout />
      </SidebarFooter>
    </Sidebar>
  );
}
