
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Zap } from "lucide-react";

interface HeaderProps {
  title?: string;
  children?: React.ReactNode;
}

export function Header({ title, children }: HeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className="w-full h-full flex items-center justify-between px-6">
      {/* Left section: OptimaFlow logo and name */}
      <div className="flex items-center gap-3 flex-shrink-0">
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
      </div>
      
      {/* Center section: Page title */}
      {title && (
        <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 z-10 bg-background px-4">
          <h1 className="text-xl font-bold whitespace-nowrap">{title}</h1>
        </div>
      )}
      
      {/* Right section: Could add user profile, notifications, etc. here */}
      <div className="flex items-center gap-2 flex-shrink-0 flex-grow-0 ml-auto">
        {/* Mobile page title (shows when center title is hidden) */}
        {title && (
          <h1 className="md:hidden text-lg font-semibold">{title}</h1>
        )}
        {children}
      </div>
    </div>
  );
}
