"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  Home,
  Briefcase,
  Users,
  CalendarCheck,
  Settings,
  Zap,
  LogOut,
  ChevronsUpDown,
  Bot,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  {
    title: "Home",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Jobs",
    href: "/dashboard/jobs",
    icon: Briefcase,
  },
  {
    title: "Candidates",
    href: "/dashboard/candidates",
    icon: Users,
  },
  {
    title: "Schedules / Interview",
    href: "/dashboard/schedules",
    icon: CalendarCheck,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

/* ── Collapse toggle button rendered inside the sidebar ── */
function SidebarCollapseButton() {
  const { state, toggleSidebar, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed";

  if (isMobile) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={toggleSidebar}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="
            absolute -right-3 top-6 z-20
            flex size-6 items-center justify-center
            rounded-full border border-sidebar-border
            bg-background text-muted-foreground shadow-sm
            transition-all duration-200
            hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
            hover:shadow-md
          "
        >
          {isCollapsed ? (
            <ChevronRight className="size-3.5" />
          ) : (
            <ChevronLeft className="size-3.5" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" align="center">
        {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      </TooltipContent>
    </Tooltip>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();

  const initials = user
    ? `${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`.toUpperCase() ||
    user.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase() ||
    "U"
    : "U";

  return (
    <Sidebar collapsible="icon">
      {/* ── Collapse toggle button ── */}
      <SidebarCollapseButton />

      {/* ── Header ── */}
      <SidebarHeader className="border-b border-sidebar-border px-2 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="pointer-events-none select-none group-data-[collapsible=icon]:!pointer-events-none group-data-[collapsible=icon]:!justify-center"
              tooltip="RecruitAI"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 text-white shrink-0">
                <Bot className="size-5" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                <span className="font-bold text-base tracking-tight">RecruitAI</span>
                <span className="text-[10px] text-muted-foreground">AI Voice Screening</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Navigation ── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider mb-1 px-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      size="lg"
                      tooltip={item.title}
                      className="gap-3 px-3"
                    >
                      <Link href={item.href}>
                        <item.icon className="size-5 shrink-0" />
                        <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter className="border-t border-sidebar-border p-2 gap-2">
        {/* Upgrade Plan Button — hidden when collapsed */}
        <Button
          size="sm"
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold gap-2 group-data-[collapsible=icon]:hidden"
        >
          <Zap className="size-4" />
          Upgrade Plan
        </Button>

        {/* Upgrade icon-only — shown when collapsed */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className="hidden w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:mx-auto"
            >
              <Zap className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Upgrade Plan</TooltipContent>
        </Tooltip>

        <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />

        {/* Profile Dropdown */}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground px-2"
                  tooltip={user?.fullName ?? user?.emailAddresses[0]?.emailAddress ?? "Profile"}
                >
                  <Avatar className="size-8 rounded-lg shrink-0">
                    <AvatarImage
                      src={user?.imageUrl}
                      alt={user?.fullName ?? "User"}
                    />
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 text-white text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none min-w-0 group-data-[collapsible=icon]:hidden">
                    <span className="font-semibold text-sm truncate">
                      {user?.fullName ?? "User"}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {user?.emailAddresses[0]?.emailAddress ?? ""}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={8}
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarImage
                        src={user?.imageUrl}
                        alt={user?.fullName ?? "User"}
                      />
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 text-white text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-semibold text-sm truncate">
                        {user?.fullName ?? "User"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {user?.emailAddresses[0]?.emailAddress ?? ""}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => openUserProfile()}
                >
                  <Settings className="size-4 mr-2" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => signOut({ redirectUrl: "/" })}
                >
                  <LogOut className="size-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* ── Rail (drag handle) ── */}
      <SidebarRail />
    </Sidebar>
  );
}
