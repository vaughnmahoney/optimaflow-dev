
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageNavigationButtonsProps {
  handlePrevious: () => void;
  handleNext: () => void;
}

export const ImageNavigationButtons = ({
  handlePrevious,
  handleNext
}: ImageNavigationButtonsProps) => {
  return (
    <>
      <div className="absolute inset-y-0 left-0 flex items-center">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-10 w-10 rounded-full bg-white/90 hover:bg-white border-gray-200 text-gray-700 shadow-md ml-2"
          onClick={handlePrevious}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
      
      <div className="absolute inset-y-0 right-0 flex items-center">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-10 w-10 rounded-full bg-white/90 hover:bg-white border-gray-200 text-gray-700 shadow-md mr-2"
          onClick={handleNext}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </>
  );
};
