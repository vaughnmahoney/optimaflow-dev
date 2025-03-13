
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { HardHat, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const MRHeader = () => {
  const navigate = useNavigate();
  
  return (
    <Header title="Material Requirements">
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          className="mr-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        
        <HardHat className="h-5 w-5 text-amber-500 mr-2" />
        <span className="text-sm text-muted-foreground">
          Generate material requirements for technicians
        </span>
      </div>
    </Header>
  );
};
