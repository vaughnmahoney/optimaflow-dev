
import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  AlertCircle,
  CreditCard,
  Car,
  Package2,
  Clock,
  CalendarDays,
  Users,
  Receipt,
  ExternalLink,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarNavigationProps {
  isCollapsed: boolean;
}

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  subPath?: boolean;
}

interface NavGroupProps {
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
  isActive: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const NavItem = ({ to, icon: Icon, label, isActive, isCollapsed, subPath = false }: NavItemProps) => {
  const baseClasses = `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
    isActive 
      ? 'bg-sidebar-active text-sidebar-active-text font-medium' 
      : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-hover-text'
  } ${subPath ? 'pl-11' : ''}`;

  return isCollapsed ? (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to={to} className={`${baseClasses} justify-center h-10`}>
            <Icon size={20} strokeWidth={1.8} />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    <Link to={to} className={baseClasses}>
      <Icon size={20} strokeWidth={1.8} />
      <span>{label}</span>
    </Link>
  );
};

const NavGroup = ({ icon: Icon, label, isCollapsed, isActive, defaultOpen = false, children }: NavGroupProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen || isActive);

  const toggleOpen = (e: React.MouseEvent) => {
    if (!isCollapsed) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return isCollapsed ? (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className={`flex items-center justify-center px-3 py-2 w-full rounded-md transition-colors ${
            isActive ? 'bg-sidebar-active text-sidebar-active-text' : 'text-sidebar-text hover:bg-sidebar-hover'
          }`}>
            <Icon size={20} strokeWidth={1.8} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    <div className="space-y-1">
      <button
        onClick={toggleOpen}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-sm transition-colors ${
          isActive ? 'bg-sidebar-active text-sidebar-active-text font-medium' : 'text-sidebar-text hover:bg-sidebar-hover'
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon size={20} strokeWidth={1.8} />
          <span>{label}</span>
        </div>
        {isOpen ? (
          <ChevronDown size={16} />
        ) : (
          <ChevronRight size={16} />
        )}
      </button>
      {isOpen && (
        <div className="pt-1 pb-1">
          {children}
        </div>
      )}
    </div>
  );
};

export function SidebarNavigation({ isCollapsed }: SidebarNavigationProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  // Check if a path is active, including partial matches for subpaths
  const isActive = (path: string): boolean => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  // Check if any child of a group is active
  const isGroupActive = (paths: string[]): boolean => {
    return paths.some(path => isActive(path));
  };

  return (
    <nav className="space-y-1">
      <NavItem 
        to="/" 
        icon={LayoutDashboard} 
        label="Dashboard" 
        isActive={isActive('/')} 
        isCollapsed={isCollapsed} 
      />
      
      <NavItem 
        to="/work-orders" 
        icon={AlertCircle} 
        label="Quality Control" 
        isActive={isActive('/work-orders')} 
        isCollapsed={isCollapsed} 
      />
      
      <NavItem 
        to="/payroll" 
        icon={CreditCard} 
        label="Payroll" 
        isActive={isActive('/payroll')} 
        isCollapsed={isCollapsed} 
      />
      
      <NavGroup 
        icon={CreditCard} 
        label="Billing" 
        isActive={isGroupActive(['/billing', '/invoices'])} 
        isCollapsed={isCollapsed}
      >
        <NavItem 
          to="/billing" 
          icon={CreditCard} 
          label="Billing Dashboard" 
          isActive={isActive('/billing')} 
          isCollapsed={isCollapsed} 
          subPath 
        />
        <NavItem 
          to="/invoices" 
          icon={Receipt} 
          label="Invoices" 
          isActive={isActive('/invoices')} 
          isCollapsed={isCollapsed} 
          subPath 
        />
      </NavGroup>
      
      <NavItem 
        to="/vehicle-maintenance" 
        icon={Car} 
        label="Vehicle Maintenance" 
        isActive={isActive('/vehicle-maintenance')} 
        isCollapsed={isCollapsed} 
      />
      
      <NavGroup 
        icon={Package2} 
        label="Storage Units" 
        isActive={isGroupActive(['/storage', '/inventory'])} 
        isCollapsed={isCollapsed}
      >
        <NavItem 
          to="/storage" 
          icon={Package2} 
          label="Units" 
          isActive={isActive('/storage')} 
          isCollapsed={isCollapsed} 
          subPath 
        />
        <NavItem 
          to="/inventory" 
          icon={Package2} 
          label="Inventory" 
          isActive={isActive('/inventory')} 
          isCollapsed={isCollapsed} 
          subPath 
        />
      </NavGroup>
      
      <NavGroup 
        icon={Clock} 
        label="Attendance" 
        isActive={isGroupActive(['/attendance', '/attendance-history'])} 
        isCollapsed={isCollapsed}
        defaultOpen={true}
      >
        <NavItem 
          to="/attendance" 
          icon={CalendarDays} 
          label="Track" 
          isActive={isActive('/attendance')} 
          isCollapsed={isCollapsed} 
          subPath 
        />
        <NavItem 
          to="/attendance-history" 
          icon={Clock} 
          label="History" 
          isActive={isActive('/attendance-history')} 
          isCollapsed={isCollapsed} 
          subPath 
        />
      </NavGroup>
      
      <NavItem 
        to="/employees" 
        icon={Users} 
        label="Employees" 
        isActive={isActive('/employees')} 
        isCollapsed={isCollapsed} 
      />
      
      <NavGroup 
        icon={Receipt} 
        label="Receipts" 
        isActive={isGroupActive(['/receipts', '/reports'])} 
        isCollapsed={isCollapsed}
      >
        <NavItem 
          to="/receipts" 
          icon={Receipt} 
          label="All Receipts" 
          isActive={isActive('/receipts')} 
          isCollapsed={isCollapsed} 
          subPath 
        />
        <NavItem 
          to="/reports" 
          icon={Receipt} 
          label="Reports" 
          isActive={isActive('/reports')} 
          isCollapsed={isCollapsed} 
          subPath 
        />
      </NavGroup>
      
      <NavGroup 
        icon={ExternalLink} 
        label="3rd Party Apps" 
        isActive={isGroupActive(['/integrations', '/api'])} 
        isCollapsed={isCollapsed}
      >
        <NavItem 
          to="/integrations" 
          icon={ExternalLink} 
          label="Integrations" 
          isActive={isActive('/integrations')} 
          isCollapsed={isCollapsed} 
          subPath 
        />
        <NavItem 
          to="/api" 
          icon={ExternalLink} 
          label="API Access" 
          isActive={isActive('/api')} 
          isCollapsed={isCollapsed} 
          subPath 
        />
      </NavGroup>
    </nav>
  );
}
