"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { navigation, type NavLink } from "@/components/layout/navigation";
import { cn } from "@/lib/utils";

const CLOSE_DELAY_MS = 120;

export function MarketingNav() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finePointer = useRef<MediaQueryList | null>(null);

  useEffect(() => {
    finePointer.current = window.matchMedia("(pointer: fine)");
  }, []);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenMenu(null);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  function cancelPendingClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function handlePointerEnter(label: string) {
    if (!finePointer.current?.matches) return;
    cancelPendingClose();
    setOpenMenu(label);
  }

  function handlePointerLeave() {
    if (!finePointer.current?.matches) return;
    cancelPendingClose();
    closeTimer.current = setTimeout(() => setOpenMenu(null), CLOSE_DELAY_MS);
  }

  return (
    <div ref={navRef} className="hidden items-center gap-1 lg:flex">
      {navigation.map((item) => {
        if (!item.items) {
          return (
            <Link
              key={item.label}
              href={item.href ?? "#"}
              className="rounded-lg px-3.5 py-2 text-[15px] font-medium text-ink-700 transition-colors hover:text-brand-600"
            >
              {item.label}
            </Link>
          );
        }

        const isOpen = openMenu === item.label;

        return (
          <div
            key={item.label}
            className="relative"
            onPointerEnter={() => handlePointerEnter(item.label)}
            onPointerLeave={handlePointerLeave}
          >
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={isOpen}
              onClick={() => setOpenMenu(isOpen ? null : item.label)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[15px] font-medium transition-colors duration-200",
                isOpen ? "text-brand-600" : "text-ink-700 hover:text-brand-600",
              )}
            >
              {item.label}
              <ChevronDown
                aria-hidden
                className={cn(
                  "size-4 transition-transform duration-200",
                  isOpen ? "rotate-180 text-brand-600" : "text-ink-400",
                )}
              />
            </button>

            {isOpen && (
              <div className="absolute left-1/2 top-full w-80 -translate-x-1/2 pt-3">
                <div className="menu-in rounded-2xl border border-ink-200 bg-white p-2 shadow-[0_24px_60px_-20px_rgba(7,11,24,0.22)]">
                  {item.items.map((link) => (
                    <NavPanelLink
                      key={link.label}
                      link={link}
                      onNavigate={() => setOpenMenu(null)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function NavPanelLink({ link, onNavigate }: { link: NavLink; onNavigate: () => void }) {
  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      className="group block rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-ink-50"
    >
      <span className="block text-sm font-semibold text-ink-900 transition-colors duration-200 group-hover:text-brand-700">
        {link.label}
      </span>
      {link.description && (
        <span className="mt-0.5 block text-[13px] text-ink-500">{link.description}</span>
      )}
    </Link>
  );
}
