
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
      <div className="flex min-h-screen w-full">
        {/* Fixed header with highest z-index */}
        {header && (
          <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background h-[var(--header-height)]">
            {header}
          </header>
        )}
        
        {/* Main container with sidebar and content */}
        <div className="flex w-full pt-[var(--header-height)]">
          {/* Sidebar component */}
          <AppSidebar />
          
          {/* Main content area */}
          <main className="flex-1 transition-all duration-300 ease-in-out ml-[var(--sidebar-width)] md:ml-[var(--sidebar-width-mobile)]">
            <div className="container mx-auto p-4 md:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
