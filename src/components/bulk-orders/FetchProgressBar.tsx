
import { Progress } from "@/components/ui/progress";
import { BatchProcessingStats } from "./types";

interface FetchProgressBarProps {
  processing: boolean;
  stats: BatchProcessingStats | null;
}

export const FetchProgressBar = ({ processing, stats }: FetchProgressBarProps) => {
  if (!processing || !stats) return null;
  
  const { completedBatches, totalBatches } = stats;
  const progress = Math.round((completedBatches / totalBatches) * 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Processing orders...</span>
        <span>
          {completedBatches}/{totalBatches} batches ({progress}%)
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};
