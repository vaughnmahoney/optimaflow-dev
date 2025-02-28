
import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface LayoutProps {
  children: ReactNode;
  header?: ReactNode;
}

export const Layout = ({ children, header }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-gray-50/80 backdrop-blur-sm">
        {/* Fixed header at the top */}
        {header && (
          <div className="w-full z-40 fixed top-0 left-0 right-0 page-header">
            {header}
          </div>
        )}
        <div className="flex flex-1 w-full main-content">
          <AppSidebar />
          <main className="flex-1 transition-all duration-300">
            <div className="container mx-auto px-6 py-8">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
