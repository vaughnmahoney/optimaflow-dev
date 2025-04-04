
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";

interface NavigationControlsProps {
  currentIndex: number;
  totalOrders: number;
  onPreviousOrder: () => void;
  onNextOrder: () => void;
  isNavigatingPages?: boolean;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

export const NavigationControls = ({
  currentIndex,
  totalOrders,
  onPreviousOrder,
  onNextOrder,
  isNavigatingPages = false,
  hasPreviousPage = false,
  hasNextPage = false
}: NavigationControlsProps) => {
  return (
    <TooltipProvider>
      <div className="p-4 border-t bg-white dark:bg-gray-950">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
            onClick={onPreviousOrder}
            disabled={currentIndex <= 0 && !hasPreviousPage}
          >
            {isNavigatingPages && currentIndex === 0 && hasPreviousPage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading Previous
              </>
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                Previous Order
              </>
            )}
          </Button>
          
          <span className="text-sm font-medium px-4 py-1 bg-gray-50 dark:bg-gray-800 rounded-md">
            Order <span className="font-bold">{currentIndex + 1}</span> of <span className="font-bold">{totalOrders}</span>
          </span>
          
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
            onClick={onNextOrder}
            disabled={currentIndex >= totalOrders - 1 && !hasNextPage}
          >
            {isNavigatingPages && currentIndex === totalOrders - 1 && hasNextPage ? (
              <>
                Loading Next
                <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              <>
                Next Order
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};
