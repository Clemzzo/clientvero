import { WorkspaceLogo } from "@/components/shared/WorkspaceLogo";
import { cn } from "@/lib/utils";

type PortalBrandProps = {
  organizationName: string;
  logoSrc?: string | null;
  size?: "sm" | "lg";
  caption?: string;
};

export function PortalBrand({ organizationName, logoSrc = null, size = "sm", caption = "Client portal" }: PortalBrandProps) {
  return (
    <div className={cn("flex min-w-0 items-center", size === "lg" ? "flex-col gap-3 text-center" : "gap-3")}>
      <WorkspaceLogo
        name={organizationName}
        src={logoSrc}
        className={size === "lg" ? "size-14 rounded-2xl text-[24px]" : "size-9 rounded-xl"}
      />
      <div className="min-w-0">
        <p className={cn("truncate font-semibold text-ink-900", size === "lg" ? "text-[17px]" : "text-[14px]")}>
          {organizationName}
        </p>
        <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-ink-500">{caption}</p>
      </div>
    </div>
  );
}
