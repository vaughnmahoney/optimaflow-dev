import { format } from "date-fns";

export const getStatusBorderColor = (status: string) => {
  switch (status) {
    case "approved":
      return "border-emerald-500";
    case "flagged":
    case "flagged_followup":
      return "border-rose-500";
    case "resolved":
      return "border-indigo-500";
    case "pending_review":
    default:
      return "border-amber-500";
  }
};

export const formatDate = (dateStr?: string, formatString: string = "EEEE, MMMM d, yyyy") => {
  if (!dateStr) return 'N/A';
  try {
    return format(new Date(dateStr), formatString);
  } catch {
    return 'Invalid Date';
  }
};

export const calculateDuration = (startTime?: string, endTime?: string) => {
  if (!startTime || !endTime) return "N/A";
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffInMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `${hours}h ${minutes}m`;
  } catch {
    return "N/A";
  }
};
