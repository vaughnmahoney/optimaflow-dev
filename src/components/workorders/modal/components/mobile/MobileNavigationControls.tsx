
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileNavigationControlsProps {
  currentIndex: number;
  totalOrders: number;
  onPreviousOrder: () => void;
  onNextOrder: () => void;
  isNavigatingPages?: boolean;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

export const MobileNavigationControls = ({
  currentIndex,
  totalOrders,
  onPreviousOrder,
  onNextOrder,
  isNavigatingPages = false,
  hasPreviousPage = false,
  hasNextPage = false
}: MobileNavigationControlsProps) => {
  return (
    <div className="px-4 py-3 flex items-center justify-between border-t bg-white">
      <Button
        variant="outline"
        size="sm"
        onClick={onPreviousOrder}
        className="flex items-center gap-1"
        disabled={currentIndex <= 0 && !hasPreviousPage}
      >
        <ChevronLeft className="h-4 w-4" />
        <span>{isNavigatingPages && currentIndex === 0 && hasPreviousPage ? "Loading..." : "Previous"}</span>
      </Button>
      
      <span className="text-sm text-gray-500 font-medium">
        {currentIndex + 1} of {totalOrders}
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onNextOrder}
        className="flex items-center gap-1"
        disabled={currentIndex >= totalOrders - 1 && !hasNextPage}
      >
        <span>{isNavigatingPages && currentIndex === totalOrders - 1 && hasNextPage ? "Loading..." : "Next"}</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
