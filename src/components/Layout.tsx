
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
      <div className="flex flex-col min-h-screen w-full">
        {/* Fixed header - positioned above everything */}
        {header && (
          <div className="fixed top-0 left-0 right-0 z-50 page-header">
            {header}
          </div>
        )}
        <div className="flex flex-1 pt-[var(--header-height)]">
          {/* AppSidebar will handle its own positioning */}
          <AppSidebar />
          {/* Main content - scrollable */}
          <main className="flex-1 ml-[var(--sidebar-width)]">
            <div className="container mx-auto px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
