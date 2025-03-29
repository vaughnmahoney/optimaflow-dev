
import React from 'react';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerClose 
} from '@/components/ui/drawer';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageType } from '../../types/image';

interface ThumbnailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  images: ImageType[];
  currentImageIndex: number;
  onSelectImage: (index: number) => void;
}

export const ThumbnailDrawer: React.FC<ThumbnailDrawerProps> = ({
  isOpen,
  onClose,
  images,
  currentImageIndex,
  onSelectImage
}) => {
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="p-4 max-h-[80vh]">
        <DrawerHeader className="px-0 pt-0 pb-4">
          <div className="flex items-center justify-between">
            <DrawerTitle>All Images ({images.length})</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        
        <div className="grid grid-cols-3 gap-2 overflow-y-auto pb-8">
          {images.map((image, idx) => (
            <div 
              key={idx} 
              className={`relative aspect-square cursor-pointer transition-all duration-100 ${
                idx === currentImageIndex 
                  ? 'ring-2 ring-primary ring-offset-2' 
                  : 'opacity-80 hover:opacity-100'
              }`}
              onClick={() => {
                onSelectImage(idx);
                onClose();
              }}
            >
              <img 
                src={image.url} 
                alt={`Thumbnail ${idx + 1}`} 
                className="h-full w-full object-cover rounded-md" 
              />
              <span className="absolute bottom-1 right-1 text-xs bg-black/60 text-white px-1 rounded-sm">
                {idx + 1}
              </span>
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
