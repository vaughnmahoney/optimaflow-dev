
import {
  LayoutDashboard,
  ListChecks,
  Users,
  Calendar,
  ServerIcon,
  Settings,
} from "lucide-react"

export const Icons = {
  LayoutDashboard,
  ListChecks,
  Users,
  Calendar,
  ServerIcon,
  Settings,
}

export interface NavItem {
  label: string
  icon: keyof typeof Icons
  href: string
}

export interface NavigationItem extends NavItem {
  items?: NavItem[]
}

export const navigationConfig: NavigationItem[] = [
  {
    label: "Dashboard",
    icon: "LayoutDashboard",
    href: "/dashboard",
  },
  {
    label: "Work Orders",
    icon: "ListChecks",
    href: "/work-orders",
  },
  {
    label: "Attendance",
    icon: "Users",
    href: "/attendance",
  },
  {
    label: "Calendar",
    icon: "Calendar",
    href: "/calendar",
  },
  {
    label: "Storage",
    icon: "ServerIcon",
    href: "/storage",
  },
  {
    label: "Settings",
    icon: "Settings",
    href: "/settings",
    items: [
      {
        label: "Employees",
        icon: "Users",
        href: "/employees",
      },
      {
        label: "Integrations",
        icon: "ServerIcon",
        href: "/integrations",
      },
    ],
  },
]
