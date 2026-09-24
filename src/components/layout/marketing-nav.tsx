"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent, PointerEvent } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";

import {
  navigation,
  type NavGroup,
  type NavLink,
  type NavTone,
} from "@/components/layout/navigation";
import { cn } from "@/lib/utils";

const CLOSE_DELAY_MS = 120;

const toneClassName: Record<NavTone, string> = {
  brand: "bg-brand-50 text-brand-600",
  sky: "bg-sky-50 text-sky-600",
  violet: "bg-violet-50 text-violet-600",
  amber: "bg-amber-50 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-600",
  rose: "bg-rose-50 text-rose-600",
};

const triggerClassName =
  "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors duration-200";

export function MarketingNav() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!openMenu) return;

    function onPointerDown(event: globalThis.PointerEvent) {
      if (!navRef.current?.contains(event.target as Node)) setOpenMenu(null);
    }

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setOpenMenu(null);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenu]);

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

  function openOnHover(label: string) {
    cancelPendingClose();
    setOpenMenu(label);
  }

  function closeAfterHover() {
    cancelPendingClose();
    closeTimer.current = setTimeout(() => setOpenMenu(null), CLOSE_DELAY_MS);
  }

  function closeMenu(label: string) {
    cancelPendingClose();
    setOpenMenu((current) => (current === label ? null : current));
  }

  function toggleMenu(label: string) {
    cancelPendingClose();
    setOpenMenu((current) => (current === label ? null : label));
  }

  return (
    <nav
      ref={navRef}
      aria-label="Main"
      className="hidden items-center gap-1 lg:flex"
    >
      {navigation.map((item) =>
        item.items ? (
          <NavDropdown
            key={item.label}
            group={item}
            isOpen={openMenu === item.label}
            onToggle={() => toggleMenu(item.label)}
            onClose={() => closeMenu(item.label)}
            onHoverStart={() => openOnHover(item.label)}
            onHoverEnd={closeAfterHover}
          />
        ) : (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              triggerClassName,
              "text-ink-700 hover:text-brand-600",
            )}
          >
            {item.label}
          </Link>
        ),
      )}
    </nav>
  );
}

type NavDropdownProps = {
  group: NavGroup;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
};

function NavDropdown({
  group,
  isOpen,
  onToggle,
  onClose,
  onHoverStart,
  onHoverEnd,
}: NavDropdownProps) {
  const { label, heading, cta, items: links } = group;
  const panelId = useId();
  const twoColumn = links.length > 3;
  const triggerRef = useRef<HTMLButtonElement>(null);

  function handlePointerEnter(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") onHoverStart();
  }

  function handlePointerLeave(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") onHoverEnd();
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) onClose();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape" || !isOpen) return;
    onClose();
    triggerRef.current?.focus();
  }

  return (
    <div
      className="relative"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className={cn(
          triggerClassName,
          isOpen ? "text-brand-600" : "text-ink-700 hover:text-brand-600",
        )}
      >
        {label}
        <ChevronDown
          aria-hidden
          className={cn(
            "size-4 transition-transform duration-200",
            isOpen ? "rotate-180 text-brand-600" : "text-ink-400",
          )}
        />
      </button>

      <div
        id={panelId}
        hidden={!isOpen}
        className={cn(
          "absolute left-1/2 top-full -translate-x-1/2 pt-3",
          twoColumn ? "w-150" : "w-85",
        )}
      >
        <div className="menu-in rounded-2xl border border-ink-200 bg-white p-3 shadow-[0_24px_60px_-20px_rgba(7,11,24,0.22)]">
          <div className="mx-2 flex items-center justify-between gap-4 border-b border-ink-100 pb-3 pt-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">
              {heading}
            </p>
            {cta && (
              <Link
                href={cta.href}
                onClick={onClose}
                className="group/cta flex items-center gap-1 text-[13px] font-semibold text-brand-700 transition-colors duration-200 hover:text-brand-600"
              >
                {cta.label}
                <ChevronRight
                  aria-hidden
                  className="size-3.5 transition-transform duration-200 group-hover/cta:translate-x-0.5"
                />
              </Link>
            )}
          </div>

          <ul className={cn("mt-2 grid gap-1", twoColumn && "grid-cols-2")}>
            {links.map((link) => (
              <li key={link.label}>
                <NavPanelLink link={link} onNavigate={onClose} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function NavPanelLink({
  link,
  onNavigate,
}: {
  link: NavLink;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-ink-50"
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          toneClassName[link.tone],
        )}
      >
        <link.icon aria-hidden className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-ink-900 transition-colors duration-200 group-hover:text-brand-700">
          {link.label}
        </span>
        {link.description && (
          <span className="mt-0.5 block text-[13px] text-ink-500">
            {link.description}
          </span>
        )}
      </span>
    </Link>
  );
}
