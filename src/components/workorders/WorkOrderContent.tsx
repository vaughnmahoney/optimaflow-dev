
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrderList } from "./WorkOrderList";

export const WorkOrderContent = () => {
  const { data: workOrders, isLoading, error } = useQuery({
    queryKey: ["workOrders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select(`
          *,
          customer:customers(name),
          technician:technicians(name),
          service_type:service_types(name)
        `)
        .order("service_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (error) {
    console.error("Error loading work orders:", error);
    return <div>Error loading work orders. Please try again.</div>;
  }

  return (
    <WorkOrderList 
      workOrders={workOrders || []} 
      isLoading={isLoading} 
    />
  );
};
