
import { Header } from "@/components/Header";
import { useIsMobile } from "@/hooks/use-mobile";

interface WorkOrderHeaderProps {
  title?: string;
}

export const WorkOrderHeader = ({ title = "Work Orders" }: WorkOrderHeaderProps) => {
  return <Header title={title} />;
};
