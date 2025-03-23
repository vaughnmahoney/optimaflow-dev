
import { useState, useEffect } from "react";
import { useUserManagement } from "@/hooks/useUserManagement";
import { UserListTable } from "@/components/users/UserListTable";
import { UserListFilters } from "@/components/users/UserListFilters";

interface UserListProps {
  refreshTrigger?: number;
}

export function UserList({ refreshTrigger = 0 }: UserListProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({
    role: undefined as "admin" | "lead" | undefined,
    isActive: undefined as boolean | undefined,
    search: "",
  });

  const { users, totalCount, isLoading, error, fetchUsers } = useUserManagement();

  useEffect(() => {
    fetchUsers(page, pageSize, filters);
  }, [page, pageSize, filters, refreshTrigger]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  return (
    <div className="space-y-4">
      <UserListFilters 
        filters={filters} 
        onFiltersChange={handleFiltersChange} 
        isLoading={isLoading}
      />
      
      <UserListTable 
        users={users}
        isLoading={isLoading}
        error={error}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onRefresh={() => fetchUsers(page, pageSize, filters)}
      />
    </div>
  );
}
