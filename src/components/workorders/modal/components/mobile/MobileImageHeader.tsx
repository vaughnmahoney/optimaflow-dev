
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
          size="sm" 
          onClick={onFlagToggle} 
          className={`flex items-center gap-1 ${isFlagged ? "text-red-500" : ""}`}
        >
          <Flag className={`h-4 w-4 ${isFlagged ? "fill-red-500" : ""}`} />
          <span>{isFlagged ? "Flagged" : "Flag"}</span>
        </Button>
      </div>
      
      {/* Center: Images text */}
      <span className="font-medium">Images</span>
      
      {/* Right side: Close button with fixed width to match left side */}
      <div className="w-24 flex justify-end">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
