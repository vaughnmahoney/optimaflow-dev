
import { useNavigate } from "react-router-dom";

export function SidebarLogo() {
  const navigate = useNavigate();
  
  return (
    <div 
      className="flex items-center cursor-pointer transition-all duration-200 hover:opacity-80" 
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
      <span className="text-xl font-semibold text-sidebar-text">OptimaFlow</span>
    </div>
  );
}
