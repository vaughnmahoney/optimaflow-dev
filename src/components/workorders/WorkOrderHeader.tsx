
import { Header } from "@/components/Header";
import { useIsMobile } from "@/hooks/use-mobile";

interface WorkOrderHeaderProps {
  onOptimoRouteSearch?: (value: string) => void;
}

export const WorkOrderHeader = ({ 
  onOptimoRouteSearch 
}: WorkOrderHeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <Header title="Work Orders" />
  );
};
