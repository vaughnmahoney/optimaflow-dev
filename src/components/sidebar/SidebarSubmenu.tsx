
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
  title: string;
  icon: React.ElementType;
  isCollapsed: boolean;
  children: React.ReactNode;
}

export function SidebarSubmenu({ 
  title, 
  icon: Icon, 
  isCollapsed,
  children 
}: SidebarSubmenuProps) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full overflow-hidden transition-all duration-300 ease-in-out"
    >
      <CollapsibleTrigger
        className={`group flex items-center justify-between w-full px-4 py-2 rounded-md 
          transition-all duration-200 ease-in-out hover:scale-[1.02]
          text-gray-700 hover:bg-gray-50/80 hover:text-gray-900 hover:shadow-sm`}
      >
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            <Icon className="w-full h-full" strokeWidth={1.5} />
          </div>
          <span className="font-medium">{title}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ease-in-out transform
            ${isOpen ? "rotate-180" : ""}
            group-hover:scale-110`}
        />
      </CollapsibleTrigger>
      
      <CollapsibleContent className="animate-accordion-down overflow-hidden">
        <div className="pl-12 pr-4 pb-2 space-y-1">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
