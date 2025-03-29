
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Clock, PauseCircle, AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressState } from "@/hooks/bulk-orders/useProgressiveLoader";

interface FetchProgressBarProps {
  state: ProgressState;
  onPause?: () => void;
  onResume?: () => void;
  onReset?: () => void;
}

export const FetchProgressBar = ({ 
  state, 
  onPause, 
  onResume, 
  onReset 
}: FetchProgressBarProps) => {
  const { 
    isLoading, 
    isPaused, 
    isComplete, 
    currentPage, 
    totalPages, 
    processedOrders,
    totalOrders,
    progress,
    error
  } = state;

  // Don't show anything if we're not loading and have no progress
  if (!isLoading && !isPaused && !isComplete && progress === 0 && !error) {
    return null;
  }

  // Get status indicators
  const getStatusIcon = () => {
    if (error) return <AlertOctagon className="h-5 w-5 text-red-500" />;
    if (isComplete) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (isPaused) return <PauseCircle className="h-5 w-5 text-amber-500" />;
    if (isLoading) return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
    return <AlertCircle className="h-5 w-5 text-gray-400" />;
  };

  const getStatusText = () => {
    if (error) return `Error: ${error}`;
    if (isComplete) return "Complete";
    if (isPaused) return "Paused";
    if (isLoading) return "Loading...";
    return "Ready";
  };

  const getStatusColor = () => {
    if (error) return "text-red-700 bg-red-50";
    if (isComplete) return "text-green-700 bg-green-50";
    if (isPaused) return "text-amber-700 bg-amber-50";
    if (isLoading) return "text-blue-700 bg-blue-50";
    return "text-gray-700 bg-gray-50";
  };

  return (
    <Card className="bg-white border">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Status bar */}
          <div className={`flex items-center p-2 rounded ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="ml-2 font-medium">{getStatusText()}</span>
          </div>

          {/* Progress details */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-500 mb-1">Orders</div>
              <div className="font-medium">{processedOrders} {totalOrders ? `/ ${totalOrders}` : ''}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Batches</div>
              <div className="font-medium">{currentPage} {totalPages ? `/ ${totalPages}` : ''}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Progress</div>
              <div className="font-medium">{Math.round(progress)}%</div>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-2">
            {isLoading && onPause && (
              <Button variant="outline" onClick={onPause} size="sm">
                Pause
              </Button>
            )}
            
            {isPaused && onResume && (
              <Button variant="outline" onClick={onResume} size="sm">
                Resume
              </Button>
            )}
            
            {(isComplete || error) && onReset && (
              <Button variant="outline" onClick={onReset} size="sm">
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
