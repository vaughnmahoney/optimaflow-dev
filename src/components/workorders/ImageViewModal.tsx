
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Flag, Download, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, X, ImageOff } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { WorkOrder } from "./types";
import { cn } from "@/lib/utils";

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
  
  const images = workOrder?.completion_response?.photos || [];
  
  const handlePrevious = () => {
    setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
  };
  
  const handleNext = () => {
    setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-500 hover:bg-green-600';
      case 'flagged':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "EEEE, MMMM d, yyyy");
    } catch {
      return 'Not available';
    }
  };

  const formatTime = (date: string) => {
    try {
      return format(new Date(date), "h:mm a");
    } catch {
      return 'Not available';
    }
  };

  if (!workOrder) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 gap-0">
        <div className="flex h-[85vh]">
          {/* Left Panel - Work Order Details */}
          <div className="w-[40%] border-r bg-background flex flex-col">
            {/* Header */}
            <div className="p-6 border-b flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">
                  Work Order #{workOrder.order_no}
                </h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <Badge 
                className={cn(
                  "px-4 py-1",
                  getStatusColor(workOrder.status || 'pending')
                )}
              >
                {(workOrder.status || 'PENDING').toUpperCase()}
              </Badge>
            </div>

            {/* Tabbed Content */}
            <Tabs defaultValue="details" className="flex-1 flex flex-col min-h-0">
              <TabsList className="px-6 pt-2 justify-start border-b rounded-none gap-4 flex-shrink-0">
                <TabsTrigger value="details">Order Details</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="signature">Signature</TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-hidden">
                <TabsContent value="details" className="h-full mt-0 data-[state=active]:flex flex-col">
                  <ScrollArea className="flex-1">
                    <div className="p-6">
                      <Card className="p-4">
                        <div className="space-y-3 text-sm">
                          <p>
                            <span className="text-muted-foreground">Driver: </span>
                            {workOrder.driver?.name || 'Not assigned'}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Location: </span>
                            {workOrder.location?.name || workOrder.location?.locationName || 'N/A'}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Address: </span>
                            {workOrder.location?.address || 'N/A'}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Date: </span>
                            {formatDate(workOrder.service_date || '')}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Time: </span>
                            {formatTime(workOrder.service_date || '')}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Duration: </span>
                            {workOrder.duration || 'N/A'}
                          </p>
                          <p>
                            <span className="text-muted-foreground">LDS: </span>
                            {workOrder.lds || 'N/A'}
                          </p>
                        </div>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="notes" className="h-full mt-0 data-[state=active]:flex flex-col">
                  <ScrollArea className="flex-1">
                    <div className="p-6 space-y-6">
                      <Card className="p-4">
                        <h3 className="font-medium mb-2">Notes</h3>
                        <p className="text-sm whitespace-pre-wrap">
                          {workOrder.notes || 'No notes available'}
                        </p>
                      </Card>

                      <Card className="p-4">
                        <h3 className="font-medium mb-2">Service Notes</h3>
                        <p className="text-sm whitespace-pre-wrap">
                          {workOrder.service_notes || 'No service notes available'}
                        </p>
                      </Card>

                      <Card className="p-4">
                        <h3 className="font-medium mb-2">Tech Notes</h3>
                        <p className="text-sm whitespace-pre-wrap">
                          {workOrder.tech_notes || 'No tech notes available'}
                        </p>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="signature" className="h-full mt-0 data-[state=active]:flex flex-col">
                  <ScrollArea className="flex-1">
                    <div className="p-6">
                      <Card className="p-4">
                        {workOrder.signature_url ? (
                          <img 
                            src={workOrder.signature_url} 
                            alt="Signature" 
                            className="max-w-full"
                          />
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            No signature available
                          </div>
                        )}
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>

            {/* Action Buttons */}
            <div className="p-6 border-t bg-background space-y-2 flex-shrink-0">
              <Button 
                className="w-full justify-start"
                variant="outline"
                onClick={() => onStatusUpdate?.(workOrder.id, 'approved')}
              >
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                Mark as Approved
              </Button>
              <Button 
                className="w-full justify-start"
                variant="outline"
                onClick={() => onStatusUpdate?.(workOrder.id, 'flagged')}
              >
                <Flag className="mr-2 h-4 w-4 text-red-600" />
                Flag for Review
              </Button>
              <Button 
                className="w-full justify-start"
                variant="outline"
                onClick={onDownloadAll}
                disabled={images.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Download All Images
              </Button>
            </div>
          </div>

          {/* Right Panel - Image Viewer */}
          <div className="w-[60%] bg-background flex flex-col">
            <div className="flex-1 relative flex items-center justify-center">
              {images.length > 0 ? (
                <>
                  <img 
                    src={images[currentImageIndex]?.url} 
                    alt={`Image ${currentImageIndex + 1}`}
                    className="max-h-full max-w-full object-contain"
                  />
                  
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-4 hover:bg-background/20"
                        onClick={handlePrevious}
                      >
                        <ChevronLeft className="h-8 w-8" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 hover:bg-background/20"
                        onClick={handleNext}
                      >
                        <ChevronRight className="h-8 w-8" />
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center space-y-4 text-muted-foreground">
                  <ImageOff className="h-16 w-16 mx-auto" />
                  <p className="text-lg font-medium">No images available</p>
                  <p className="text-sm">This work order doesn't have any images attached.</p>
                </div>
              )}
            </div>

            {/* Image Navigation Footer */}
            <div className="p-4 border-t">
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
                  Order {currentIndex + 1} of {workOrders.length}
                </span>

                <Button
                  variant="outline"
                  onClick={() => onNavigate(currentIndex + 1)}
                  disabled={currentIndex >= workOrders.length - 1}
                >
                  Next Order
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
