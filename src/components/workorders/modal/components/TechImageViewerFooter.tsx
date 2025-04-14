
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, ShieldCheck } from 'lucide-react';

interface TechImageViewerFooterProps {
  onSafetyNotesClick?: () => void;
}

export const TechImageViewerFooter = ({ 
  onSafetyNotesClick 
}: TechImageViewerFooterProps) => {
  return (
    <div className="bg-white border-t px-4 py-3 flex justify-between items-center">
      <div className="text-sm text-gray-500">
        Order History Images
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onSafetyNotesClick}
        className="gap-2"
      >
        <ShieldCheck className="h-4 w-4" />
        Safety Notes
      </Button>
    </div>
  );
};
