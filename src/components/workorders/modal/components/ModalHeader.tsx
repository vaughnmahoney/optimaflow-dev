
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalHeaderProps {
  orderNo: string;
  status: string;
  driverName?: string;
  onClose: () => void;
}

export const ModalHeader = ({ orderNo, status, driverName, onClose }: ModalHeaderProps) => {
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
    <div className="p-6 border-b w-full">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">
            Work Order #{orderNo}
          </h2>
          <Badge 
            className={cn(
              "px-4 py-1",
              getStatusColor(status || 'pending')
            )}
          >
            {(status || 'PENDING').toUpperCase()}
          </Badge>
        </div>
        <div className="flex items-center gap-6">
          {driverName && (
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Driver</div>
              <div className="font-medium">{driverName}</div>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
