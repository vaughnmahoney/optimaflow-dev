
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
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onFlagToggle} 
        className={`flex items-center gap-1 ${isFlagged ? "text-red-500" : ""}`}
      >
        <Flag className={`h-4 w-4 ${isFlagged ? "fill-red-500" : ""}`} />
        <span>{isFlagged ? "Flagged" : "Flag"}</span>
      </Button>
      <span className="font-medium">Images</span>
      <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
