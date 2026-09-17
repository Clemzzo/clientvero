"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent, PointerEvent } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { navigation, type NavLink } from "@/components/layout/navigation";
import { cn } from "@/lib/utils";

const CLOSE_DELAY_MS = 120;

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
    <nav ref={navRef} aria-label="Main" className="hidden items-center gap-1 lg:flex">
      {navigation.map((item) =>
        item.items ? (
          <NavDropdown
            key={item.label}
            label={item.label}
            links={item.items}
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
            className={cn(triggerClassName, "text-ink-700 hover:text-brand-600")}
          >
            {item.label}
          </Link>
        ),
      )}
    </nav>
  );
}

type NavDropdownProps = {
  label: string;
  links: NavLink[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
};

function NavDropdown({
  label,
  links,
  isOpen,
  onToggle,
  onClose,
  onHoverStart,
  onHoverEnd,
}: NavDropdownProps) {
  const panelId = useId();
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
        className="absolute left-1/2 top-full w-80 -translate-x-1/2 pt-3"
      >
        <ul className="menu-in rounded-2xl border border-ink-200 bg-white p-2 shadow-[0_24px_60px_-20px_rgba(7,11,24,0.22)]">
          {links.map((link) => (
            <li key={link.label}>
              <NavPanelLink link={link} onNavigate={onClose} />
            </li>
          ))}
        </ul>
      </div>
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
