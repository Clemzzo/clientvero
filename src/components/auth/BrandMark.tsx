import Image from "next/image";

import logoMark from "@/assets/images/clientverologo.png";

export function BrandMark() {
  return (
    <div className="inline-flex items-center gap-2.5">
      <Image src={logoMark} alt="" sizes="40px" className="size-9" loading="eager" />
      <span className="font-display text-[20px] font-bold tracking-[-0.02em] text-white">ClientVero</span>
    </div>
  );
}
