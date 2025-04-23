import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ImageType } from '@/components/workorders/types/image';

export const useImageCaching = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Function to check if an image is from the cache
  const isImageCached = (imageUrl: string): boolean => {
    return imageUrl.includes('work_order_images') && imageUrl.includes('supabase.co');
  };

  // Function to get either the cached image URL or the original URL
  const getOptimalImageUrl = (workOrder: any, imageIndex: number): string | undefined => {
    // Return undefined if no work order or the work order doesn't have a completion response
    if (!workOrder || !workOrder.completion_response) return undefined;
    
    // Try to get the image from the completion response
    const originalImages = workOrder.completion_response?.orders?.[0]?.data?.form?.images || [];
    
    // If there are no original images or the index is out of bounds, return undefined
    if (!originalImages.length || imageIndex >= originalImages.length) return undefined;
    
    // If the images are cached, try to get the cached URL
    if (workOrder.images_cached && workOrder.cached_images && Array.isArray(workOrder.cached_images)) {
      // Find the corresponding cached image
      const cachedImage = workOrder.cached_images[imageIndex];
      if (cachedImage && cachedImage.cachedUrl) {
        return cachedImage.cachedUrl;
      }
    }
    
    // If not cached or cached image not found, return the original URL
    return originalImages[imageIndex]?.url;
  };

  // Function to trigger the caching process for a work order's images
  const cacheWorkOrderImages = async (workOrderId: string): Promise<boolean> => {
    setIsProcessing(true);
    try {
      // Check if already cached
      const { data: workOrder, error: fetchError } = await supabase
        .from('work_orders')
        .select('*')
        .eq('id', workOrderId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching work order:', fetchError);
        throw fetchError;
      }
      
      // If already cached, return true
      if (workOrder.images_cached && workOrder.cached_images) {
        console.log('Images already cached for this work order');
        return true;
      }
      
      // Call the edge function to cache images
      const { data, error } = await supabase.functions.invoke('cache-work-order-images', {
        body: { workOrderId }
      });
      
      if (error) {
        console.error('Error caching images:', error);
        toast.error('Failed to cache images: ' + error.message);
        return false;
      }
      
      if (!data.success) {
        console.error('Failed to cache images:', data.error);
        toast.error('Failed to cache images: ' + (data.error || 'Unknown error'));
        return false;
      }
      
      toast.success(`Successfully cached ${data.cachedImages.length} images`);
      return true;
    } catch (error) {
      console.error('Error in cacheWorkOrderImages:', error);
      toast.error('Error caching images: ' + (error as Error).message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to get all cached images for a work order
  const getWorkOrderCachedImages = (workOrder: any): ImageType[] => {
    if (!workOrder) return [];
    
    // If images are cached, return the cached images
    if (workOrder.images_cached && workOrder.cached_images && Array.isArray(workOrder.cached_images)) {
      return workOrder.cached_images.map((img: any) => ({
        url: img.cachedUrl,
        type: img.type || 'unknown',
        name: img.fileName,
        flagged: false // Add flagged property with default value
      }));
    }
    
    // Otherwise, return the original images
    const originalImages = workOrder.completion_response?.orders?.[0]?.data?.form?.images || [];
    return originalImages.map((img: any) => ({
      url: img.url,
      type: img.type || 'unknown',
      flagged: img.flagged || false
    }));
  };

  return {
    isProcessing,
    isImageCached,
    getOptimalImageUrl,
    cacheWorkOrderImages,
    getWorkOrderCachedImages
  };
};
