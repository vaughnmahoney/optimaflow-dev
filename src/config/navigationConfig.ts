
import {
  LayoutDashboard,
  ClipboardList,
  Calendar,
  Users,
  Clock,
  History,
  Boxes,
  FileText,
  Car,
  Settings,
  Briefcase,
  Store,
  UserCog,
} from "lucide-react";

export type NavigationItem = {
  title: string;
  href: string;
  icon: React.ComponentType;
  submenu?: NavigationItem[];
  section?: string;
};

export const navigationConfig: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/supervisor",
    icon: LayoutDashboard,
  },
  {
    title: "Attendance",
    href: "/attendance",
    icon: Clock,
  },
  {
    title: "Attendance History",
    href: "/attendance-history",
    icon: History,
  },
  {
    title: "Work Orders",
    href: "/work-orders",
    icon: ClipboardList,
    section: "Orders",
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: Calendar,
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Boxes,
  },
  {
    title: "Employees",
    href: "/employees",
    icon: Users,
  },
  {
    title: "User Management",
    href: "/users",
    icon: UserCog,
  },
  {
    title: "Vehicles",
    href: "/vehicle-maintenance",
    icon: Car,
  },
  {
    title: "Receipts",
    href: "/receipts",
    icon: FileText,
  },
  {
    title: "Materials Requisition",
    href: "/materials-requisition",
    icon: Briefcase,
  },
  {
    title: "Payroll",
    href: "/payroll",
    icon: FileText,
  },
  {
    title: "Storage",
    href: "/storage",
    icon: Store,
  },
  {
    title: "Integrations",
    href: "/integrations",
    icon: Settings,
    section: "Settings",
  },
];
