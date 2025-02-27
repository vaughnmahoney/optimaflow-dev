
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { NavigationItem } from "@/config/navigationConfig";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SidebarSubmenuProps {
  item: NavigationItem;
}

export function SidebarSubmenu({ item }: SidebarSubmenuProps) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(
    // Initialize open state based on current route
    item.items?.some(subItem => location.pathname === subItem.url) || false
  );
  
  const isActive = item.items?.some(
    subItem => location.pathname === subItem.url
  );

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full overflow-hidden transition-all duration-500 ease-in-out"
    >
      <CollapsibleTrigger
        className={`group flex items-center justify-between w-full px-4 py-2 rounded-md 
          transition-all duration-300 ease-in-out hover:scale-[1.02]
          ${isActive 
            ? 'bg-purple-50 text-purple-900 shadow-sm' 
            : 'text-gray-700 hover:bg-gray-50/80 hover:text-gray-900 hover:shadow-sm'
          }`}
      >
        <div className="flex items-center gap-3">
          <item.icon 
            className="w-6 h-6 transition-colors duration-300" 
            strokeWidth={1.75} 
          />
          <span className="font-semibold">{item.title}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-500 ease-in-out transform
            ${isOpen ? "rotate-180" : ""}
            group-hover:scale-110`}
        />
      </CollapsibleTrigger>
      
      <CollapsibleContent 
        className="animate-accordion-down overflow-hidden"
      >
        <div className="pl-12 pr-4 pb-2 space-y-1">
          {item.items?.map((subItem) => (
            <a
              key={subItem.url}
              href={subItem.url}
              className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm
                transition-all duration-300 ease-in-out
                hover:scale-[1.02] hover:shadow-sm
                ${location.pathname === subItem.url
                  ? 'bg-purple-50 text-purple-900 font-semibold shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900'
                }
                animate-fade-in`}
            >
              <subItem.icon 
                className="w-5 h-5 transition-colors duration-300" 
                strokeWidth={1.75} 
              />
              <span className="transition-opacity duration-300">
                {subItem.title}
              </span>
            </a>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

