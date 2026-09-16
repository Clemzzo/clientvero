import Image from "next/image";
import Link from "next/link";

import logo from "@/assets/images/clientvero-logo.png";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string | null;
}) {
  
  const image = (
    <Image
      src={logo}
      alt="ClientVero"
      loading="eager"
      className={cn("h-8 w-auto", className)}
      sizes="120px"
    />
  );

  if (!href) return image;

  return (
    <Link href={href} className="inline-flex items-center rounded-md" aria-label="ClientVero home">
      {image}
    </Link>
  );
}
