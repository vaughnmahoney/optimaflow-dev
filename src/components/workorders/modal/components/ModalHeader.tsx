
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalHeaderProps {
  orderNo: string;
  status: string;
  onClose: () => void;
}

export const ModalHeader = ({ orderNo, status, onClose }: ModalHeaderProps) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-500 hover:bg-green-600';
      case 'flagged':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  return (
    <div className="p-6 border-b">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">
          Work Order #{orderNo}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-4" />
        </Button>
      </div>
      <Badge 
        className={cn(
          "px-4 py-1",
          getStatusColor(status || 'pending')
        )}
      >
        {(status || 'PENDING').toUpperCase()}
      </Badge>
    </div>
  );
};
