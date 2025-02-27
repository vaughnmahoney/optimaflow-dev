
import { useLocation } from "react-router-dom";
import { navigationConfig } from "@/config/navigationConfig";
import { SidebarSubmenu } from "./SidebarSubmenu";

export function SidebarNavigation() {
  const location = useLocation();

  return (
    <nav className="flex-1 space-y-1 px-2">
      {navigationConfig.map((item) => {
        if (item.items) {
          return <SidebarSubmenu key={item.title} item={item} />;
        }

        return (
          <a
            key={item.title}
            href={item.url}
            className={`flex items-center gap-3 px-4 py-2 rounded-md transition-all duration-300 group/nav
              ${location.pathname === item.url
                ? 'bg-purple-50 text-purple-900'
                : 'text-gray-700 hover:bg-gray-50/80 hover:text-gray-900'
              }`}
          >
            <item.icon className="w-6 h-6 shrink-0" strokeWidth={1.75} />
            <span className="font-semibold transition-all duration-300 group-data-[state=closed]:w-0 group-data-[state=closed]:opacity-0">
              {item.title}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
