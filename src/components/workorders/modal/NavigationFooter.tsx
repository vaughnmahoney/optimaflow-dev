
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface NavigationFooterProps {
  currentIndex: number;
  totalItems: number;
  onNavigate: (index: number) => void;
}

export const NavigationFooter = ({
  currentIndex,
  totalItems,
  onNavigate,
}: NavigationFooterProps) => {
  return (
    <div className="p-4 border-t bg-background">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => onNavigate(currentIndex - 1)}
          disabled={currentIndex <= 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous Order
        </Button>

        <span className="text-sm text-muted-foreground">
          Order {currentIndex + 1} of {totalItems}
        </span>

        <Button
          variant="outline"
          onClick={() => onNavigate(currentIndex + 1)}
          disabled={currentIndex >= totalItems - 1}
        >
          Next Order
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
