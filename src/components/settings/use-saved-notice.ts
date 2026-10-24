"use client";

import { useEffect } from "react";

import { useNotice } from "@/components/shared/notice-provider";

export function useSavedNotice(state: { saved?: boolean } | null, message: string) {
  const showNotice = useNotice();

  useEffect(() => {
    if (state?.saved) showNotice("success", message);
  }, [state, message, showNotice]);
}
