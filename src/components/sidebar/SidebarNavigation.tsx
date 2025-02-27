
import { useLocation } from "react-router-dom";
import { navigationConfig } from "@/config/navigationConfig";
import { SidebarSubmenu } from "./SidebarSubmenu";

export function SidebarNavigation() {
  const location = useLocation();

  return (
    <nav className="flex-1 py-2">
      {navigationConfig.map((item) => {
        if (item.items) {
          return <SidebarSubmenu key={item.title} item={item} />;
        }

        const isActive = location.pathname === item.url;
        return (
          <a
            key={item.title}
            href={item.url}
            className={`relative flex items-center w-full px-6 py-2.5 transition-colors
              ${isActive 
                ? 'text-purple-900' 
                : 'text-gray-700 hover:text-gray-900'
              } group-data-[state=closed]:px-0`}
          >
            <div className={`absolute inset-0 mx-4 rounded-md transition-colors
              ${isActive ? 'bg-purple-50' : 'group-hover:bg-gray-50/80'}
              group-data-[state=closed]:mx-2`} 
            />
            <div className="relative flex items-center w-full gap-3 group-data-[state=closed]:justify-center">
              <item.icon className="w-5 h-5 shrink-0" strokeWidth={1.75} />
              <span className="font-medium transition-all duration-300 group-data-[state=closed]:w-0 group-data-[state=closed]:opacity-0 group-data-[state=closed]:translate-x-2">
                {item.title}
              </span>
            </div>
          </a>
        );
      })}
    </nav>
  );
}
