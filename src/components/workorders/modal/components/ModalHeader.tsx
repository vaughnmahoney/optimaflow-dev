
import { Button } from "@/components/ui/button";
import { CheckCircle, Flag, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalHeaderProps {
  orderNo: string;
  status: string;
  driverName?: string;
  onClose: () => void;
}

export const ModalHeader = ({ orderNo, status, driverName, onClose }: ModalHeaderProps) => {
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'flagged':
        return <Flag className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-yellow-500" />;
    }
  };

  return (
    <div className="p-6 border-b w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold">
            #{orderNo}
          </h2>
          {getStatusIcon(status || 'pending')}
        </div>
        <div className="flex items-center gap-6">
          {driverName && (
            <div className="text-right font-medium">
              {driverName}
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
