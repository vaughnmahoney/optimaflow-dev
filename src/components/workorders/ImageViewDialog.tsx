
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { format } from "date-fns";

interface ImageViewDialogProps {
  workOrderId: string | null;
  onClose: () => void;
}

export const ImageViewDialog = ({ workOrderId, onClose }: ImageViewDialogProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? (images?.length ?? 1) - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => 
      prev === (images?.length ?? 1) - 1 ? 0 : prev + 1
    );
  };

  const handleDownloadAll = async () => {
    // In a real implementation, we would:
    // 1. Create a zip file of all images
    // 2. Trigger the download
    console.log("Downloading all images");
  };

  const currentImage = images?.[currentImageIndex];

  return (
    <Dialog 
      open={!!workOrderId} 
      onOpenChange={() => {
        setIsFullscreen(false);
        onClose();
      }}
    >
      <DialogContent className={`${isFullscreen ? 'max-w-[95vw] h-[95vh]' : 'max-w-6xl'} p-0`}>
        <div className="flex h-full">
          {/* Order Details Sidebar */}
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
                  {workOrder?.location 
                    ? `${workOrder.location.store_name}\n${workOrder.location.address}`
                    : 'N/A'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Service Notes</label>
                <p className="text-sm whitespace-pre-wrap">{workOrder?.service_notes || 'No notes'}</p>
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

          {/* Images Section */}
          <div className="flex-1 p-6">
            <div className="space-y-6">
              {isLoading ? (
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-lg" />
                  ))}
                </div>
              ) : !images?.length ? (
                <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                  No images available
                </div>
              ) : isFullscreen ? (
                <div className="relative h-full">
                  <img
                    src={currentImage?.image_url}
                    alt={`Service image ${currentImageIndex + 1}`}
                    className="h-full w-full object-contain"
                  />
                  
                  {/* Navigation Arrows */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                    onClick={handleNext}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  {/* Image Info */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-2 rounded-full text-sm">
                    Image {currentImageIndex + 1} of {images.length}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => {
                        setCurrentImageIndex(index);
                        setIsFullscreen(true);
                      }}
                      className="relative aspect-square group rounded-lg overflow-hidden"
                    >
                      <img
                        src={image.image_url}
                        alt={`Service image ${index + 1}`}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
