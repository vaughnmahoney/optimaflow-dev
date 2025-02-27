
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

export function SidebarProfile() {
  return (
    <div className="px-4 py-3 flex items-center gap-3 group-data-[state=closed]:justify-center group-data-[state=closed]:px-0">
      <div className="flex items-center justify-center w-10 h-10">
        <Avatar className="w-10 h-10 border-2 border-purple-200">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback>HF</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 min-w-0 overflow-hidden transition-all duration-300 group-data-[state=closed]:w-0 group-data-[state=closed]:opacity-0 group-data-[state=closed]:translate-x-2">
        <Button 
          variant="ghost" 
          className="w-full h-10 justify-start text-sm font-medium hover:bg-purple-50 hover:text-purple-900"
        >
          <div className="w-10 h-10 flex items-center justify-center">
            <Edit className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <span>Edit Profile</span>
        </Button>
      </div>
    </div>
  );
}
