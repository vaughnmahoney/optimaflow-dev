
import { Button } from "@/components/ui/button";
import { X, Flag } from "lucide-react";

interface MobileImageHeaderProps {
  isFlagged: boolean;
  onFlagToggle: () => void;
  onClose: () => void;
}

export const MobileImageHeader = ({ 
  isFlagged, 
  onFlagToggle, 
  onClose 
}: MobileImageHeaderProps) => {
  return (
    <div className="p-3 flex justify-between items-center border-b bg-white">
      {/* Left side: Flag button with fixed width */}
      <div className="w-24 flex justify-start">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onFlagToggle} 
          className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          title={isFlagged ? "Unflag image" : "Flag image"}
        >
          <Flag className={`h-4 w-4 ${isFlagged ? "fill-red-500 text-red-500" : ""}`} />
        </Button>
      </div>
      
      {/* Center: Images text */}
      <span className="font-medium">Images</span>
      
      {/* Right side: Close button with fixed width to match left side */}
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
