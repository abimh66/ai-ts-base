import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * The app has no dashboard yet, so the root sends you to the primary list.
 * Replace this when a project grows a real home screen.
 */
export const Route = createFileRoute("/_app/")({
  beforeLoad: () => {
    throw redirect({ to: "/notes" });
  },
});
