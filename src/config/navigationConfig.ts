
import {
  LayoutDashboard,
  CheckCircle,
  Search,
  Flag,
  BadgeDollarSign,
  Tag,
  Check,
  DollarSign,
  Truck,
  Package,
  List,
  Inbox,
  MapPin,
  Clock,
  Calendar,
  Users,
  UserPlus,
  Smartphone,
  Wrench,
  Receipt,
  CreditCard,
  Link,
  LogOut
} from "lucide-react";

export type NavigationItem = {
  title: string;
  url?: string;
  icon: any;
  items?: NavigationItem[];
};

export const navigationConfig: NavigationItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Quality Control",
    icon: CheckCircle,
    items: [
      { title: "Review", url: "/quality-control/review", icon: Search },
      { title: "Flagged Orders", url: "/quality-control/flagged", icon: Flag },
    ],
  },
  {
    title: "Payroll",
    url: "/payroll",
    icon: BadgeDollarSign,
  },
  {
    title: "Billing",
    icon: Tag,
    items: [
      { title: "Approved Orders", url: "/billing/approved", icon: Check },
      { title: "Pricing", url: "/billing/pricing", icon: DollarSign },
    ],
  },
  {
    title: "Material Requirements",
    url: "/material-requirements",
    icon: Package,
  },
  {
    title: "Vehicle Maintenance",
    url: "/vehicles",
    icon: Truck,
  },
  {
    title: "Storage Units",
    icon: Package,
    items: [
      { title: "Inventory", url: "/storage/inventory", icon: List },
      { title: "Request Materials", url: "/storage/request", icon: Inbox },
      { title: "Location Info", url: "/storage/locations", icon: MapPin },
    ],
  },
  {
    title: "Attendance",
    icon: Clock,
    items: [
      { title: "Track", url: "/supervisor", icon: Calendar },
      { title: "History", url: "/attendance-history", icon: List },
    ],
  },
  {
    title: "Employees",
    icon: Users,
    items: [
      { title: "Add Employee", url: "/admin", icon: UserPlus },
      { title: "Device List", url: "/employees/devices", icon: Smartphone },
      { title: "Tool List", url: "/employees/tools", icon: Wrench },
    ],
  },
  {
    title: "Receipts",
    icon: Receipt,
    items: [
      { title: "Payment Tracking", url: "/receipts/tracking", icon: CreditCard },
    ],
  },
  {
    title: "3rd Party Apps",
    icon: Link,
    items: [
      { title: "WEX", url: "/apps/wex", icon: Link },
      { title: "Onsite", url: "/apps/onsite", icon: Link },
      { title: "PEX", url: "/apps/pex", icon: Link },
      { title: "Service Channel", url: "/apps/service-channel", icon: Link },
      { title: "Verisae", url: "/apps/verisae", icon: Link },
    ],
  },
];
