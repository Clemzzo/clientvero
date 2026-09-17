"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { MarketingNav } from "@/components/layout/marketing-nav";
import { navigation } from "@/components/layout/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || mobileOpen;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-200",
        solid ? "border-ink-200 bg-white" : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-20 max-w-350 items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
        <Logo />

        <MarketingNav />

        <div className="hidden items-center gap-2 lg:flex">
          <Button variant="ghost" size="default" className="rounded-lg" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button size="default" className="rounded-lg" asChild>
            <Link href="/sign-up">Start for free</Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="flex size-11 items-center justify-center rounded-xl border border-ink-200 text-ink-700 lg:hidden"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-ink-200 bg-white px-5 pb-6 pt-4 sm:px-8 lg:hidden">
          <nav aria-label="Main" className="flex flex-col">
            {navigation.flatMap((item) =>
              item.items
                ? [
                    <p
                      key={item.label}
                      className="px-2 pb-1 pt-4 text-[13px] font-semibold text-ink-400"
                    >
                      {item.label}
                    </p>,
                    ...item.items.map((link) => (
                      <Link
                        key={`${item.label}-${link.label}`}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg px-2 py-2.5 text-[15px] font-medium text-ink-700"
                      >
                        {link.label}
                      </Link>
                    )),
                  ]
                : [
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-2 py-2.5 pt-4 text-[15px] font-semibold text-ink-900"
                    >
                      {item.label}
                    </Link>,
                  ],
            )}
          </nav>

          <div className="mt-5 flex flex-col gap-2">
            <Button variant="outline" size="lg" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button size="lg" asChild>
              <Link href="/sign-up">Start for free</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
