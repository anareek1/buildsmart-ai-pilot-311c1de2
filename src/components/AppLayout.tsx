import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import AppSidebar from "./AppSidebar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

export default function AppLayout() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex items-center gap-3 px-4 h-14 border-b bg-sidebar-bg shrink-0">
          <button
            onClick={() => setOpen(true)}
            className="p-2 -ml-2 rounded-lg text-sidebar-fg hover:bg-sidebar-hover transition-colors"
          >
            <Menu size={22} />
          </button>
          <span className="font-display text-lg font-bold text-primary">BTC</span>
          <span className="font-display text-sm text-sidebar-fg tracking-wider">Engineering</span>
        </header>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="p-0 w-72 bg-sidebar-bg border-r-0">
            <VisuallyHidden.Root>
              <SheetTitle>Навигация</SheetTitle>
            </VisuallyHidden.Root>
            <AppSidebar onNavigate={() => setOpen(false)} forceMobile />
          </SheetContent>
        </Sheet>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
