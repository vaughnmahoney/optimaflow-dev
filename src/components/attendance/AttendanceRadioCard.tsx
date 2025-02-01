import { RadioGroup } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { type AttendanceRecord, type Technician } from "@/types/attendance";
import { cn } from "@/lib/utils";

interface AttendanceRadioCardProps {
  technician: Technician;
  currentStatus: AttendanceRecord["status"] | null;
  onStatusChange: (status: AttendanceRecord["status"]) => void;
  isSubmitting: boolean;
}

export const AttendanceRadioCard = ({
  technician,
  currentStatus,
  onStatusChange,
  isSubmitting,
}: AttendanceRadioCardProps) => {
  const statusOptions: { value: AttendanceRecord["status"]; label: string; className: string }[] = [
    { value: "present", label: "Present", className: "text-green-700 border-green-200" },
    { value: "absent", label: "Absent", className: "text-red-700 border-red-200" },
    { value: "excused", label: "Excused", className: "text-yellow-700 border-yellow-200" },
  ];

  return (
    <div className="p-4 rounded-lg border bg-white shadow-sm animate-fade-in">
      <div className="space-y-4">
        <div>
          <h4 className="font-medium">{technician.name}</h4>
          <p className="text-sm text-gray-500">{technician.email}</p>
        </div>
        
        <RadioGroup
          value={currentStatus || undefined}
          onValueChange={(value) => onStatusChange(value as AttendanceRecord["status"])}
          className="flex gap-4"
          disabled={isSubmitting}
        >
          {statusOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroup.Root
                value={option.value}
                id={`${technician.id}-${option.value}`}
                className={cn(
                  "peer h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  currentStatus === option.value && option.className
                )}
              />
              <Label
                htmlFor={`${technician.id}-${option.value}`}
                className={cn(
                  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                  currentStatus === option.value && option.className
                )}
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};