
import { Progress } from "@/components/ui/progress";
import { BulkOrdersResponse } from "./types";

interface FetchProgressBarProps {
  response: BulkOrdersResponse | null;
  isLoading: boolean;
  shouldContinueFetching: boolean;
}

export const FetchProgressBar = ({ 
  response, 
  isLoading, 
  shouldContinueFetching 
}: FetchProgressBarProps) => {
  if (!response?.paginationProgress || (!isLoading && !shouldContinueFetching)) {
    return null;
  }

  return (
    <div className="my-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span>
          Fetching page {response.paginationProgress.currentPage}
          {response.paginationProgress.totalPages ? 
            ` of ${response.paginationProgress.totalPages}` : 
            ''}...
        </span>
        <span>
          {response.paginationProgress.totalOrdersRetrieved} orders retrieved so far
        </span>
      </div>
      <Progress 
        value={response.paginationProgress.totalPages 
          ? (response.paginationProgress.currentPage / response.paginationProgress.totalPages) * 100 
          : undefined} 
      />
    </div>
  );
};
