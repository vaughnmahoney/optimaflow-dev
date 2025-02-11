
import { useLocation } from "react-router-dom";
import { Calendar, History, UserPlus } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
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
      <SidebarGroupContent>
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.url}
                tooltip={item.title}
                className="group transition-colors"
              >
                <a 
                  href={item.url} 
                  className={`flex items-center gap-3 px-3 py-2 rounded-md w-full
                    ${location.pathname === item.url 
                      ? 'text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <item.icon 
                    className={`w-5 h-5 transition-colors
                      ${location.pathname === item.url 
                        ? 'text-gray-900' 
                        : 'text-gray-500 group-hover:text-gray-700'
                      }`}
                    strokeWidth={1.75}
                  />
                  <span className="font-medium">{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
