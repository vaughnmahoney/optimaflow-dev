
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProfileProps {
  isCollapsed: boolean;
}

export function SidebarProfile({ isCollapsed }: SidebarProfileProps) {
  // This would normally come from a user context or API
  // For now using static data for demonstration
  const userName = "John Doe";
  
  // Get initials from the name (first letter of first and last name)
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(userName);

  return (
    <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
      <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
        <AvatarImage src="/placeholder.svg" />
        <AvatarFallback className="bg-sidebar-accent text-white">{initials}</AvatarFallback>
      </Avatar>
      
      {!isCollapsed && (
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sidebar-text truncate">{userName}</div>
        </div>
      )}
    </div>
  );
}
