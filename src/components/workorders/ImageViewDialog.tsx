
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Download, X, CheckCircle, Flag, ArrowLeft, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "../ui/badge";

interface ImageViewDialogProps {
  workOrderId: string | null;
  onClose: () => void;
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  workOrders: { id: string }[];
}

interface WorkOrderLocation {
  store_name: string;
  address: string;
}

export const ImageViewDialog = ({ workOrderId, onClose, onStatusUpdate, workOrders }: ImageViewDialogProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const currentWorkOrderIndex = workOrders.findIndex(wo => wo.id === workOrderId);

  const handlePreviousWorkOrder = () => {
    if (currentWorkOrderIndex > 0) {
      const previousWorkOrder = workOrders[currentWorkOrderIndex - 1];
      setCurrentImageIndex(0);
      if (previousWorkOrder) {
        onClose();
        setTimeout(() => {
          const event = new CustomEvent('openWorkOrder', { detail: previousWorkOrder.id });
          window.dispatchEvent(event);
        }, 100);
      }
    }
  };

  const handleNextWorkOrder = () => {
    if (currentWorkOrderIndex < workOrders.length - 1) {
      const nextWorkOrder = workOrders[currentWorkOrderIndex + 1];
      setCurrentImageIndex(0);
      if (nextWorkOrder) {
        onClose();
        setTimeout(() => {
          const event = new CustomEvent('openWorkOrder', { detail: nextWorkOrder.id });
          window.dispatchEvent(event);
        }, 100);
      }
    }
  };

  const { data: workOrder } = useQuery({
    queryKey: ["workOrder", workOrderId],
    queryFn: async () => {
      if (!workOrderId) return null;
      
      const { data, error } = await supabase
        .from("work_orders")
        .select(`
          *,
          technicians (name)
        `)
        .eq("id", workOrderId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!workOrderId,
  });

  const { data: images, isLoading } = useQuery({
    queryKey: ["workOrderImages", workOrderId],
    queryFn: async () => {
      if (!workOrderId) return [];
      
      const { data, error } = await supabase
        .from("work_order_images")
        .select("*")
        .eq("work_order_id", workOrderId);

      if (error) throw error;
      return data;
    },
    enabled: !!workOrderId,
  });

  const handleStatusUpdate = (newStatus: string) => {
    if (workOrderId) {
      onStatusUpdate(workOrderId, newStatus);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          if (currentImageIndex === 0) {
            handlePreviousWorkOrder();
          } else {
            setCurrentImageIndex((prev) => prev - 1);
          }
          break;
        case "ArrowRight":
          if (currentImageIndex === (images?.length ?? 1) - 1) {
            handleNextWorkOrder();
          } else {
            setCurrentImageIndex((prev) => prev + 1);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentImageIndex, images?.length]);

  const handlePrevious = () => {
    if (currentImageIndex === 0) {
      handlePreviousWorkOrder();
    } else {
      setCurrentImageIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentImageIndex === (images?.length ?? 1) - 1) {
      handleNextWorkOrder();
    } else {
      setCurrentImageIndex((prev) => prev + 1);
    }
  };

  const handleDownloadAll = async () => {
    console.log("Downloading all images");
  };

  const currentImage = images?.[currentImageIndex];
  const location = workOrder?.location as unknown as WorkOrderLocation;

  return (
    <Dialog 
      open={!!workOrderId} 
      onOpenChange={onClose}
    >
      <DialogContent className="max-w-6xl p-0">
        <div className="flex flex-col h-full">
          <div className="flex flex-1 min-h-0">
            <div className="w-80 border-r bg-gray-50/50 p-6 space-y-6">
              <div className="flex justify-between items-center">
                <DialogTitle>Service Details</DialogTitle>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Order ID</label>
                  <p className="text-sm">{workOrder?.external_id || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Service Date</label>
                  <p className="text-sm">
                    {workOrder?.service_date 
                      ? format(new Date(workOrder.service_date), "PPP")
                      : 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Technician</label>
                  <p className="text-sm">{workOrder?.technicians?.name || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-sm whitespace-pre-wrap">
                    {location 
                      ? `${location.store_name}\n${location.address}`
                      : 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge 
                      variant={
                        workOrder?.qc_status === 'approved' 
                          ? 'success' 
                          : workOrder?.qc_status === 'flagged' 
                          ? 'destructive' 
                          : 'warning'
                      }
                    >
                      {workOrder?.qc_status?.toUpperCase() || 'PENDING'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Service Notes</label>
                  <p className="text-sm whitespace-pre-wrap">{workOrder?.notes || 'No notes'}</p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-green-500 hover:bg-green-600"
                    onClick={() => handleStatusUpdate('approved')}
                    disabled={workOrder?.qc_status === 'approved'}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button 
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleStatusUpdate('flagged')}
                    disabled={workOrder?.qc_status === 'flagged'}
                  >
                    <Flag className="mr-2 h-4 w-4" />
                    Flag
                  </Button>
                </div>

                <Button 
                  className="w-full"
                  onClick={handleDownloadAll}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download All Photos
                </Button>
              </div>
            </div>

            <div className="flex-1 p-6">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-[400px] w-full rounded-lg" />
                  <div className="flex gap-2">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-20 rounded-lg" />
                    ))}
                  </div>
                </div>
              ) : !images?.length ? (
                <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                  No images available
                </div>
              ) : (
                <div className="relative h-full flex flex-col space-y-4">
                  <div className="relative flex-1 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                    <img
                      src={currentImage?.image_url}
                      alt={`Service image ${currentImageIndex + 1}`}
                      className="max-h-[calc(90vh-12rem)] max-w-full object-contain animate-fade-in"
                    />
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                      onClick={handlePrevious}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                      onClick={handleNext}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>

                    <div className="absolute top-4 right-4 bg-white/90 px-4 py-2 rounded-full text-sm shadow-lg">
                      Image {currentImageIndex + 1} of {images.length}
                    </div>
                  </div>

                  <div className="flex justify-center space-x-2 h-20 overflow-x-auto">
                    {images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-full aspect-square rounded-lg overflow-hidden transition-all ${
                          index === currentImageIndex 
                            ? 'ring-2 ring-primary ring-offset-2' 
                            : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={image.image_url}
                          alt={`Thumbnail ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t bg-gray-50/50 p-4 flex items-center justify-between">
            <Button
              onClick={handlePreviousWorkOrder}
              disabled={currentWorkOrderIndex <= 0}
              variant="outline"
              className="w-[140px]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous Order
            </Button>

            <div className="text-sm text-muted-foreground">
              Order {currentWorkOrderIndex + 1} of {workOrders.length}
            </div>

            <Button
              onClick={handleNextWorkOrder}
              disabled={currentWorkOrderIndex >= workOrders.length - 1}
              variant="outline"
              className="w-[140px]"
            >
              Next Order
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
