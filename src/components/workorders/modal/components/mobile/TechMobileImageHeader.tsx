
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TechMobileImageHeaderProps {
  onClose: () => void;
}

export const TechMobileImageHeader = ({ 
  onClose 
}: TechMobileImageHeaderProps) => {
  return (
    <div className="p-3 flex justify-between items-center border-b bg-white">
      {/* Empty div for alignment */}
      <div className="w-24"></div>
      
      {/* Center: Order History text */}
      <span className="font-medium">Order History</span>
      
      {/* Right side: Close button with fixed width */}
      <div className="w-24 flex justify-end pr-1">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
