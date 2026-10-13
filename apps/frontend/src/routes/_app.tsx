import { useEffect, useRef, useState } from "react";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const DESKTOP_QUERY = "(min-width: 1280px)";

/**
 * Collapse the app sidebar to its icon rail below 1280px, per the degradation
 * ladder, while still letting the recruiter override it manually.
 */
function useResponsiveSidebar() {
  const [open, setOpen] = useState(true);
  const lastDesktop = useRef<boolean | null>(null);

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY);
    const sync = (isDesktop: boolean) => {
      if (lastDesktop.current === isDesktop) {
        return;
      }
      lastDesktop.current = isDesktop;
      setOpen(isDesktop);
    };
    sync(mql.matches);
    const onChange = (event: MediaQueryListEvent) => sync(event.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return { open, setOpen };
}

function AppLayout() {
  const { open, setOpen } = useResponsiveSidebar();

  return (
    <TooltipProvider delayDuration={200}>
      <SidebarProvider open={open} onOpenChange={setOpen}>
        <AppSidebar />
        <SidebarInset className="flex h-svh min-w-0 flex-col overflow-hidden">
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
