
import { useState, useRef, useEffect } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  // Refs for scroll-based tab tracking
  const detailsSectionRef = useRef<HTMLDivElement>(null);
  const notesSectionRef = useRef<HTMLDivElement>(null);
  const signatureSectionRef = useRef<HTMLDivElement>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);
  
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
  
  // Function to handle scrolling to tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    switch (value) {
      case "details":
        detailsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        break;
      case "notes":
        notesSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        break;
      case "signature":
        signatureSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        break;
    }
  };
  
  // Set up scroll observation to update active tab
  useEffect(() => {
    if (!isOpen || !contentScrollRef.current) return;
    
    const options = {
      root: contentScrollRef.current,
      rootMargin: "-50px 0px",
      threshold: 0.1
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id === "details-section") {
            setActiveTab("details");
          } else if (id === "notes-section") {
            setActiveTab("notes");
          } else if (id === "signature-section") {
            setActiveTab("signature");
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, options);
    
    if (detailsSectionRef.current) observer.observe(detailsSectionRef.current);
    if (notesSectionRef.current) observer.observe(notesSectionRef.current);
    if (signatureSectionRef.current) observer.observe(signatureSectionRef.current);

    return () => observer.disconnect();
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-6xl p-0 ${isMobile ? 'h-[95vh]' : 'h-[90vh]'} flex flex-col rounded-lg overflow-hidden border-t-4 ${statusBorderColor}`}>
        <ModalHeader workOrder={currentWorkOrder} onClose={onClose} />
        
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left side - Image viewer (60% width on desktop, full width on mobile) */}
          <div className={`${isMobile ? 'w-full h-1/2' : 'w-[60%] h-full'} overflow-hidden`}>
            <ModalContent
              workOrder={currentWorkOrder}
              images={images}
              currentImageIndex={currentImageIndex}
              setCurrentImageIndex={setCurrentImageIndex}
              isImageExpanded={isImageExpanded}
              toggleImageExpand={toggleImageExpand}
            />
          </div>
          
          {/* Right side - Information (40% width on desktop, full width on mobile) */}
          <div className={`${isMobile ? 'w-full h-1/2' : 'w-[40%] h-full'} border-l`}>
            <div className="h-full flex flex-col">
              {/* Horizontal tabs */}
              <div className="flex border-b">
                <div 
                  className={`px-3 md:px-6 py-3 font-medium cursor-pointer text-sm md:text-base ${activeTab === 'details' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                  onClick={() => handleTabChange('details')}
                >
                  Order Details
                </div>
                <div 
                  className={`px-3 md:px-6 py-3 font-medium cursor-pointer text-sm md:text-base ${activeTab === 'notes' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                  onClick={() => handleTabChange('notes')}
                >
                  Notes
                </div>
                <div 
                  className={`px-3 md:px-6 py-3 font-medium cursor-pointer text-sm md:text-base ${activeTab === 'signature' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                  onClick={() => handleTabChange('signature')}
                >
                  Signature
                </div>
              </div>
              
              {/* Tab content with scroll observation */}
              <ScrollArea className="flex-1 overflow-auto" viewportRef={contentScrollRef}>
                <div className="space-y-4 pt-4">
                  {/* Order Details Section */}
                  <div id="details-section" ref={detailsSectionRef} className="px-4 pb-6 scroll-m-12">
                    <OrderDetailsTab workOrder={currentWorkOrder} />
                  </div>
                  
                  {/* Notes Section */}
                  <div id="notes-section" ref={notesSectionRef} className="px-4 pb-6 scroll-m-12">
                    <NotesTab workOrder={currentWorkOrder} />
                  </div>
                  
                  {/* Signature Section */}
                  <div id="signature-section" ref={signatureSectionRef} className="px-4 pb-6 scroll-m-12">
                    <SignatureTab workOrder={currentWorkOrder} />
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
        
        <ModalFooter 
          workOrderId={currentWorkOrder.id} 
          onStatusUpdate={onStatusUpdate} 
          onDownloadAll={onDownloadAll}
          hasImages={images.length > 0}
          status={currentWorkOrder.status}
          onResolveFlag={onResolveFlag}
          workOrder={currentWorkOrder}
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
