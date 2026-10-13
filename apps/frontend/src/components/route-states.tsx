import { Link, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { Alert02Icon, DashboardSquare01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";
import { PageBody, PageScroll, PageTopBar } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Router-level fallbacks. These render where a route's component would, inside
 * the app shell's outlet — the shell itself is never redrawn here.
 */
export function RoutePending() {
  return (
    <>
      <PageTopBar />
      <PageScroll>
        <PageBody>
          <Skeleton className="h-8 w-56" />
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </PageBody>
      </PageScroll>
    </>
  );
}

function StatePanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Empty className="max-w-md border border-border/70 bg-card py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon icon={Alert02Icon} size={20} />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>{children}</EmptyContent>
      </Empty>
    </div>
  );
}

export function RouteError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  const message = error instanceof Error ? error.message : "Something went wrong.";

  return (
    <StatePanel title="Something went wrong" description={message}>
      <Button
        size="sm"
        onClick={() => {
          reset();
          void router.invalidate();
        }}
      >
        Try again
      </Button>
    </StatePanel>
  );
}

export function RouteNotFound() {
  return (
    <StatePanel
      title="Page not found"
      description="That page does not exist, or it may have been moved."
    >
      <Button asChild size="sm" variant="outline">
        <Link to="/">
          <Icon icon={DashboardSquare01Icon} size={16} />
          Back to notes
        </Link>
      </Button>
    </StatePanel>
  );
}
