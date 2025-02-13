
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

interface ImageViewDialogProps {
  workOrderId: string | null;
  onClose: () => void;
}

export const ImageViewDialog = ({ workOrderId, onClose }: ImageViewDialogProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  return (
    <Dialog open={!!workOrderId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Work Order Images</DialogTitle>
        </DialogHeader>
        
        <div className="relative min-h-[400px] w-full">
          {isLoading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : !images?.length ? (
            <div className="flex h-[400px] items-center justify-center text-muted-foreground">
              No images available
            </div>
          ) : (
            <div className="space-y-4">
              <img
                src={images[currentImageIndex].image_url}
                alt={`Work order image ${currentImageIndex + 1}`}
                className="h-[400px] w-full rounded-lg object-contain"
              />
              {images.length > 1 && (
                <div className="flex justify-center gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-2 w-2 rounded-full ${
                        index === currentImageIndex ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
