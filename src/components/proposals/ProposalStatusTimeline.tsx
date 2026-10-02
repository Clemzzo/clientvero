import { Card, CardHeader } from "@/components/ui/card";
import type { Proposal } from "@/db/schema";
import { cn } from "@/lib/utils";

type ProposalStatusTimelineProps = {
  proposal: Pick<Proposal, "status" | "createdAt" | "sentAt" | "viewedAt" | "acceptedAt" | "declinedAt">;
  signerName: string | null;
};

type Step = {
  label: string;
  at: Date | null;
  detail?: string;
  tone?: "success" | "danger";
};

const dateTimeFormat = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

function steps({ proposal, signerName }: ProposalStatusTimelineProps): Step[] {
  const response: Step = proposal.declinedAt
    ? { label: "Declined", at: proposal.declinedAt, tone: "danger" }
    : {
        label: "Accepted",
        at: proposal.acceptedAt,
        detail: signerName ? `Signed by ${signerName}` : undefined,
        tone: "success",
      };

  return [
    { label: "Created", at: proposal.createdAt },
    { label: proposal.status === "WITHDRAWN" ? "Withdrawn" : "Sent", at: proposal.status === "WITHDRAWN" ? null : proposal.sentAt },
    { label: "Viewed", at: proposal.viewedAt },
    response,
  ];
}

export function ProposalStatusTimeline(props: ProposalStatusTimelineProps) {
  const items = steps(props);

  return (
    <Card>
      <CardHeader title="Progress" />
      <ol className="px-5 pb-5 pt-4 sm:px-6">
        {items.map((step, index) => {
          const done = step.at !== null;
          const isLast = index === items.length - 1;

          return (
            <li key={step.label} className="relative flex gap-3 pb-5 last:pb-0">
              {!isLast && (
                <span
                  aria-hidden
                  className={cn("absolute left-[7px] top-5 h-[calc(100%-12px)] w-0.5", done ? "bg-mint-300" : "bg-ink-200")}
                />
              )}
              <span
                aria-hidden
                className={cn(
                  "relative mt-1 size-4 shrink-0 rounded-full border-2",
                  !done && "border-ink-200 bg-white",
                  done && step.tone === "danger" && "border-destructive bg-destructive",
                  done && step.tone !== "danger" && "border-mint-600 bg-mint-600",
                )}
              />
              <div className="min-w-0">
                <p className={cn("text-[14px] font-semibold", done ? "text-ink-900" : "text-ink-500")}>
                  {step.label}
                  <span className="sr-only">{done ? " (done)" : " (not yet)"}</span>
                </p>
                {step.at && (
                  <time dateTime={step.at.toISOString()} className="block text-[13px] text-ink-500">
                    {dateTimeFormat.format(step.at)}
                  </time>
                )}
                {done && step.detail && <p className="text-[13px] font-medium text-mint-700">{step.detail}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
