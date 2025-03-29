
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Zap } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserDisplay } from "./UserDisplay";

interface HeaderProps {
  title?: string;
  children?: React.ReactNode;
}

export function Header({ title, children }: HeaderProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  return (
    <div className="w-full h-full flex items-center justify-between px-3 sm:px-6 py-2">
      {/* Left section with sidebar trigger and logo */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="mr-1" />
        
        <div 
          className="flex items-center gap-1 cursor-pointer transition-all duration-200 hover:opacity-80" 
          onClick={() => navigate('/')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate('/');
            }
          }}
          aria-label="Go to dashboard"
        >
          <Zap className="h-5 w-5 text-primary" />
          {!isMobile && <span className="text-lg font-semibold">OptimaFlow</span>}
        </div>
        
        {/* Title - Only visible on non-mobile screens */}
        {title && !isMobile && (
          <>
            <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>
            <h1 className="text-lg sm:text-xl font-bold hidden sm:block">
              {title}
            </h1>
          </>
        )}
      </div>
      
      {/* Right section with profile and actions */}
      <div className="flex items-center gap-2">
        {/* Only show children (import controls, etc.) on non-mobile screens */}
        {!isMobile ? children : null}
        
        <UserDisplay />
      </div>
    </div>
  );
}
