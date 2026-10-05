import Image from "next/image";

import logoMark from "@/assets/images/clientverologo.png";
import { cn } from "@/lib/utils";

export function PortalFooter({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-center justify-center gap-1.5 py-8 text-[12.5px] text-ink-500", className)}>
      Powered by
      <Image src={logoMark} alt="" sizes="20px" className="size-5 shrink-0" />
      <span className="font-semibold text-ink-700">ClientVero</span>
    </p>
  );
}
