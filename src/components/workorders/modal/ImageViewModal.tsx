
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { WorkOrder } from "../types";
import { ModalHeader } from "./components/ModalHeader";
import { QuickInfo } from "./components/QuickInfo";
import { OrderDetails } from "./components/OrderDetails";
import { ImageViewer } from "./components/ImageViewer";
import { ImageThumbnails } from "./components/ImageThumbnails";
import { ModalFooter } from "./components/ModalFooter";
import { NavigationControls } from "./components/NavigationControls";
import { getStatusBorderColor } from "./utils/modalUtils";
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
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  
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
  }, [isOpen, currentImageIndex, currentIndex, workOrder]);
  
  if (!workOrder) return null;

  const completionData = workOrder?.completion_response?.orders?.[0]?.data;
  const images = completionData?.form?.images || [];
  
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

  // Status color for border
  const statusBorderColor = getStatusBorderColor(workOrder.status || "pending_review");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-6xl p-0 h-[90vh] flex flex-col rounded-lg overflow-hidden border-t-4 ${statusBorderColor}`}>
        {/* Header with order info */}
        <ModalHeader workOrder={workOrder} onClose={onClose} />
        
        {/* Main content area - Two column layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left side - Image viewer with vertical thumbnails */}
          <div className={`flex flex-row ${isImageExpanded ? 'w-full' : 'w-3/5'} border-r`}>
            {/* Vertical thumbnail strip - Only show when not expanded */}
            {!isImageExpanded && (
              <ImageThumbnails 
                images={images} 
                currentImageIndex={currentImageIndex} 
                setCurrentImageIndex={setCurrentImageIndex} 
              />
            )}
            
            {/* Main image container */}
            <div className="flex-1 relative flex">
              <ImageViewer 
                images={images}
                currentImageIndex={currentImageIndex}
                setCurrentImageIndex={setCurrentImageIndex}
                isImageExpanded={isImageExpanded}
                toggleImageExpand={toggleImageExpand}
              />
            </div>
          </div>
          
          {/* Right side - Details panel */}
          {!isImageExpanded && (
            <div className="w-2/5 flex flex-col overflow-hidden">
              {/* Quick info section */}
              <QuickInfo workOrder={workOrder} />
              
              {/* Tabs for Details, Notes, Signature */}
              <div className="bg-gray-50 dark:bg-gray-900 border-t border-b">
                <div className="flex justify-around">
                  <button 
                    className={`px-6 py-3 font-medium text-sm ${activeTab === 'details' 
                      ? 'text-gray-700 border-b-2 border-black' 
                      : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('details')}
                  >
                    Order Details
                  </button>
                  <button 
                    className={`px-6 py-3 font-medium text-sm ${activeTab === 'notes' 
                      ? 'text-gray-700 border-b-2 border-black' 
                      : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('notes')}
                  >
                    Notes
                  </button>
                  <button 
                    className={`px-6 py-3 font-medium text-sm ${activeTab === 'signature' 
                      ? 'text-gray-700 border-b-2 border-black' 
                      : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('signature')}
                  >
                    Signature
                  </button>
                </div>
              </div>
              
              {/* Tab content */}
              {activeTab === 'details' && <OrderDetails workOrder={workOrder} />}
              {activeTab === 'notes' && <NotesTab workOrder={workOrder} />}
              {activeTab === 'signature' && <SignatureTab workOrder={workOrder} />}
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <ModalFooter 
          workOrderId={workOrder.id} 
          onStatusUpdate={onStatusUpdate} 
          onDownloadAll={onDownloadAll}
          hasImages={images.length > 0}
        />
        
        {/* Navigation Footer */}
        <NavigationControls 
          currentIndex={currentIndex}
          totalOrders={workOrders.length}
          onPreviousOrder={handlePreviousOrder}
          onNextOrder={handleNextOrder}
        />
      </DialogContent>
    </Dialog>
  );
};
