
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FetchButtonProps {
  isLoading: boolean;
  isDisabled: boolean;
  onFetch: () => void;
  activeTab?: string;
}

export const FetchButton = ({ 
  isLoading, 
  isDisabled, 
  onFetch,
  activeTab = "with-completion"
}: FetchButtonProps) => {
  return (
    <Button 
      className="mt-4" 
      onClick={onFetch} 
      disabled={isDisabled}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {activeTab === "search-only" 
            ? "Fetching Orders (with pagination)..." 
            : "Fetching Completed Orders (with pagination)..."}
        </>
      ) : (
        activeTab === "search-only" 
          ? "Fetch All Orders" 
          : "Fetch All Completed Orders"
      )}
    </Button>
  );
};
