
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const OptimoRouteSearchBar = ({ onSearch }: { onSearch: (value: string) => void }) => {
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSearch = async () => {
    if (!searchValue.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-optimoroute', {
        body: { searchQuery: searchValue.trim() }
      });

      if (error) throw error;

      if (data.success && data.workOrderId) {
        toast.success('OptimoRoute order found');
        onSearch(searchValue);
        // Immediately refetch the work orders list
        await queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      } else {
        toast.error(data.error || 'Failed to find OptimoRoute order');
      }
    } catch (error) {
      console.error('OptimoRoute search error:', error);
      toast.error('Failed to search OptimoRoute');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        type="text"
        placeholder="Search OptimoRoute orders..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyPress={handleKeyPress}
        className="min-w-[200px]"
      />
      <Button onClick={handleSearch} disabled={isLoading}>
        {isLoading ? "Searching..." : "Search OptimoRoute"}
      </Button>
    </div>
  );
};
