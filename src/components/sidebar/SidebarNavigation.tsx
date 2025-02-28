
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { navigationConfig } from "@/config/navigationConfig";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarNavigationProps {
  isCollapsed: boolean;
}

export function SidebarNavigation({ isCollapsed }: SidebarNavigationProps) {
  const location = useLocation();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const toggleSubmenu = (title: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Check if any submenu item is active to highlight parent
  const isParentActive = (item: any) => {
    if (!item.items) return false;
    return item.items.some((subItem: any) => location.pathname === subItem.url);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <nav className="flex flex-col gap-1">
        {navigationConfig.map((item) => {
          // For items with submenus
          if (item.items) {
            const isActive = isParentActive(item);
            const isOpen = openSubmenus[item.title] || isActive;

            return (
              <div key={item.title} className="flex flex-col">
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => toggleSubmenu(item.title)}
                        className={`flex items-center justify-center w-full h-10 rounded-md transition-colors ${
                          isActive ? 'bg-sidebar-active text-sidebar-accent' : 'text-sidebar-text hover:bg-sidebar-hover'
                        }`}
                      >
                        <item.icon size={20} strokeWidth={1.5} className={isActive ? 'text-sidebar-accent' : ''} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <button
                    onClick={() => toggleSubmenu(item.title)}
                    className={`flex items-center justify-between w-full px-3 h-10 rounded-md transition-colors ${
                      isActive ? 'bg-sidebar-active text-sidebar-accent' : 'text-sidebar-text hover:bg-sidebar-hover'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} strokeWidth={1.5} className={isActive ? 'text-sidebar-accent' : ''} />
                      <span className="font-medium text-sm">{item.title}</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                )}

                {/* Submenu items */}
                {!isCollapsed && isOpen && (
                  <div className="mt-1 ml-4 pl-4 border-l border-sidebar-border flex flex-col gap-1 animate-fade-in">
                    {item.items.map((subItem) => {
                      const isSubItemActive = location.pathname === subItem.url;
                      
                      return (
                        <a
                          key={subItem.title}
                          href={subItem.url}
                          className={`flex items-center gap-3 px-3 h-9 rounded-md text-sm transition-colors ${
                            isSubItemActive
                              ? 'bg-sidebar-active text-sidebar-accent font-medium'
                              : 'text-sidebar-text hover:bg-sidebar-hover'
                          }`}
                        >
                          <subItem.icon size={16} strokeWidth={1.5} />
                          <span>{subItem.title}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
                
                {/* Collapsed submenu (showing active items only) */}
                {isCollapsed && isOpen && (
                  <div className="mt-1 flex flex-col gap-1 animate-fade-in">
                    {item.items.map((subItem) => {
                      const isSubItemActive = location.pathname === subItem.url;
                      if (!isSubItemActive) return null;
                      
                      return (
                        <Tooltip key={subItem.title}>
                          <TooltipTrigger asChild>
                            <a
                              href={subItem.url}
                              className="flex items-center justify-center w-full h-8 rounded-md bg-sidebar-active text-sidebar-accent"
                            >
                              <subItem.icon size={16} strokeWidth={1.5} />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{subItem.title}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // For regular menu items
          const isActive = location.pathname === item.url;
          
          return isCollapsed ? (
            <Tooltip key={item.title}>
              <TooltipTrigger asChild>
                <a
                  href={item.url}
                  className={`flex items-center justify-center w-full h-10 rounded-md transition-colors ${
                    isActive ? 'bg-sidebar-active text-sidebar-accent' : 'text-sidebar-text hover:bg-sidebar-hover'
                  }`}
                >
                  <item.icon size={20} strokeWidth={1.5} className={isActive ? 'text-sidebar-accent' : ''} />
                </a>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.title}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <a
              key={item.title}
              href={item.url}
              className={`flex items-center gap-3 px-3 h-10 rounded-md transition-colors ${
                isActive ? 'bg-sidebar-active text-sidebar-accent' : 'text-sidebar-text hover:bg-sidebar-hover'
              }`}
            >
              <item.icon size={20} strokeWidth={1.5} className={isActive ? 'text-sidebar-accent' : ''} />
              <span className="font-medium text-sm">{item.title}</span>
            </a>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}
