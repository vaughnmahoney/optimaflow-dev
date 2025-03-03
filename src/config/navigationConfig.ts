
import {
  LayoutDashboard,
  ListChecks,
  Calendar,
  Users,
  Settings,
  ServerIcon,
} from "lucide-react"

export interface NavItem {
  label: string
  icon: keyof typeof Icons
  href: string
}

// Adding this export to fix the SidebarSubmenu error
export interface NavigationItem {
  label: string
  icon: keyof typeof Icons
  href: string
}

export interface NavSection {
  label: string
  items: NavItem[]
}

const Icons = {
  LayoutDashboard,
  ListChecks,
  Calendar,
  Users,
  Settings,
  ServerIcon,
}

export const navigationConfig: NavSection[] = [
  {
    label: "Main",
    items: [
      {
        label: "Dashboard",
        icon: "LayoutDashboard",
        href: "/",
      },
    ],
  },
  {
    label: "Work Orders",
    items: [
      {
        label: "Work Orders",
        icon: "ListChecks",
        href: "/work-orders",
      },
      {
        label: "Calendar",
        icon: "Calendar",
        href: "/calendar",
      },
    ],
  },
  {
    label: "Attendance",
    items: [
      {
        label: "Technicians",
        icon: "Users",
        href: "/technicians",
      },
      {
        label: "Attendance",
        icon: "Calendar",
        href: "/attendance",
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        label: "Settings",
        icon: "Settings",
        href: "/settings",
      },
    ],
  },
  {
    label: "OptimoRoute API Tests",
    items: [
      {
        label: "Bulk Orders Test",
        icon: "ServerIcon",
        href: "/bulk-orders-test",
      },
    ],
  },
]
