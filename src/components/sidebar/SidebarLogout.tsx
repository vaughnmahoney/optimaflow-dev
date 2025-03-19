
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarLogoutProps {
  isCollapsed: boolean;
}

export function SidebarLogout({ isCollapsed }: SidebarLogoutProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate("/login");
  };

  return (
    <TooltipProvider delayDuration={300}>
      {isCollapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full h-10 rounded-md text-danger-DEFAULT hover:bg-danger-DEFAULT/10 transition-colors"
              aria-label="Logout"
            >
              <LogOut size={20} strokeWidth={1.5} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Logout</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 h-10 w-full rounded-md text-danger-DEFAULT hover:bg-danger-DEFAULT/10 transition-colors"
        >
          <LogOut size={20} strokeWidth={1.5} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      )}
    </TooltipProvider>
  );
}
