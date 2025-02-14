
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { HeaderProps } from "../types/sidebar";

export const Header = ({ orderNo, onClose }: HeaderProps) => (
  <div className="p-4 border-b flex items-center justify-between">
    <h3 className="font-semibold">Work Order #{orderNo}</h3>
    <Button variant="ghost" size="icon" onClick={onClose}>
      <X className="h-4 w-4" />
    </Button>
  </div>
);
