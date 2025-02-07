
import { useLocation } from "react-router-dom";
import { Calendar, History, UserPlus } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Daily Attendance",
    url: "/supervisor",
    icon: Calendar,
  },
  {
    title: "Add Technician",
    url: "/admin",
    icon: UserPlus,
  },
  {
    title: "Attendance History",
    url: "/attendance-history",
    icon: History,
  },
];

export function SidebarNavigation() {
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.url}
                tooltip={item.title}
                className="group transition-colors flex items-center justify-center"
              >
                <a href={item.url} className="w-full flex items-center gap-3">
                  <item.icon 
                    className="group-hover:text-blue-600 transition-colors w-5 h-5" 
                    strokeWidth={1.75}
                  />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
