import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";

export interface Crumb {
  label: string;
  to?: string;
  params?: Record<string, string>;
}

interface TitleProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

/** Full-width breadcrumb bar; its height matches the app sidebar header. */
export function PageTopBar({ breadcrumbs }: { breadcrumbs?: Crumb[] }) {
  return (
    <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border/70 px-4 sm:px-6">
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <Breadcrumb className="min-w-0">
          <BreadcrumbList className="flex-nowrap">
            {breadcrumbs.map((crumb, index) => {
              const last = index === breadcrumbs.length - 1;
              return (
                <span key={`${crumb.label}-${index}`} className="contents">
                  <BreadcrumbItem className="min-w-0">
                    {last || !crumb.to ? (
                      <BreadcrumbPage className="truncate">{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={crumb.to} params={crumb.params} className="truncate">
                          {crumb.label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!last ? <BreadcrumbSeparator /> : null}
                </span>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      ) : null}
    </div>
  );
}

export function PageTitle({ title, description, actions }: TitleProps) {
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-border/70 px-4 py-4 sm:px-6">
      <div className="flex min-w-0 grow basis-72 flex-col gap-0.5">
        <h1 className="truncate text-lg font-semibold tracking-[-0.015em]">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function PageHeader({ breadcrumbs, ...title }: TitleProps & { breadcrumbs?: Crumb[] }) {
  return (
    <header className="shrink-0 bg-background">
      <PageTopBar breadcrumbs={breadcrumbs} />
      <PageTitle {...title} />
    </header>
  );
}

export function PageScroll({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("min-h-0 flex-1 overflow-y-auto", className)}>{children}</div>;
}

export function PageBody({
  width = "fluid",
  className,
  children,
}: {
  width?: "fluid" | "read";
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 px-4 py-6 sm:px-6",
        width === "read" && "mx-auto w-full max-w-3xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
