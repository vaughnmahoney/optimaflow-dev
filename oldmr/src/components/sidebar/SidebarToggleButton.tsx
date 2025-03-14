
import { KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarToggleButtonProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  handleKeyboardNavigation: (e: KeyboardEvent, action: () => void) => void;
}

export function SidebarToggleButton({ 
  isCollapsed, 
  toggleSidebar, 
  handleKeyboardNavigation 
}: SidebarToggleButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      onKeyDown={(e) => handleKeyboardNavigation(e, toggleSidebar)}
      className="text-sidebar-icon hover:bg-sidebar-hover hover:text-sidebar-hover-text rounded-full"
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
    </Button>
  );
}
