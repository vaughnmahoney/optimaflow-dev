
import { useNavigate } from "react-router-dom";

export function SidebarLogo() {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
      <span className="text-xl font-semibold text-sidebar-text">OptimaFlow</span>
    </div>
  );
}
