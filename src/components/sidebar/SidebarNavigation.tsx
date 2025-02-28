
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
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SidebarNavigationProps {
  isCollapsed: boolean;
  searchTerm?: string;
}

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  subPath?: boolean;
  badge?: number;
}

interface NavGroupProps {
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
  isActive: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
  badge?: number;
}

const NavItem = ({ 
  to, 
  icon: Icon, 
  label, 
  isActive, 
  isCollapsed, 
  subPath = false,
  badge 
}: NavItemProps) => {
  const baseClasses = cn(
    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
    isActive 
      ? 'bg-sidebar-active text-sidebar-active-text font-medium' 
      : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-hover-text',
    subPath ? 'pl-11' : ''
  );

  return isCollapsed ? (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to={to} className={`${baseClasses} justify-center h-10 relative`}>
            <Icon size={20} strokeWidth={1.8} />
            {badge && (
              <span className="absolute top-0 right-0 bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{label}</p>
          {badge && <p className="text-xs font-medium">{badge} new</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    <Link to={to} className={baseClasses}>
      <Icon size={20} strokeWidth={1.8} />
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
};

const NavGroup = ({ 
  icon: Icon, 
  label, 
  isCollapsed, 
  isActive, 
  defaultOpen = false, 
  children,
  badge
}: NavGroupProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen || isActive);

  // Auto-open when active
  useEffect(() => {
    if (isActive) {
      setIsOpen(true);
    }
  }, [isActive]);

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
          <button className={cn(
            "relative flex items-center justify-center px-3 py-2 w-full rounded-md transition-colors",
            isActive ? 'bg-sidebar-active text-sidebar-active-text' : 'text-sidebar-text hover:bg-sidebar-hover'
          )}>
            <Icon size={20} strokeWidth={1.8} />
            {badge && (
              <span className="absolute top-0 right-0 bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{label}</p>
          {badge && <p className="text-xs font-medium">{badge} new</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    <div className="space-y-1">
      <button
        onClick={toggleOpen}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 rounded-md text-sm transition-colors",
          isActive ? 'bg-sidebar-active text-sidebar-active-text font-medium' : 'text-sidebar-text hover:bg-sidebar-hover'
        )}
      >
        <div className="flex items-center gap-3">
          <Icon size={20} strokeWidth={1.8} />
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
              {badge}
            </span>
          )}
          {isOpen ? (
            <ChevronDown size={16} className="transition-transform" />
          ) : (
            <ChevronRight size={16} className="transition-transform" />
          )}
        </div>
      </button>
      <div 
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="pt-1 pb-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export function SidebarNavigation({ isCollapsed, searchTerm = "" }: SidebarNavigationProps) {
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
  
  // Filter navigation items based on search term
  const filterBySearch = (label: string): boolean => {
    if (!searchTerm) return true;
    return label.toLowerCase().includes(searchTerm.toLowerCase());
  };

  return (
    <nav className="space-y-2">
      {/* Dashboard */}
      {filterBySearch("Dashboard") && (
        <NavItem 
          to="/" 
          icon={LayoutDashboard} 
          label="Dashboard" 
          isActive={isActive('/')} 
          isCollapsed={isCollapsed} 
        />
      )}
      
      {/* Quality Control */}
      {filterBySearch("Quality Control") && (
        <NavItem 
          to="/work-orders" 
          icon={AlertCircle} 
          label="Quality Control" 
          isActive={isActive('/work-orders')} 
          isCollapsed={isCollapsed}
          badge={14}
        />
      )}
      
      {/* Payroll */}
      {filterBySearch("Payroll") && (
        <NavItem 
          to="/payroll" 
          icon={CreditCard} 
          label="Payroll" 
          isActive={isActive('/payroll')} 
          isCollapsed={isCollapsed} 
        />
      )}
      
      {/* Billing Group */}
      {filterBySearch("Billing") && (
        <NavGroup 
          icon={CreditCard} 
          label="Billing" 
          isActive={isGroupActive(['/billing', '/invoices'])} 
          isCollapsed={isCollapsed}
        >
          {filterBySearch("Billing Dashboard") && (
            <NavItem 
              to="/billing" 
              icon={CreditCard} 
              label="Billing Dashboard" 
              isActive={isActive('/billing')} 
              isCollapsed={isCollapsed} 
              subPath 
            />
          )}
          {filterBySearch("Invoices") && (
            <NavItem 
              to="/invoices" 
              icon={Receipt} 
              label="Invoices" 
              isActive={isActive('/invoices')} 
              isCollapsed={isCollapsed} 
              subPath 
            />
          )}
        </NavGroup>
      )}
      
      {/* Vehicle Maintenance */}
      {filterBySearch("Vehicle Maintenance") && (
        <NavItem 
          to="/vehicle-maintenance" 
          icon={Car} 
          label="Vehicle Maintenance" 
          isActive={isActive('/vehicle-maintenance')} 
          isCollapsed={isCollapsed} 
        />
      )}
      
      {/* Storage Units Group */}
      {filterBySearch("Storage Units") && (
        <NavGroup 
          icon={Package2} 
          label="Storage Units" 
          isActive={isGroupActive(['/storage', '/inventory'])} 
          isCollapsed={isCollapsed}
        >
          {filterBySearch("Units") && (
            <NavItem 
              to="/storage" 
              icon={Package2} 
              label="Units" 
              isActive={isActive('/storage')} 
              isCollapsed={isCollapsed} 
              subPath 
            />
          )}
          {filterBySearch("Inventory") && (
            <NavItem 
              to="/inventory" 
              icon={Package2} 
              label="Inventory" 
              isActive={isActive('/inventory')} 
              isCollapsed={isCollapsed} 
              subPath 
            />
          )}
        </NavGroup>
      )}
      
      {/* Attendance Group */}
      {filterBySearch("Attendance") && (
        <NavGroup 
          icon={Clock} 
          label="Attendance" 
          isActive={isGroupActive(['/attendance', '/attendance-history'])} 
          isCollapsed={isCollapsed}
          defaultOpen={true}
        >
          {filterBySearch("Track") && (
            <NavItem 
              to="/attendance" 
              icon={CalendarDays} 
              label="Track" 
              isActive={isActive('/attendance')} 
              isCollapsed={isCollapsed} 
              subPath 
            />
          )}
          {filterBySearch("History") && (
            <NavItem 
              to="/attendance-history" 
              icon={Clock} 
              label="History" 
              isActive={isActive('/attendance-history')} 
              isCollapsed={isCollapsed} 
              subPath 
            />
          )}
        </NavGroup>
      )}
      
      {/* Employees */}
      {filterBySearch("Employees") && (
        <NavItem 
          to="/employees" 
          icon={Users} 
          label="Employees" 
          isActive={isActive('/employees')} 
          isCollapsed={isCollapsed} 
        />
      )}
      
      {/* Receipts Group */}
      {filterBySearch("Receipts") && (
        <NavGroup 
          icon={Receipt} 
          label="Receipts" 
          isActive={isGroupActive(['/receipts', '/reports'])} 
          isCollapsed={isCollapsed}
        >
          {filterBySearch("All Receipts") && (
            <NavItem 
              to="/receipts" 
              icon={Receipt} 
              label="All Receipts" 
              isActive={isActive('/receipts')} 
              isCollapsed={isCollapsed} 
              subPath 
            />
          )}
          {filterBySearch("Reports") && (
            <NavItem 
              to="/reports" 
              icon={Receipt} 
              label="Reports" 
              isActive={isActive('/reports')} 
              isCollapsed={isCollapsed} 
              subPath 
            />
          )}
        </NavGroup>
      )}
      
      {/* 3rd Party Apps Group */}
      {filterBySearch("3rd Party Apps") && (
        <NavGroup 
          icon={ExternalLink} 
          label="3rd Party Apps" 
          isActive={isGroupActive(['/integrations', '/api'])} 
          isCollapsed={isCollapsed}
        >
          {filterBySearch("Integrations") && (
            <NavItem 
              to="/integrations" 
              icon={ExternalLink} 
              label="Integrations" 
              isActive={isActive('/integrations')} 
              isCollapsed={isCollapsed} 
              subPath 
            />
          )}
          {filterBySearch("API Access") && (
            <NavItem 
              to="/api" 
              icon={ExternalLink} 
              label="API Access" 
              isActive={isActive('/api')} 
              isCollapsed={isCollapsed} 
              subPath 
            />
          )}
        </NavGroup>
      )}
    </nav>
  );
}
