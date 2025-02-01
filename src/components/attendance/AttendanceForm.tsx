import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAttendance } from "@/hooks/useAttendance";
import { useAttendanceState } from "@/hooks/useAttendanceState";
import { AttendanceRadioCard } from "./AttendanceRadioCard";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export const AttendanceForm = () => {
  const {
    technicians,
    isLoadingTechnicians,
  } = useAttendance();

  const { toast } = useToast();

  const {
    attendanceStates,
    updateStatus,
    initializeStates,
    submitDailyAttendance,
    isSubmitting,
  } = useAttendanceState(technicians || []);

  useEffect(() => {
    if (technicians) {
      initializeStates();
    }
  }, [technicians]);

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
    toast({
      title: "Success",
      description: "Daily attendance has been submitted successfully.",
    });
  };

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
          <h3 className="text-lg font-semibold">
            Attendance for {format(new Date(), "EEEE, MMMM d, yyyy")}
          </h3>
          <p className="text-sm text-gray-500">
            Mark attendance for your team using the radio buttons below
          </p>
        </div>

        <div className="space-y-4">
          {technicians.map((tech) => {
            const state = attendanceStates.find(
              (state) => state.technicianId === tech.id
            );

            return (
              <AttendanceRadioCard
                key={tech.id}
                technician={tech}
                currentStatus={state?.status || null}
                onStatusChange={(status) => updateStatus(tech.id, status)}
                isSubmitting={state?.isSubmitting || false}
              />
            );
          })}
        </div>

        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "Submitting..." : "Submit Daily Attendance"}
          </Button>
        </div>
      </div>
    </div>
  );
};