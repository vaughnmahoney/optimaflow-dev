
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface MobileSidebarToggleProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}

export function MobileSidebarToggle({ isMobileOpen, setIsMobileOpen }: MobileSidebarToggleProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setIsMobileOpen(!isMobileOpen)}
      className="fixed bottom-4 right-4 z-50 shadow-md rounded-full md:hidden h-12 w-12 bg-primary text-primary-foreground border-0"
      aria-label={isMobileOpen ? "Close sidebar" : "Open sidebar"}
    >
      {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
    </Button>
  );
}
