
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FetchButtonProps {
  onFetch: () => void;
  isDisabled: boolean;
  isLoading: boolean;
  activeTab?: string;
}

export const FetchButton = ({
  onFetch,
  isDisabled,
  isLoading,
  activeTab = "with-completion"
}: FetchButtonProps) => {
  const buttonText = isLoading ? "Loading..." : "Fetch Orders";
  
  return (
    <Button
      onClick={onFetch}
      disabled={isDisabled || isLoading}
      className="min-w-[120px]"
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {buttonText}
    </Button>
  );
};
