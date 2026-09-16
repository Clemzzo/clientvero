import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { navigation, type NavLink } from "@/components/layout/navigation";

type FooterColumn = { label: string; links: NavLink[] };

function footerColumns(): FooterColumn[] {
  const topLevelLinks = navigation.flatMap((item) =>
    !item.items && item.href ? [{ label: item.label, href: item.href }] : [],
  );

  return navigation.flatMap((item) => {
    if (!item.items) return [];
    const links = item.label === "Product" ? [...item.items, ...topLevelLinks] : item.items;
    return [{ label: item.label, links }];
  });
}

export function MarketingFooter() {
  const columns = footerColumns();
  const year = new Date().getFullYear();

  return (
    <footer aria-labelledby="footer-heading" className="border-t border-ink-200 bg-white">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      <div className="mx-auto max-w-350 px-5 pb-10 pt-12 sm:px-8 lg:px-12 lg:pt-14">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
          <div>
            <Logo />
            <p className="mt-4 max-w-[30ch] text-[14.5px] leading-[1.6] text-ink-500">
              One workspace for running your client business. 
              No more jumping between WhatsApp, email, spreadsheets, and separate tools.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.label}>
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-900">{column.label}</h3>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="inline-flex min-h-6 items-center rounded text-[14px] text-ink-500 transition-colors hover:text-ink-900"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <p className="mt-14 border-t border-ink-200 pt-6 text-[13px] text-ink-500">
          © {year} ClientVero. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
