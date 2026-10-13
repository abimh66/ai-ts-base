import { Link, useLocation } from "@tanstack/react-router";
import { Note01Icon, PlusSignIcon, Settings01Icon } from "@hugeicons/core-free-icons";
import { cn } from "cn";
import { APP_NAME, BrandMark } from "@/components/brand";
import { Icon, type IconProps } from "@/components/icon";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useNotes, type NoteStatus } from "@/features/note";

interface NavItem {
  label: string;
  icon: IconProps["icon"];
  to?: string;
  soon?: boolean;
}

const PRIMARY: NavItem[] = [
  { label: "Notes", icon: Note01Icon, to: "/notes" },
  { label: "Settings", icon: Settings01Icon, soon: true },
];

const STATUS_DOT: Record<NoteStatus, string> = {
  Draft: "bg-neutral",
  Enriching: "bg-brand",
  Enriched: "bg-success",
};

function NavRow({ item, path }: { item: NavItem; path: string }) {
  const active = path.startsWith(item.to ?? "\u0000");
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild={!item.soon}
        isActive={active && !item.soon}
        tooltip={item.label}
        disabled={item.soon}
      >
        {item.soon ? (
          <>
            <Icon icon={item.icon} size={16} />
            <span>{item.label}</span>
          </>
        ) : (
          <Link to={item.to!}>
            <Icon icon={item.icon} size={16} />
            <span>{item.label}</span>
          </Link>
        )}
      </SidebarMenuButton>
      {item.soon ? (
        <SidebarMenuBadge className="text-[10px] font-normal text-muted-foreground/70">
          soon
        </SidebarMenuBadge>
      ) : null}
    </SidebarMenuItem>
  );
}

function NoteRow({
  note,
  path,
}: {
  note: { id: string; title: string; status: NoteStatus };
  path: string;
}) {
  const active = path.startsWith(`/notes/${note.id}`);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={note.title}>
        <Link to="/notes/$noteId" params={{ noteId: note.id }}>
          <span className={cn("ml-1 size-1.5 shrink-0 rounded-full", STATUS_DOT[note.status])} />
          <span className="truncate">{note.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const { data: notes } = useNotes();
  const { pathname } = useLocation();
  const noteList = notes ?? [];

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="h-14 justify-center border-b border-sidebar-border py-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={APP_NAME}
              className="group-data-[collapsible=icon]:justify-center"
            >
              <Link to="/">
                <BrandMark className="size-6! shrink-0" />
                <span className="truncate text-[15px] font-semibold tracking-[-0.02em]">
                  {APP_NAME}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {PRIMARY.map((item) => (
                <NavRow key={item.label} item={item} path={pathname} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Notes</SidebarGroupLabel>
          <SidebarGroupAction asChild title="New note">
            <Link to="/notes">
              <Icon icon={PlusSignIcon} size={16} />
              <span className="sr-only">New note</span>
            </Link>
          </SidebarGroupAction>
          <SidebarGroupContent>
            {noteList.length === 0 ? (
              <p className="px-2 py-1.5 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                No notes yet
              </p>
            ) : (
              <SidebarMenu>
                {noteList.map((note) => (
                  <NoteRow key={note.id} note={note} path={pathname} />
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:flex-col">
          <ThemeToggle />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
