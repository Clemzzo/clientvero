import { cn } from "@/lib/utils";

type PortalBrandProps = {
  organizationName: string;
  size?: "sm" | "lg";
  caption?: string;
};

export function PortalBrand({ organizationName, size = "sm", caption = "Client portal" }: PortalBrandProps) {
  return (
    <div className={cn("flex min-w-0 items-center", size === "lg" ? "flex-col gap-3 text-center" : "gap-3")}>
      <span
        aria-hidden
        className={cn(
          "grid shrink-0 place-items-center bg-brand-600 font-display font-bold text-white",
          size === "lg" ? "size-14 rounded-2xl text-[24px]" : "size-9 rounded-xl text-[15px]",
        )}
      >
        {organizationName.trim().charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0">
        <p className={cn("truncate font-semibold text-ink-900", size === "lg" ? "text-[17px]" : "text-[14px]")}>
          {organizationName}
        </p>
        <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-ink-500">{caption}</p>
      </div>
    </div>
  );
}
