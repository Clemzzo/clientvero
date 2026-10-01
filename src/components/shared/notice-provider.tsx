"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import { StatusBanner, type BannerTone } from "@/components/shared/StatusBanner";

const AUTO_HIDE_MS = 5000;

type Notice = {
  id: number;
  tone: BannerTone;
  message: string;
};

type ShowNotice = (tone: BannerTone, message: string) => void;

const NoticeContext = createContext<ShowNotice | null>(null);

export function NoticeProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<Notice | null>(null);

  const show = useCallback<ShowNotice>((tone, message) => {
    setNotice({ id: Date.now(), tone, message });
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [notice]);

  return (
    <NoticeContext.Provider value={show}>
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed right-4 top-4 z-60 w-[calc(100%-32px)] max-w-90 sm:right-6 sm:top-6"
      >
        {notice && (
          <StatusBanner
            key={notice.id}
            tone={notice.tone}
            onDismiss={() => setNotice(null)}
            className="pointer-events-auto"
          >
            {notice.message}
          </StatusBanner>
        )}
      </div>
      {children}
    </NoticeContext.Provider>
  );
}

export function useNotice(): ShowNotice {
  const show = useContext(NoticeContext);

  if (!show) {
    throw new Error("useNotice must be used inside NoticeProvider");
  }

  return show;
}
