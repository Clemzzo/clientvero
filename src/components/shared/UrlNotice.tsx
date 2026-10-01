"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useNotice } from "@/components/shared/notice-provider";
import type { NoticeKey } from "@/features/notices";

type UrlNoticeProps = {
  notice: NoticeKey | undefined;
  message: string;
};

export function UrlNotice({ notice, message }: UrlNoticeProps) {
  const show = useNotice();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!notice) return;
    show("success", message);
    router.replace(pathname, { scroll: false });
  }, [notice, message, show, router, pathname]);

  return null;
}
