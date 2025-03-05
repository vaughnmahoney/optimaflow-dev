
import { Progress } from "@/components/ui/progress";

interface FetchProgressBarProps {
  isActive: boolean;
  currentCount: number;
}

export const FetchProgressBar = ({ 
  isActive,
  currentCount
}: FetchProgressBarProps) => {
  if (!isActive) {
    return null;
  }

  return (
    <div className="my-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span>
          Fetching orders (pagination in progress)...
        </span>
        <span>
          {currentCount} orders retrieved so far
        </span>
      </div>
      <Progress value={undefined} />
    </div>
  );
};
