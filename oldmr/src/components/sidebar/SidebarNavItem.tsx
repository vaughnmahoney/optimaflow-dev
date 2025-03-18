
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SidebarNavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  badge?: number;
}

export function SidebarNavItem({ 
  to, 
  icon: Icon, 
  label, 
  isActive, 
  isCollapsed,
  badge 
}: SidebarNavItemProps) {
  return isCollapsed ? (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={to}
            className={cn(
              "relative flex items-center justify-center h-10 w-10 mx-auto rounded-md",
              "transition-colors duration-200",
              isActive
                ? "bg-sidebar-active text-sidebar-active-text"
                : "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-hover-text"
            )}
            aria-label={label}
            tabIndex={0}
            role="menuitem"
          >
            <Icon size={20} strokeWidth={1.8} />
            {badge && (
              <span className="absolute top-0 right-0 bg-white text-black text-xs w-4 h-4 flex items-center justify-center rounded-full">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md",
        "transition-colors duration-200",
        isActive
          ? "bg-sidebar-active text-sidebar-active-text font-medium"
          : "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-hover-text"
      )}
      tabIndex={0}
      role="menuitem"
    >
      <Icon size={20} strokeWidth={1.8} />
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <span className={cn(
          "rounded-full px-2 py-0.5 text-xs font-medium",
          isActive 
            ? "bg-white text-black" 
            : "bg-primary/10 text-primary"
        )}>
          {badge}
        </span>
      )}
    </Link>
  );
}
