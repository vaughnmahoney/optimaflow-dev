
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WorkOrder } from "../types";
import { ModalHeader } from "./components/ModalHeader";
import { ModalContent } from "./components/ModalContent";
import { ModalFooter } from "./components/ModalFooter";
import { NavigationControls } from "./components/NavigationControls";
import { useImageNavigation } from "@/hooks/useImageNavigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageViewModalProps {
  workOrder: WorkOrder;
  workOrders: WorkOrder[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  onNavigate: (index: number) => void;
}

export const ImageViewModal: React.FC<ImageViewModalProps> = ({
  workOrder,
  workOrders,
  currentIndex,
  isOpen,
  onClose,
  onStatusUpdate,
  onNavigate,
}) => {
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const images = workOrder?.completion_response?.orders[0]?.data?.form?.images || [];
  
  const {
    currentImageIndex,
    setCurrentImageIndex,
    handlePrevious: handlePreviousImage,
    handleNext: handleNextImage,
  } = useImageNavigation(images.length);

  // Reset state when changing work orders
  useEffect(() => {
    setCurrentImageIndex(0);
    setIsImageExpanded(false);
  }, [workOrder?.id, setCurrentImageIndex]);

  const toggleImageExpand = () => {
    setIsImageExpanded(!isImageExpanded);
  };

  const handlePreviousOrder = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNextOrder = () => {
    if (currentIndex < workOrders.length - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  const saveQcNotes = async (workOrderId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ qc_notes: notes })
        .eq('id', workOrderId);
      
      if (error) throw error;
      
      toast.success("QC notes saved successfully");
      return;
    } catch (error) {
      console.error("Error saving QC notes:", error);
      toast.error("Failed to save QC notes");
      throw error;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] h-[90vh] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="py-2 px-4 border-b">
            <DialogTitle>
              <ModalHeader workOrder={workOrder} isExpanded={isImageExpanded} />
            </DialogTitle>
          </DialogHeader>

          {/* Main content */}
          <ModalContent
            workOrder={workOrder}
            images={images}
            currentImageIndex={currentImageIndex}
            setCurrentImageIndex={setCurrentImageIndex}
            isImageExpanded={isImageExpanded}
            toggleImageExpand={toggleImageExpand}
            onSaveQcNotes={saveQcNotes}
          />

          {/* Footer */}
          <ModalFooter
            workOrderId={workOrder.id}
            onStatusUpdate={onStatusUpdate}
            isImageExpanded={isImageExpanded}
          />
          
          {/* Navigation controls */}
          <NavigationControls 
            currentIndex={currentIndex}
            totalCount={workOrders.length}
            onPrevious={handlePreviousOrder}
            onNext={handleNextOrder}
            currentImageIndex={currentImageIndex}
            totalImages={images.length}
            onPreviousImage={handlePreviousImage}
            onNextImage={handleNextImage}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
