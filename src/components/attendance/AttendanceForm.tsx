
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAttendance } from "@/hooks/useAttendance";
import { useAttendanceState } from "@/hooks/useAttendanceState";
import { AttendanceRadioCard } from "./AttendanceRadioCard";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PencilIcon, CheckIcon, XIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export const AttendanceForm = () => {
  const {
    technicians,
    isLoadingTechnicians,
  } = useAttendance();

  const { toast } = useToast();
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [todayRecords, setTodayRecords] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    attendanceStates,
    updateStatus,
    initializeStates,
    submitDailyAttendance,
    isSubmitting,
  } = useAttendanceState(technicians || []);

  useEffect(() => {
    if (technicians) {
      checkTodaySubmission();
    }
  }, [technicians]);

  const checkTodaySubmission = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data: existingRecords } = await supabase
      .from("attendance_records")
      .select("*")
      .eq("date", today);

    setHasSubmittedToday(existingRecords && existingRecords.length > 0);
    if (existingRecords && existingRecords.length > 0) {
      setTodayRecords(existingRecords);
      // Initialize states with existing records
      const states = existingRecords.map((record: any) => ({
        technicianId: record.technician_id,
        status: record.status,
      }));
      initializeStates(states);
    } else {
      initializeStates();
    }
  };

  const handleSubmit = async () => {
    // Check if all technicians have a status set
    const unsetTechnicians = technicians?.filter(
      tech => !attendanceStates.find(state => state.technicianId === tech.id)?.status
    );

    if (unsetTechnicians?.length) {
      toast({
        title: "Missing Attendance",
        description: "Please mark attendance for all technicians before submitting.",
        variant: "destructive",
      });
      return;
    }

    await submitDailyAttendance();
    await checkTodaySubmission();
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    checkTodaySubmission(); // Reset to original values
  };

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
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold">
                Attendance for {format(new Date(), "EEEE, MMMM d, yyyy")}
              </h3>
              <p className="text-sm text-gray-500">
                {hasSubmittedToday && !isEditing
                  ? "Today's attendance has been submitted. Click edit to make changes."
                  : isEditing
                  ? "Edit mode: Make your changes and click save to update the attendance records."
                  : "Mark attendance for your team using the radio buttons below"}
              </p>
            </div>
            {hasSubmittedToday && !isEditing && (
              <Button
                variant="outline"
                onClick={handleEdit}
                className="gap-2"
              >
                <PencilIcon className="h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
          
          <div className="relative mb-6">
            <Input
              type="text"
              placeholder="Search technicians by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <SearchIcon className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <div className="space-y-4">
          {filteredTechnicians.map((tech) => {
            const state = attendanceStates.find(
              (state) => state.technicianId === tech.id
            );

            return (
              <AttendanceRadioCard
                key={tech.id}
                technician={tech}
                currentStatus={state?.status || null}
                onStatusChange={(status) => updateStatus(tech.id, status)}
                isSubmitting={isSubmitting}
                isDisabled={hasSubmittedToday && !isEditing}
              />
            );
          })}
          {filteredTechnicians.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No technicians found matching your search
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end gap-4">
          {isEditing && (
            <Button 
              variant="outline"
              onClick={handleCancelEdit}
              disabled={isSubmitting}
              className="gap-2"
            >
              <XIcon className="h-4 w-4" />
              Cancel
            </Button>
          )}
          <Button 
            onClick={handleSubmit}
            disabled={(!isEditing && hasSubmittedToday) || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              "Submitting..."
            ) : isEditing ? (
              <>
                <CheckIcon className="h-4 w-4" />
                Save Changes
              </>
            ) : hasSubmittedToday ? (
              "Already Submitted"
            ) : (
              "Submit Daily Attendance"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

