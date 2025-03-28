import React from 'react';
import { cn } from '@/lib/utils';
import { SidebarNavItem } from './SidebarNavItem';
import { SidebarSubmenu } from './SidebarSubmenu';
import { NavigationItem, NavigationConfig } from '@/config/navigationConfig';
import { LucideIcon } from 'lucide-react';

interface SidebarNavigationProps {
  items: NavigationConfig;
  isExpanded: boolean;
  activePath: string;
  onToggleExpand: () => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  items,
  isExpanded,
  activePath,
  onToggleExpand,
}) => {
  return (
    <nav className="flex flex-col space-y-1">
      {items.map((item) => {
        if (item.type === 'item') {
          return (
            <SidebarNavItem
              key={item.label}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={activePath === item.href}
              isExpanded={isExpanded}
              onToggleExpand={onToggleExpand}
            />
          );
        } else if (item.type === 'submenu') {
          return (
            <SidebarSubmenu
              key={item.label}
              label={item.label}
              icon={item.icon}
              items={item.items}
              activePath={activePath}
              isExpanded={isExpanded}
              onToggleExpand={onToggleExpand}
            />
          );
        }
        return null;
      })}
    </nav>
  );
};
