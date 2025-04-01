
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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
  // Determine if the previous button should show loading state
  const isPreviousLoading = isNavigatingPages && currentIndex === 0 && hasPreviousPage;
  
  // Determine if the next button should show loading state
  const isNextLoading = isNavigatingPages && currentIndex === totalOrders - 1 && hasNextPage;
  
  return (
    <div className="px-4 py-3 flex items-center justify-between border-t bg-white">
      <Button
        variant="outline"
        size="sm"
        onClick={onPreviousOrder}
        className="flex items-center gap-1"
        disabled={isPreviousLoading || (currentIndex <= 0 && !hasPreviousPage)}
      >
        {isPreviousLoading ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Loading</span>
          </>
        ) : (
          <>
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </>
        )}
      </Button>
      
      <span className="text-sm text-gray-500 font-medium">
        {currentIndex + 1} of {totalOrders}
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onNextOrder}
        className="flex items-center gap-1"
        disabled={isNextLoading || (currentIndex >= totalOrders - 1 && !hasNextPage)}
      >
        {isNextLoading ? (
          <>
            <span>Loading</span>
            <Loader2 className="h-3 w-3 animate-spin" />
          </>
        ) : (
          <>
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
};
