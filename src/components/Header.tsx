
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Flow } from "lucide-react";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className="w-full h-full flex items-center justify-between px-6">
      {/* Left section: OptimaFlow logo and name */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="mr-2 md:mr-4" />
        
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
          <Flow className="h-5 w-5 text-primary" />
          <span className="text-xl font-semibold">OptimaFlow</span>
        </div>
      </div>
      
      {/* Center section: Page title */}
      {title && (
        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
      )}
      
      {/* Right section: Could add user profile, notifications, etc. here */}
      <div className="flex items-center gap-2">
        {/* Mobile page title (shows when center title is hidden) */}
        {title && (
          <h1 className="md:hidden text-lg font-semibold">{title}</h1>
        )}
      </div>
    </div>
  );
}
