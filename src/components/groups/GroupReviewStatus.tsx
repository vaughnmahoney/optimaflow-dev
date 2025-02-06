
import { Check } from "lucide-react";
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
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-end">
        {isComplete && (
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto hover:bg-transparent"
            onClick={() => updateSubmissionStatus.mutate(!reviewStatus?.is_submitted)}
            disabled={isUpdating}
          >
            <Check 
              className={`h-5 w-5 ${reviewStatus?.is_submitted ? 'text-green-500' : 'text-gray-400'}`}
            />
          </Button>
        )}
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
};
