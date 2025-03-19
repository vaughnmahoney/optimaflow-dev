
import { PackageCheck } from "lucide-react";

export type NavigationItem = {
  title: string;
  url?: string;
  icon: any;
  items?: NavigationItem[];
  roles?: string[];
};

export const materialsNavigationConfig: NavigationItem[] = [
  {
    title: "Materials Requirement",
    url: "/materials",
    icon: PackageCheck,
    roles: ["admin", "manager", "supervisor"],
  },
];
