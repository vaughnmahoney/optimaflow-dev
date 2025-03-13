
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { WorkOrder } from "../types";
import { ModalHeader } from "./components/ModalHeader";
import { ModalContent } from "./components/ModalContent";
import { ModalFooter } from "./components/ModalFooter";
import { NavigationControls } from "./components/NavigationControls";
import { getStatusBorderColor } from "./utils/modalUtils";
import { useWorkOrderNavigation } from "@/hooks/useWorkOrderNavigation";
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
  onResolveFlag?: (workOrderId: string, resolution: string) => void;
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
  onResolveFlag,
}: ImageViewModalProps) => {
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  
  const {
    currentWorkOrder,
    currentIndex: navIndex,
    currentImageIndex,
    setCurrentImageIndex,
    handlePreviousOrder,
    handleNextOrder,
    handleSetOrder
  } = useWorkOrderNavigation({
    workOrders,
    initialWorkOrderId: workOrder?.id || null,
    isOpen,
    onClose
  });
  
  if (!currentWorkOrder) return null;

  const toggleImageExpand = () => {
    setIsImageExpanded(!isImageExpanded);
  };

  const completionData = currentWorkOrder?.completion_response?.orders?.[0]?.data;
  const images = completionData?.form?.images || [];
  
  const statusBorderColor = getStatusBorderColor(currentWorkOrder.status || "pending_review");

  const handleNavigate = (index: number) => {
    handleSetOrder(index);
    onNavigate(index);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-6xl p-0 h-[90vh] flex flex-col rounded-lg overflow-hidden border-t-4 ${statusBorderColor}`}>
        <ModalHeader workOrder={currentWorkOrder} onClose={onClose} />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Left side - Image viewer (60% width) */}
          <div className="w-[60%] h-full overflow-hidden">
            <ModalContent
              workOrder={currentWorkOrder}
              images={images}
              currentImageIndex={currentImageIndex}
              setCurrentImageIndex={setCurrentImageIndex}
              isImageExpanded={isImageExpanded}
              toggleImageExpand={toggleImageExpand}
            />
          </div>
          
          {/* Right side - Information (40% width) */}
          <div className="w-[40%] h-full border-l">
            <div className="h-full flex flex-col">
              {/* Horizontal tabs */}
              <div className="flex border-b">
                <div 
                  className={`px-6 py-3 font-medium cursor-pointer ${activeTab === 'details' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('details')}
                >
                  Order Details
                </div>
                <div 
                  className={`px-6 py-3 font-medium cursor-pointer ${activeTab === 'notes' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('notes')}
                >
                  Notes
                </div>
                <div 
                  className={`px-6 py-3 font-medium cursor-pointer ${activeTab === 'signature' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('signature')}
                >
                  Signature
                </div>
              </div>
              
              {/* Tab content */}
              <div className="flex-1 overflow-auto">
                {activeTab === 'details' && <OrderDetailsTab workOrder={currentWorkOrder} />}
                {activeTab === 'notes' && <NotesTab workOrder={currentWorkOrder} />}
                {activeTab === 'signature' && <SignatureTab workOrder={currentWorkOrder} />}
              </div>
            </div>
          </div>
        </div>
        
        <ModalFooter 
          workOrderId={currentWorkOrder.id} 
          workOrder={currentWorkOrder}
          onStatusUpdate={onStatusUpdate} 
          onDownloadAll={onDownloadAll}
          hasImages={images.length > 0}
          status={currentWorkOrder.status}
          onResolveFlag={onResolveFlag}
        />
        
        <NavigationControls 
          currentIndex={navIndex}
          totalOrders={workOrders.length}
          onPreviousOrder={handlePreviousOrder}
          onNextOrder={handleNextOrder}
        />
      </DialogContent>
    </Dialog>
  );
};
