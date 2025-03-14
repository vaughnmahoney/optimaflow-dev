import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MaterialRoute, MaterialRouteItem } from "@/types/materials";
import { useToast } from "@/components/ui/use-toast";

export function useMaterialRoutes() {
  const [isLoading, setIsLoading] = useState(false);
  const [routes, setRoutes] = useState<MaterialRoute[]>([]);
  const { toast } = useToast();

  // Fetch routes from the database
  const { data: dbRoutes, isLoading: isLoadingRoutes } = useQuery({
    queryKey: ["material-routes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("material_routes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching material routes:", error);
        toast({
          title: "Error fetching routes",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data as MaterialRoute[];
    },
  });

  // Update routes when data is loaded
  useEffect(() => {
    if (dbRoutes) {
      setRoutes(dbRoutes);
    }
  }, [dbRoutes]);

  // Function to add a new route
  const addRoute = async (route: Omit<MaterialRoute, "id">) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("material_routes")
        .insert(route)
        .select()
        .single();

      if (error) throw error;

      setRoutes((prev) => [data as MaterialRoute, ...prev]);
      toast({
        title: "Route added",
        description: "The route has been added successfully.",
      });
      return data;
    } catch (error: any) {
      console.error("Error adding route:", error);
      toast({
        title: "Error adding route",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add route items
  const addRouteItems = async (items: Omit<MaterialRouteItem, "id">[]) => {
    if (!items.length) return [];

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("material_route_items")
        .insert(items)
        .select();

      if (error) throw error;

      toast({
        title: "Route items added",
        description: `${items.length} items have been added successfully.`,
      });
      return data;
    } catch (error: any) {
      console.error("Error adding route items:", error);
      toast({
        title: "Error adding route items",
        description: error.message,
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Function to process routes in batch
  const processRoutesBatch = async (routes: Omit<MaterialRoute, "id">[], items: Omit<MaterialRouteItem, "id">[]) => {
    setIsLoading(true);
    const processStats = {
      totalRoutes: routes.length,
      successfulRoutes: 0,
      failedRoutes: 0,
      totalItems: items.length,
      successfulItems: 0,
      failedItems: 0,
      failedBatches: 0,
    };

    try {
      // First add all routes
      const { data: routesData, error: routesError } = await supabase
        .from("material_routes")
        .insert(routes)
        .select();

      if (routesError) {
        processStats.failedRoutes = routes.length;
        processStats.failedBatches++;
        throw routesError;
      }

      processStats.successfulRoutes = routesData.length;

      // Map items to the newly created routes
      const routeMap = new Map(routesData.map((r: any) => [r.external_id, r.id]));
      const mappedItems = items.map((item) => ({
        ...item,
        route_id: routeMap.get(item.route_external_id),
      }));

      // Then add all items
      const { data: itemsData, error: itemsError } = await supabase
        .from("material_route_items")
        .insert(mappedItems)
        .select();

      if (itemsError) {
        processStats.failedItems = items.length;
        processStats.failedBatches++;
        throw itemsError;
      }

      processStats.successfulItems = itemsData.length;

      toast({
        title: "Import successful",
        description: `Imported ${processStats.successfulRoutes} routes with ${processStats.successfulItems} items.`,
      });

      // Refresh the routes list
      const { data: refreshedRoutes } = await supabase
        .from("material_routes")
        .select("*")
        .order("created_at", { ascending: false });

      if (refreshedRoutes) {
        setRoutes(refreshedRoutes as MaterialRoute[]);
      }

      return { success: true, stats: processStats };
    } catch (error: any) {
      console.error("Error processing routes batch:", error);
      toast({
        title: "Error importing data",
        description: `Failed to import some data. ${processStats.failedBatches} operations failed.`,
        variant: "destructive",
      });
      return { success: false, stats: processStats, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    routes,
    isLoading: isLoading || isLoadingRoutes,
    addRoute,
    addRouteItems,
    processRoutesBatch,
  };
}
