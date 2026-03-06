"use client";

import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const pageTitles: Record<string, string> = {
  "/dashboard": "Home",
  "/dashboard/jobs": "Jobs",
  "/dashboard/candidates": "Candidates",
  "/dashboard/schedules": "Schedules / Interview",
  "/dashboard/settings": "Settings",
};

export function DashboardHeader() {
  const pathname = usePathname();

  // Find the best matching title
  const title =
    pageTitles[pathname] ??
    Object.entries(pageTitles)
      .filter(([key]) => pathname.startsWith(key) && key !== "/dashboard")
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ??
    "Dashboard";

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      {/* Left: sidebar toggle + page title */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <h1 className="text-sm font-semibold text-foreground">{title}</h1>
      </div>

      {/* Right: Clerk UserButton (profile avatar with dropdown) */}
      <div className="ml-auto flex items-center gap-3">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-8",
            },
          }}
          afterSignOutUrl="/"
        />
      </div>
    </header>
  );
}
