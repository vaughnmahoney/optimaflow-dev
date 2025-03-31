
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu, Zap } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserDisplay } from "./UserDisplay";
import { useSidebar } from "@/components/ui/sidebar";

interface HeaderProps {
  title?: string;
  children?: React.ReactNode;
}

export function Header({ title, children }: HeaderProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();
  
  return (
    <div className="w-full h-full flex items-center justify-between px-3 sm:px-6 py-2">
      {/* Left section with sidebar trigger or menu button */}
      <div className="flex items-center">
        {isMobile ? (
          <button
            onClick={() => setOpenMobile(true)}
            className="p-1 mr-2"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        ) : (
          <SidebarTrigger className="mr-3" />
        )}
      </div>
      
      {/* Center section with OptimaFlow logo and text - centered on all devices */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
        <Zap className="h-5 w-5 text-primary mr-2" />
        <span className="font-semibold text-lg">OptimaFlow</span>
      </div>
      
      {/* Right section with profile */}
      <div className="flex items-center gap-2">
        {/* Only show children (import controls, etc.) on non-mobile screens */}
        {!isMobile ? children : null}
        
        <UserDisplay />
      </div>
    </div>
  );
}
