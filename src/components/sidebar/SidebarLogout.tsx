
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SidebarLogout() {
  return (
    <Button 
      variant="ghost" 
      className="w-full justify-start hover:bg-purple-50 hover:text-purple-900 transition-all duration-300 whitespace-nowrap"
    >
      <LogOut className="mr-2 h-5 w-5 shrink-0" />
      <span className="font-medium transition-opacity duration-300">
        Logout
      </span>
    </Button>
  );
}
