
import { ImageType } from "@/components/workorders/types/image";
import { Flag } from "lucide-react";
import { ForwardedRef, forwardRef } from "react";

interface ImageThumbnailProps {
  image: ImageType;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

export const ImageThumbnail = forwardRef(({ 
  image, 
  index, 
  isActive, 
  onClick 
}: ImageThumbnailProps, ref: ForwardedRef<HTMLDivElement>) => {
  return (
    <div 
      ref={ref}
      onClick={onClick}
      className={`relative flex-shrink-0 cursor-pointer transition-all duration-200 w-16 h-16 ${
        isActive 
          ? 'border-2 border-primary shadow-sm scale-[1.05] z-10' 
          : 'border border-gray-200 opacity-70 hover:opacity-100'
      } rounded-md overflow-hidden`}
    >
      <img 
        src={image.url} 
        alt={`Thumbnail ${index + 1}`}
        className="w-full h-full object-cover"
      />
      
      {image.flagged && (
        <div className="absolute top-0 right-0 bg-red-500 p-1 rounded-bl-md">
          <Flag className="h-3 w-3 text-white" />
        </div>
      )}
    </div>
  );
});

ImageThumbnail.displayName = "ImageThumbnail";
