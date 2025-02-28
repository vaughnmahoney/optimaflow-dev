
import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/Header";

interface LayoutProps {
  children: ReactNode;
  header?: ReactNode;
  title?: string;
}

const LayoutContent = ({ children, header, title }: LayoutProps) => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  return (
    <div className="flex min-h-screen w-full">
      {/* Fixed header with highest z-index */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background h-[var(--header-height)]">
        {header || <Header title={title} />}
      </header>
      
      {/* Main container with sidebar and content */}
      <div className="flex w-full pt-[var(--header-height)]">
        {/* Sidebar component */}
        <AppSidebar />
        
        {/* Main content area - will shift based on sidebar state */}
        <main 
          className="flex-1 transition-all duration-300 ease-in-out"
          style={{
            marginLeft: isCollapsed 
              ? 'var(--sidebar-width-collapsed)' 
              : 'var(--sidebar-width)'
          }}
        >
          <div className="container mx-auto p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export const Layout = (props: LayoutProps) => {
  return (
    <SidebarProvider>
      <LayoutContent {...props} />
    </SidebarProvider>
  );
};
