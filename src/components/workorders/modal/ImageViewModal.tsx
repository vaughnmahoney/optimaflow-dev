
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { X, ChevronLeft, ChevronRight, User, FileText, MessageSquare, Pen } from "lucide-react";
import { WorkOrder } from "../types";
import { NavigationFooter } from "./NavigationFooter";
import { OrderDetailsTab } from "./tabs/OrderDetailsTab";
import { NotesTab } from "./tabs/NotesTab";
import { SignatureTab } from "./tabs/SignatureTab";

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
  const [activeTab, setActiveTab] = useState("images");
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
      <DialogContent className="max-w-5xl p-0 h-[85vh] flex flex-col rounded-lg overflow-hidden">
        {/* Header with gradient */}
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Order #{workOrder.order_no}</h2>
              <p className="text-sm text-muted-foreground flex items-center">
                Driver: {driverName}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b">
          <Tabs defaultValue="images" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start p-0 h-12 bg-transparent border-b-0">
              <TabsTrigger 
                value="images" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-6 h-12"
              >
                <FileText className="mr-2 h-4 w-4" />
                Images
              </TabsTrigger>
              <TabsTrigger 
                value="details" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-6 h-12"
              >
                <FileText className="mr-2 h-4 w-4" />
                Order Details
              </TabsTrigger>
              <TabsTrigger 
                value="notes" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-6 h-12"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Notes
              </TabsTrigger>
              <TabsTrigger 
                value="signature" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-6 h-12"
              >
                <Pen className="mr-2 h-4 w-4" />
                Signature
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="images" className="flex-1 p-0 m-0 h-full">
              {/* Enhanced Image Viewer */}
              <div className={`relative flex flex-col ${isImageExpanded ? 'h-full' : 'h-[calc(100%-140px)]'}`}>
                <div className="flex-1 flex items-center justify-center bg-black/5 dark:bg-black/20 relative overflow-hidden">
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
                      <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium">No images available</p>
                      <p className="text-sm">This work order doesn't have any uploaded images.</p>
                    </div>
                  )}
                </div>
                
                {/* Image thumbnail strip */}
                {!isImageExpanded && images.length > 0 && (
                  <div className="h-32 p-4 border-t flex items-center justify-start overflow-x-auto space-x-2 bg-background">
                    {images.map((image, idx) => (
                      <div 
                        key={idx}
                        className={`relative h-24 w-24 flex-shrink-0 cursor-pointer transition-all duration-200 ${
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
              </div>
              
              {/* Action buttons */}
              <div className="p-4 border-t bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
                <div className="flex gap-2">
                  {onStatusUpdate && (
                    <>
                      <Button 
                        variant="outline" 
                        className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800"
                        onClick={() => onStatusUpdate(workOrder.id, "approved")}
                      >
                        Approve
                      </Button>
                      <Button 
                        variant="outline"
                        className="bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 hover:text-amber-800"
                        onClick={() => onStatusUpdate(workOrder.id, "flagged")}
                      >
                        Flag for Review
                      </Button>
                    </>
                  )}
                </div>
                <div>
                  {onDownloadAll && images.length > 0 && (
                    <Button variant="outline" onClick={onDownloadAll}>
                      Download All Images
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="p-6 m-0 h-[calc(100%-140px)] overflow-y-auto">
              <OrderDetailsTab workOrder={workOrder} />
            </TabsContent>
            
            <TabsContent value="notes" className="p-6 m-0 h-[calc(100%-140px)] overflow-y-auto">
              <NotesTab workOrder={workOrder} />
            </TabsContent>
            
            <TabsContent value="signature" className="p-6 m-0 h-[calc(100%-140px)] overflow-y-auto">
              <SignatureTab workOrder={workOrder} />
            </TabsContent>
          </Tabs>
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
