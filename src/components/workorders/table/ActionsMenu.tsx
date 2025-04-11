
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Eye, Image, MoreHorizontal, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

interface ActionsMenuProps {
  workOrderId: string;
  orderNo: string;
  onDelete?: (id: string) => void;
  onImageView?: (id: string) => void;
}

export const ActionsMenu = ({ 
  workOrderId, 
  orderNo,
  onDelete, 
  onImageView 
}: ActionsMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to={`/order/${orderNo}`} className="flex items-center w-full cursor-pointer">
            <Eye className="mr-2 h-4 w-4" />
            <span>View Details</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onImageView && onImageView(workOrderId)}>
          <Image className="mr-2 h-4 w-4" />
          <span>View Images</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => onDelete && onDelete(workOrderId)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
