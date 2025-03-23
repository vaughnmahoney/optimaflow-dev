
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarNavItemProps {
  item: {
    title: string;
    url?: string;
    icon: React.ElementType;
  };
  isCollapsed: boolean;
  isActive: boolean;
  flaggedCount?: number;
}

export function SidebarNavItem({ 
  item, 
  isCollapsed, 
  isActive,
  flaggedCount
}: SidebarNavItemProps) {
  const Icon = item.icon;
  
  if (!item.url) return null;
  
  return isCollapsed ? (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={item.url}
            className={cn(
              "relative flex items-center justify-center h-10 w-10 mx-auto rounded-md",
              "transition-colors duration-200",
              isActive
                ? 'bg-purple-50 text-purple-900 shadow-sm'
                : 'text-gray-700 hover:bg-gray-50/80 hover:text-gray-900 hover:shadow-sm'
            )}
            aria-label={item.title}
            tabIndex={0}
            role="menuitem"
          >
            <Icon size={20} strokeWidth={1.8} />
            {flaggedCount !== undefined && flaggedCount > 0 && (
              <span className="absolute top-0 right-0 bg-white text-black text-xs w-4 h-4 flex items-center justify-center rounded-full">
                {flaggedCount > 99 ? '99+' : flaggedCount}
              </span>
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{item.title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    <Link
      to={item.url}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md",
        "transition-colors duration-200",
        isActive
          ? "bg-purple-50 text-purple-900 font-medium shadow-sm"
          : "text-gray-700 hover:bg-gray-50/80 hover:text-gray-900 hover:shadow-sm"
      )}
      tabIndex={0}
      role="menuitem"
    >
      <Icon size={20} strokeWidth={1.8} />
      <span className="flex-1 truncate">{item.title}</span>
      {flaggedCount !== undefined && flaggedCount > 0 && (
        <span className={cn(
          "rounded-full px-2 py-0.5 text-xs font-medium",
          isActive 
            ? "bg-white text-black" 
            : "bg-primary/10 text-primary"
        )}>
          {flaggedCount}
        </span>
      )}
    </Link>
  );
}
