
import { 
  ApproveMenuItem, 
  FlagMenuItem, 
  PendingMenuItem,
  ResolveMenuItem,
  RejectMenuItem,
  DisabledStatusItem
} from "./StatusMenuItem";

interface StatusMenuItemsProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
  statusUser?: string;
  statusTimestamp?: string;
}

export const StatusMenuItems = ({ 
  currentStatus, 
  onStatusChange,
  statusUser,
  statusTimestamp
}: StatusMenuItemsProps) => {
  
  switch (currentStatus) {
    case "pending_review":
      return (
        <>
          <ApproveMenuItem onClick={() => onStatusChange("approved")} />
          <FlagMenuItem onClick={() => onStatusChange("flagged")} />
        </>
      );
    
    case "flagged":
    case "flagged_followup":
      return (
        <>
          <DisabledStatusItem status={currentStatus} user={statusUser} timestamp={statusTimestamp} />
          <ApproveMenuItem onClick={() => onStatusChange("approved")} />
          <ResolveMenuItem onClick={() => onStatusChange("resolved")} />
          <RejectMenuItem onClick={() => onStatusChange("rejected")} />
        </>
      );
    
    case "approved":
      return (
        <>
          <DisabledStatusItem status={currentStatus} user={statusUser} timestamp={statusTimestamp} />
          <PendingMenuItem onClick={() => onStatusChange("pending_review")} />
          <FlagMenuItem onClick={() => onStatusChange("flagged")} />
        </>
      );
    
    case "resolved":
      return (
        <>
          <DisabledStatusItem status={currentStatus} user={statusUser} timestamp={statusTimestamp} />
          <ApproveMenuItem onClick={() => onStatusChange("approved")} />
          <FlagMenuItem onClick={() => onStatusChange("flagged")} />
        </>
      );
    
    case "rejected":
      return (
        <>
          <DisabledStatusItem status={currentStatus} user={statusUser} timestamp={statusTimestamp} />
          <PendingMenuItem 
            onClick={() => onStatusChange("pending_review")} 
            label="Reopen"
          />
          <ApproveMenuItem onClick={() => onStatusChange("approved")} />
        </>
      );
    
    default:
      return (
        <>
          <ApproveMenuItem onClick={() => onStatusChange("approved")} />
          <FlagMenuItem onClick={() => onStatusChange("flagged")} />
          <PendingMenuItem onClick={() => onStatusChange("pending_review")} />
        </>
      );
  }
};

