
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { type AttendanceRecord, type Technician } from "@/types/attendance";
import { cn } from "@/lib/utils";

interface AttendanceRadioCardProps {
  technician: Technician;
  currentStatus: AttendanceRecord["status"] | null;
  onStatusChange: (status: AttendanceRecord["status"]) => void;
  isSubmitting: boolean;
  isDisabled?: boolean;
}

export const AttendanceRadioCard = ({
  technician,
  currentStatus,
  onStatusChange,
  isSubmitting,
  isDisabled = false,
}: AttendanceRadioCardProps) => {
  const statusOptions: { value: AttendanceRecord["status"]; label: string; className: string }[] = [
    { value: "present", label: "Present", className: "bg-green-100 text-green-700" },
    { value: "absent", label: "Absent", className: "bg-red-100 text-red-700" },
    { value: "excused", label: "Excused", className: "bg-gray-100 text-gray-700" },
  ];

  return (
    <div className="p-6 rounded-xl border bg-white shadow-sm animate-fade-in">
      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{technician.name}</h4>
          <p className="text-sm text-gray-500">{technician.email}</p>
        </div>
        
        <RadioGroup
          value={currentStatus || undefined}
          onValueChange={(value) => onStatusChange(value as AttendanceRecord["status"])}
          className="flex gap-4"
          disabled={isSubmitting || isDisabled}
        >
          {statusOptions.map((option) => (
            <div key={option.value} className="flex items-center">
              <Label
                htmlFor={`${technician.id}-${option.value}`}
                className={cn(
                  "px-6 py-2 rounded-full cursor-pointer transition-colors",
                  currentStatus === option.value ? option.className : "bg-gray-50 text-gray-500 hover:bg-gray-100",
                  (isSubmitting || isDisabled) && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`${technician.id}-${option.value}`}
                    className="sr-only"
                  />
                  {option.label}
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};
