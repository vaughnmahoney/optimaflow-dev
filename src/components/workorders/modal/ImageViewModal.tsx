
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Flag, Download, X } from "lucide-react";
import { useState } from "react";
import { WorkOrder } from "../types";
import { cn } from "@/lib/utils";
import { OrderDetailsTab } from "./tabs/OrderDetailsTab";
import { NotesTab } from "./tabs/NotesTab";
import { SignatureTab } from "./tabs/SignatureTab";
import { ImageViewer } from "./modal/ImageViewer";

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
  
  const completionData = workOrder?.completion_response?.orders[0]?.data;
  const images = completionData?.form?.images || [];
  
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

  if (!workOrder) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-screen-xl w-[90vw] h-[85vh] p-0">
        <div className="h-full grid grid-cols-5">
          {/* Left Panel */}
          <div className="col-span-2 flex flex-col border-r bg-background max-h-full overflow-hidden">
            {/* Header */}
            <div className="shrink-0 p-6 border-b">
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

            {/* Tabs */}
            <Tabs defaultValue="details" className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <TabsList className="px-6 pt-2 justify-start border-b rounded-none gap-4 shrink-0">
                <TabsTrigger value="details">Order Details</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="signature">Signature</TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-y-auto">
                <TabsContent value="details" className="m-0 p-6 h-full">
                  <OrderDetailsTab workOrder={workOrder} />
                </TabsContent>
                <TabsContent value="notes" className="m-0 p-6 h-full">
                  <NotesTab workOrder={workOrder} />
                </TabsContent>
                <TabsContent value="signature" className="m-0 p-6 h-full">
                  <SignatureTab workOrder={workOrder} />
                </TabsContent>
              </div>
            </Tabs>

            {/* Action Buttons */}
            <div className="shrink-0 p-6 border-t bg-background space-y-2">
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

          {/* Right Panel */}
          <div className="col-span-3 bg-background/50 flex flex-col max-h-full">
            <ImageViewer
              images={images}
              currentImageIndex={currentImageIndex}
              onPrevious={handlePrevious}
              onNext={handleNext}
              currentOrderIndex={currentIndex}
              totalOrders={workOrders.length}
              onNavigateOrder={onNavigate}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
