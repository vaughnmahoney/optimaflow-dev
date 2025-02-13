
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface WorkOrderNavigationProps {
  currentIndex: number;
  totalCount: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const WorkOrderNavigation = ({
  currentIndex,
  totalCount,
  onPrevious,
  onNext,
}: WorkOrderNavigationProps) => {
  return (
    <div className="border-t bg-gray-50/50 p-4 flex items-center justify-between">
      <Button
        onClick={onPrevious}
        disabled={currentIndex <= 0}
        variant="outline"
        className="w-[140px]"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Previous Order
      </Button>

      <div className="text-sm text-muted-foreground">
        Order {currentIndex + 1} of {totalCount}
      </div>

      <Button
        onClick={onNext}
        disabled={currentIndex >= totalCount - 1}
        variant="outline"
        className="w-[140px]"
      >
        Next Order
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};
