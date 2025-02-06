
import { CheckCircle, CircleX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGroupReview } from "@/hooks/useGroupReview";
import { Progress } from "@/components/ui/progress";

interface GroupReviewStatusProps {
  groupId: string;
  completedCount: number;
  totalCount: number;
  className?: string;
}

export const GroupReviewStatus = ({
  groupId,
  completedCount,
  totalCount,
  className,
}: GroupReviewStatusProps) => {
  const {
    reviewStatus,
    isLoading,
    isUpdating,
    updateSubmissionStatus,
  } = useGroupReview(groupId);

  const isComplete = completedCount === totalCount;
  const progressPercentage = totalCount > 0 
    ? Math.round((completedCount / totalCount) * 100) 
    : 0;

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin" />;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto hover:bg-transparent"
              onClick={() => updateSubmissionStatus.mutate(!reviewStatus?.is_submitted)}
              disabled={isUpdating}
            >
              <CheckCircle 
                className={`h-4 w-4 ${reviewStatus?.is_submitted ? 'text-green-500' : 'text-gray-400'}`}
              />
            </Button>
          ) : (
            <CircleX className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm text-gray-600">
            {completedCount} of {totalCount} marked
          </span>
        </div>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
};
