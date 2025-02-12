
import { useLocation } from "react-router-dom";
import { Calendar, History, UserPlus, CheckCircle2 } from "lucide-react";
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
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                >
                  <a 
                    href={item.url} 
                    className={`group relative flex items-center justify-center gap-3 px-5 py-2 rounded-md w-full transition-all duration-200
                      data-[collapsed=true]:justify-center
                      ${isActive 
                        ? 'bg-purple-50 text-purple-900' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <div className="relative">
                      <item.icon 
                        className={`w-5 h-5 flex-shrink-0 transition-all duration-200
                          ${isActive ? 'stroke-purple-600' : 'stroke-current'}
                        `}
                        strokeWidth={1.75}
                      />
                      {isActive && (
                        <CheckCircle2 
                          className="absolute -right-1 -top-1 w-3 h-3 text-purple-500 fill-white"
                          strokeWidth={2}
                        />
                      )}
                    </div>
                    <span className={`font-medium truncate transition-all duration-200
                      ${isActive ? 'text-purple-900' : 'text-gray-700'}
                    `}>
                      {item.title}
                    </span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
