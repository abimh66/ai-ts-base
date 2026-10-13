import { cn } from "cn";
import { Icon } from "@/components/icon";
import { Badge } from "@/components/ui/badge";
import type { NoteStatus } from "@/features/note";
import { Loading03Icon } from "@hugeicons/core-free-icons";

const STATUS_STYLE: Record<NoteStatus, string> = {
  Draft: "bg-neutral-soft text-foreground border-transparent",
  Enriching: "bg-brand/10 text-brand border-brand/20",
  Enriched: "bg-success-soft text-success border-transparent",
};

const STATUS_LABEL: Record<NoteStatus, string> = {
  Draft: "Draft",
  Enriching: "Enriching",
  Enriched: "Enriched",
};

/** The one place note status is rendered, so the three states stay consistent. */
export function NoteStatusBadge({ status }: { status: NoteStatus }) {
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", STATUS_STYLE[status])}>
      {status === "Enriching" ? (
        <Icon icon={Loading03Icon} size={12} className="animate-spin" />
      ) : null}
      {STATUS_LABEL[status]}
    </Badge>
  );
}
