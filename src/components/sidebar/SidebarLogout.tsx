
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
      className="relative flex items-center w-full px-6 py-3 text-red-600 transition-colors hover:text-red-700 group-data-[state=closed]:px-0"
    >
      <div className="absolute inset-0 mx-4 rounded-md transition-colors hover:bg-red-50 group-data-[state=closed]:mx-2" />
      <div className="relative flex items-center w-full gap-3 group-data-[state=closed]:justify-center">
        <LogOut className="w-5 h-5 shrink-0" strokeWidth={1.75} />
        <span className="font-medium transition-all duration-300 group-data-[state=closed]:w-0 group-data-[state=closed]:opacity-0 group-data-[state=closed]:translate-x-2">
          Logout
        </span>
      </div>
    </button>
  );
}
