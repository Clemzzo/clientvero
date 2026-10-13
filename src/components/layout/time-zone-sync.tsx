"use client";

import { useEffect } from "react";

import { saveTimeZoneAction } from "@/server/actions/account";

export function TimeZoneSync({ saved }: { saved: string | null }) {
  useEffect(() => {
    const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (browserTimeZone && browserTimeZone !== saved) {
      void saveTimeZoneAction(browserTimeZone);
    }
  }, [saved]);

  return null;
}
