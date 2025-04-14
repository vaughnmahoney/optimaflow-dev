
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';

interface TechImageViewerFooterProps {
  onSafetyNotesClick?: () => void;
}

export const TechImageViewerFooter = ({ 
  onSafetyNotesClick 
}: TechImageViewerFooterProps) => {
  return (
    <div className="bg-white border-t px-4 py-3 flex justify-center items-center">
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
