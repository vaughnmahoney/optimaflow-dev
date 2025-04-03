
import { Header } from "@/components/Header";
import { useIsMobile } from "@/hooks/use-mobile";

interface WorkOrderHeaderProps {}

export const WorkOrderHeader = ({}: WorkOrderHeaderProps) => {
  const isMobile = useIsMobile();

  // Use a simpler header for all screen sizes
  return (
    <Header />
  );
};
