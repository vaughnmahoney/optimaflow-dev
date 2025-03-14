
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface NavigationControlsProps {
  currentIndex: number;
  totalOrders: number;
  onPreviousOrder: () => void;
  onNextOrder: () => void;
}

export const NavigationControls = ({
  currentIndex,
  totalOrders,
  onPreviousOrder,
  onNextOrder
}: NavigationControlsProps) => {
  return (
    <TooltipProvider>
      <div className="p-4 border-t bg-white dark:bg-gray-950">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            className="flex items-center gap-2 px-4 py-2 text-gray-600 border-gray-200 bg-gray-50 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 dark:border-gray-700"
            onClick={onPreviousOrder}
            disabled={currentIndex <= 0}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous Order
          </Button>
          
          <span className="text-sm text-muted-foreground font-medium px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-md">
            Order {currentIndex + 1} of {totalOrders}
          </span>
          
          <Button
            variant="outline"
            className="flex items-center gap-2 px-4 py-2 text-gray-600 border-gray-200 bg-gray-50 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 dark:border-gray-700"
            onClick={onNextOrder}
            disabled={currentIndex >= totalOrders - 1}
          >
            Next Order
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};
