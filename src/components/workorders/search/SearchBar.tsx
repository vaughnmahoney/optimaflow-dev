
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const SearchBar = ({ onSearch }: { onSearch: (value: string) => void }) => {
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchValue.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-optimoroute', {
        body: { searchQuery: searchValue.trim() }
      });

      if (error) throw error;

      if (data.success && data.workOrderId) {
        toast.success('Work order found');
        navigate(`/work-orders/${data.workOrderId}`);
      } else {
        toast.error(data.error || 'Failed to find work order');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search for work order');
    } finally {
      setIsLoading(false);
      onSearch(searchValue);
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
        placeholder="Search work orders..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyPress={handleKeyPress}
        className="min-w-[200px]"
      />
      <Button onClick={handleSearch} disabled={isLoading}>
        {isLoading ? "Searching..." : "Search"}
      </Button>
    </div>
  );
};
