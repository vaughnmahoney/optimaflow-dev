
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
      className="relative flex items-center w-full px-4 py-3 text-red-600 transition-colors hover:text-red-700 group-data-[state=closed]:px-0"
    >
      <div className="absolute inset-0 mx-4 rounded-md transition-colors hover:bg-red-50 group-data-[state=closed]:mx-2" />
      <div className="relative flex items-center w-full gap-3 group-data-[state=closed]:justify-center">
        <div className="w-10 h-10 flex items-center justify-center">
          <LogOut className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <span className="font-medium transition-all duration-300 opacity-100 group-data-[state=closed]:w-0 group-data-[state=closed]:opacity-0 group-data-[state=closed]:translate-x-2">
          Logout
        </span>
      </div>
    </button>
  );
}
