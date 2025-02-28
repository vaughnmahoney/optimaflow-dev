
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  MapPin, 
  Clock, 
  Download, 
  Check, 
  Flag 
} from "lucide-react";
import { format } from "date-fns";
import { WorkOrder } from "../types";
import { NavigationFooter } from "./NavigationFooter";
import { OrderDetailsTab } from "./tabs/OrderDetailsTab";
import { NotesTab } from "./tabs/NotesTab";
import { SignatureTab } from "./tabs/SignatureTab";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ImageViewModalProps {
  workOrder: WorkOrder | null;
  workOrders: WorkOrder[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (workOrderId: string, status: string) => void;
  onNavigate: (index: number) => void;
  onDownloadAll?: () => void;
}

export const ImageViewModal = ({
  workOrder,
  workOrders,
  currentIndex,
  isOpen,
  onClose,
  onStatusUpdate,
  onNavigate,
  onDownloadAll,
}: ImageViewModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  
  // Reset image index when work order changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [workOrder?.id]);
  
  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case "ArrowLeft":
          if (e.altKey) {
            handlePreviousOrder();
          } else {
            handlePrevious();
          }
          break;
        case "ArrowRight":
          if (e.altKey) {
            handleNextOrder();
          } else {
            handleNext();
          }
          break;
        case "Escape":
          onClose();
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentImageIndex, currentIndex]);
  
  if (!workOrder) return null;

  const completionData = workOrder?.completion_response?.orders?.[0]?.data;
  const images = completionData?.form?.images || [];
  const driverName = workOrder.search_response?.scheduleInformation?.driverName || 'No Driver Assigned';
  const locationName = workOrder.location?.name || workOrder.location?.locationName || 'Unknown Location';
  const address = workOrder.location?.address || 'No Address Available';
  
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), "MMM d, yyyy h:mm a");
    } catch {
      return 'Invalid Date';
    }
  };

  const startDate = completionData?.startTime?.localTime;
  const endDate = completionData?.endTime?.localTime;
  
  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    } else if (images.length > 0) {
      setCurrentImageIndex(images.length - 1);
    }
  };
  
  const handleNext = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else if (images.length > 0) {
      setCurrentImageIndex(0);
    }
  };

  const handlePreviousOrder = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
      setCurrentImageIndex(0);
    }
  };

  const handleNextOrder = () => {
    if (currentIndex < workOrders.length - 1) {
      onNavigate(currentIndex + 1);
      setCurrentImageIndex(0);
    }
  };

  const toggleImageExpand = () => {
    setIsImageExpanded(!isImageExpanded);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl p-0 h-[90vh] flex flex-col rounded-lg overflow-hidden">
        {/* Header with order info */}
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Order #{workOrder.order_no}</h2>
              <p className="text-sm text-muted-foreground">
                Driver: {driverName}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Main content area - Two column layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left side - Image viewer */}
          <div className={`flex flex-col ${isImageExpanded ? 'w-full' : 'w-3/5'} border-r`}>
            <div className="flex-1 relative flex items-center justify-center bg-black/5 dark:bg-black/20 overflow-hidden">
              {images.length > 0 ? (
                <>
                  <img 
                    src={images[currentImageIndex]?.url} 
                    alt={`Service image ${currentImageIndex + 1}`}
                    className="max-h-full max-w-full object-contain cursor-pointer transition-transform hover:scale-[1.01]"
                    onClick={toggleImageExpand}
                  />
                  
                  {/* Previous/Next buttons */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-full shadow-md"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-full shadow-md"
                    onClick={handleNext}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                  
                  {/* Image counter */}
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="h-16 w-16 mx-auto mb-4 text-gray-400 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                    <X className="h-8 w-8" />
                  </div>
                  <p className="text-lg font-medium">No images available</p>
                  <p className="text-sm">This work order doesn't have any uploaded images.</p>
                </div>
              )}
            </div>
            
            {/* Image thumbnails */}
            {!isImageExpanded && images.length > 0 && (
              <div className="h-24 p-2 border-t flex items-center justify-start overflow-x-auto space-x-2 bg-background">
                {images.map((image, idx) => (
                  <div 
                    key={idx}
                    className={`relative h-20 w-20 flex-shrink-0 cursor-pointer transition-all duration-200 ${
                      idx === currentImageIndex 
                        ? 'ring-2 ring-primary ring-offset-2' 
                        : 'ring-1 ring-gray-200 hover:ring-gray-300'
                    } rounded-md overflow-hidden`}
                    onClick={() => setCurrentImageIndex(idx)}
                  >
                    <img 
                      src={image.url} 
                      alt={`Thumbnail ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* Image actions */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t flex justify-between items-center">
              <div className="flex gap-2">
                {onStatusUpdate && (
                  <>
                    <Button 
                      variant="outline" 
                      className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800"
                      onClick={() => onStatusUpdate(workOrder.id, "approved")}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                    <Button 
                      variant="outline"
                      className="bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 hover:text-amber-800"
                      onClick={() => onStatusUpdate(workOrder.id, "flagged")}
                    >
                      <Flag className="mr-1 h-4 w-4" />
                      Flag for Review
                    </Button>
                  </>
                )}
              </div>
              <div>
                {onDownloadAll && images.length > 0 && (
                  <Button variant="outline" onClick={onDownloadAll}>
                    <Download className="mr-1 h-4 w-4" />
                    Download All
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Right side - Details panel */}
          {!isImageExpanded && (
            <div className="w-2/5 flex flex-col overflow-hidden">
              {/* Quick info section */}
              <div className="p-4 border-b bg-gray-50 dark:bg-gray-900/50">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 mt-0.5 text-gray-500" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{locationName}</p>
                      <p className="text-xs text-muted-foreground">{address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 mt-0.5 text-gray-500" />
                    <div className="flex-1">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="font-medium">Start Time</p>
                          <p className="text-muted-foreground">{formatDate(startDate)}</p>
                        </div>
                        <div>
                          <p className="font-medium">End Time</p>
                          <p className="text-muted-foreground">{formatDate(endDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Accordion sections */}
              <div className="flex-1 overflow-y-auto p-0">
                <Accordion type="single" collapsible defaultValue="details" className="w-full">
                  <AccordionItem value="details" className="border-b">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-100 dark:hover:bg-gray-800/50">
                      <span className="text-sm font-medium">Order Details</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-2 pb-4">
                      <Card className="p-0 border-0 shadow-none">
                        <OrderDetailsTab workOrder={workOrder} />
                      </Card>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="notes" className="border-b">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-100 dark:hover:bg-gray-800/50">
                      <span className="text-sm font-medium">Notes</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-2 pb-4">
                      <Card className="p-0 border-0 shadow-none">
                        <NotesTab workOrder={workOrder} />
                      </Card>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="signature" className="border-b">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-100 dark:hover:bg-gray-800/50">
                      <span className="text-sm font-medium">Signature</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-2 pb-4">
                      <Card className="p-0 border-0 shadow-none">
                        <SignatureTab workOrder={workOrder} />
                      </Card>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation Footer */}
        <TooltipProvider>
          <NavigationFooter
            currentIndex={currentIndex}
            totalItems={workOrders.length}
            onNavigate={onNavigate}
          />
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
};
