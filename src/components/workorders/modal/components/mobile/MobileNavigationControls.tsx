
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileNavigationControlsProps {
  currentIndex: number;
  totalOrders: number;
  onPreviousOrder: () => void;
  onNextOrder: () => void;
}

export const MobileNavigationControls = ({
  currentIndex,
  totalOrders,
  onPreviousOrder,
  onNextOrder
}: MobileNavigationControlsProps) => {
  return (
    <div className="px-4 py-3 flex items-center justify-between border-t bg-white">
      <Button
        variant="outline"
        size="sm"
        onClick={onPreviousOrder}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Previous</span>
      </Button>
      
      <span className="text-sm text-gray-500 font-medium">
        {currentIndex + 1} of {totalOrders}
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onNextOrder}
        className="flex items-center gap-1"
      >
        <span>Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
