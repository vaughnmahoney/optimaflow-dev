
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Zap } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  title?: string;
  children?: React.ReactNode;
}

export function Header({ title, children }: HeaderProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  return (
    <div className="w-full h-full flex flex-col sm:flex-row items-start sm:items-center sm:justify-between px-3 sm:px-6 py-2 sm:py-0 gap-2 sm:gap-0">
      {/* Left section: OptimaFlow logo and name */}
      <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
        <SidebarTrigger className="mr-2 md:mr-0" />
        
        <div 
          className="flex items-center gap-2 cursor-pointer transition-all duration-200 hover:opacity-80" 
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
          <Zap className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold">OptimaFlow</span>
        </div>
        
        {/* Add visual separator between logo and title */}
        {title && (
          <div className="hidden md:block h-8 w-px bg-gray-200 mx-2"></div>
        )}

        {/* Title - Always visible, positioned appropriately for mobile/desktop */}
        {title && (
          <h1 className={`text-lg sm:text-xl font-bold ${isMobile ? 'ml-auto mr-2' : ''}`}>
            {title}
          </h1>
        )}
      </div>
      
      {/* Right section: Contains search, import, etc. */}
      <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto sm:ml-auto">
        {children}
      </div>
    </div>
  );
}
