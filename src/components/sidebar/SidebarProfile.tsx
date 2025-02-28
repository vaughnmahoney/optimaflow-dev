
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit } from "lucide-react";

interface SidebarProfileProps {
  isCollapsed: boolean;
}

export function SidebarProfile({ isCollapsed }: SidebarProfileProps) {
  return (
    <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
      <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
        <AvatarImage src="/placeholder.svg" />
        <AvatarFallback className="bg-sidebar-accent text-white">HF</AvatarFallback>
      </Avatar>
      
      {!isCollapsed && (
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sidebar-text truncate">Hyland Filter</div>
          <button 
            className="flex items-center gap-1.5 text-xs text-sidebar-icon hover:text-sidebar-accent transition-colors"
          >
            <Edit size={12} />
            <span>Edit Profile</span>
          </button>
        </div>
      )}
    </div>
  );
}
