
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

export function SidebarProfile() {
  return (
    <div className="p-4 flex items-center gap-4">
      <Avatar className="h-10 w-10 border-2 border-purple-200">
        <AvatarImage src="/placeholder.svg" />
        <AvatarFallback>HF</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sm font-medium hover:bg-purple-50 hover:text-purple-900"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>
    </div>
  );
}

