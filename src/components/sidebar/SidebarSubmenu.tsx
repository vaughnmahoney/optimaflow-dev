
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
  const [isOpen, setIsOpen] = useState(false);
  
  const isActive = item.items?.some(
    subItem => location.pathname === subItem.url
  );

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full"
    >
      <CollapsibleTrigger
        className={`flex items-center justify-between w-full px-4 py-2 rounded-md transition-colors duration-200
          ${isActive 
            ? 'bg-purple-50 text-purple-900' 
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
          }`}
      >
        <div className="flex items-center gap-3">
          <item.icon className="w-6 h-6" strokeWidth={1.75} />
          <span className="font-semibold">{item.title}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="animate-accordion-down">
        <div className="pl-12 pr-4 pb-2 space-y-1">
          {item.items?.map((subItem) => (
            <a
              key={subItem.url}
              href={subItem.url}
              className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-colors duration-200
                ${location.pathname === subItem.url
                  ? 'bg-purple-50 text-purple-900 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <subItem.icon className="w-5 h-5" strokeWidth={1.75} />
              <span>{subItem.title}</span>
            </a>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

