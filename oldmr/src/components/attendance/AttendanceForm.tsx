import { Skeleton } from "@/components/ui/skeleton";
import type { Technician } from "@/types/attendance";
import type { AttendanceRecord } from "@/types/attendance";
import { TechnicianSearch } from "./TechnicianSearch";
import { AttendanceFormHeader } from "./AttendanceFormHeader";
import { TechnicianList } from "./TechnicianList";
import { AttendanceFormActions } from "./AttendanceFormActions";

interface AttendanceFormProps {
  technicians: Technician[] | undefined;
  isLoadingTechnicians: boolean;
  hasSubmittedToday: boolean;
  isEditing: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  attendanceStates: Array<{ technicianId: string; status: AttendanceRecord["status"] | null }>;
  updateStatus: (technicianId: string, status: AttendanceRecord["status"]) => void;
  isSubmitting: boolean;
  onEdit: () => void;
  onSubmit: () => void;
  onCancelEdit: () => void;
}

export const AttendanceForm = ({
  technicians,
  isLoadingTechnicians,
  hasSubmittedToday,
  isEditing,
  searchQuery,
  setSearchQuery,
  attendanceStates,
  updateStatus,
  isSubmitting,
  onEdit,
  onSubmit,
  onCancelEdit,
}: AttendanceFormProps) => {
  const filteredTechnicians = technicians?.filter(tech => 
    tech.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoadingTechnicians || !technicians) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-lg border">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="mb-6">
          <AttendanceFormHeader
            hasSubmittedToday={hasSubmittedToday}
            isEditing={isEditing}
            onEdit={onEdit}
          />
          
          <TechnicianSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        <TechnicianList
          technicians={filteredTechnicians}
          attendanceStates={attendanceStates}
          updateStatus={updateStatus}
          isSubmitting={isSubmitting}
          hasSubmittedToday={hasSubmittedToday}
          isEditing={isEditing}
        />

        <AttendanceFormActions
          isEditing={isEditing}
          hasSubmittedToday={hasSubmittedToday}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onCancelEdit={onCancelEdit}
        />
      </div>
    </div>
  );
};