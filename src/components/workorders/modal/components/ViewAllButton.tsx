
import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid2X2 } from 'lucide-react';

interface ViewAllButtonProps {
  onClick: () => void;
  totalImages: number;
}

export const ViewAllButton: React.FC<ViewAllButtonProps> = ({ 
  onClick, 
  totalImages 
}) => {
  return (
    <Button 
      variant="outline"
      size="sm"
      className="flex items-center gap-2 bg-white/80 hover:bg-white border-gray-200 text-gray-700"
      onClick={onClick}
    >
      <Grid2X2 className="h-4 w-4" />
      <span>View All ({totalImages})</span>
    </Button>
  );
};
