
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function SidebarLogo() {
  const { toast } = useToast();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const storedLogo = localStorage.getItem("companyLogo");
    if (storedLogo) {
      setLogoUrl(storedLogo);
    }
  }, []);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoUrl(base64String);
        localStorage.setItem("companyLogo", base64String);
        toast({
          title: "Logo updated",
          description: "Your company logo has been updated successfully.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex items-center">
      <div className="relative cursor-pointer group">
        <div className="w-10 h-10 overflow-hidden rounded-lg bg-white shadow-sm border border-sidebar-border flex items-center justify-center">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Company Logo"
              className="h-full w-full object-contain transition-opacity group-hover:opacity-80"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-sidebar-icon text-sm font-medium">
              LOGO
            </div>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Upload logo"
        />
        <span className="opacity-0 group-hover:opacity-100 absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-sidebar-text whitespace-nowrap transition-opacity">
          Click to upload
        </span>
      </div>
      <span className="ml-3 font-semibold text-sidebar-text">OptimaFlow</span>
    </div>
  );
}
