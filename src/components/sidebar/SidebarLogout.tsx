
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SidebarLogout() {
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
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors group/logout group-data-[state=closed]:justify-center group-data-[state=closed]:px-0"
    >
      <LogOut className="w-5 h-5 shrink-0" strokeWidth={1.75} />
      <span className="font-medium truncate transition-all duration-300 group-data-[state=closed]:w-0 group-data-[state=closed]:opacity-0">
        Logout
      </span>
    </button>
  );
}
