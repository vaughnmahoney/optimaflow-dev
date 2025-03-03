
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FetchButtonProps {
  isLoading: boolean;
  disabled: boolean;
  onClick: () => void;
  activeTab: string;
}

export const FetchButton = ({ 
  isLoading, 
  disabled, 
  onClick, 
  activeTab 
}: FetchButtonProps) => {
  return (
    <Button 
      className="mt-4" 
      onClick={onClick} 
      disabled={disabled}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {activeTab === "search-only" 
            ? "Fetching Orders..." 
            : "Fetching Completed Orders..."}
        </>
      ) : (
        activeTab === "search-only" 
          ? "Fetch Orders" 
          : "Fetch Completed Orders"
      )}
    </Button>
  );
};
