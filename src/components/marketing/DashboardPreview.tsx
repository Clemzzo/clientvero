import Image from "next/image";
import {
  Bell,
  ChevronDown,
  FileText,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  Paperclip,
  ReceiptText,
  Search,
  Settings,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import sarahAvatar from "@/assets/images/sarah.png";
import { Logo } from "@/components/layout/logo";
import { CountUp, ProgressFill, StaggerItem, StaggerList } from "@/components/marketing/dashboard-motion";
import { TiltCard } from "@/components/marketing/tilt-card";
import { cn } from "@/lib/utils";

const sidebarItems: { label: string; icon: LucideIcon }[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Leads", icon: UserPlus },
  { label: "Clients", icon: Users },
  { label: "Proposals", icon: FileText },
  { label: "Projects", icon: FolderKanban },
  { label: "Invoices", icon: ReceiptText },
  { label: "Messages", icon: MessageSquare },
  { label: "Files", icon: Paperclip },
];

const sidebarFooterItems: { label: string; icon: LucideIcon }[] = [
  { label: "Settings", icon: Settings },
  { label: "Help", icon: HelpCircle },
];

const stats = [
  { label: "Total revenue", amount: 24500, prefix: "$", delta: "12%", up: true, icon: Wallet, tint: "text-emerald-600 bg-emerald-50" },
  { label: "Active clients", amount: 18, prefix: "", delta: "3", up: true, icon: Users, tint: "text-brand-600 bg-brand-50" },
  { label: "Projects in progress", amount: 7, prefix: "", delta: "2", up: true, icon: FolderKanban, tint: "text-violet-600 bg-violet-50" },
  { label: "Outstanding invoices", amount: 6200, prefix: "$", delta: "8%", up: false, icon: ReceiptText, tint: "text-amber-600 bg-amber-50" },
];

const projects = [
  { name: "Website redesign", client: "Acme Co.", progress: 80, bar: "bg-emerald-500", dot: "bg-emerald-500" },
  { name: "Brand identity", client: "Lumen Labs", progress: 60, bar: "bg-brand-600", dot: "bg-brand-600" },
  { name: "Marketing campaign", client: "BrightPath", progress: 40, bar: "bg-amber-500", dot: "bg-amber-500" },
  { name: "Mobile app", client: "NovaTech", progress: 20, bar: "bg-violet-500", dot: "bg-violet-500" },
];

const activity = [
  { icon: UserPlus, tint: "text-brand-600 bg-brand-50", title: "New client enquiry", detail: "Olivia Park sent a contact form", time: "2h ago" },
  { icon: ReceiptText, tint: "text-emerald-600 bg-emerald-50", title: "Invoice paid", detail: "$2,500 from Acme Co.", time: "4h ago" },
  { icon: FolderKanban, tint: "text-amber-600 bg-amber-50", title: "Project updated", detail: "Brand identity is in progress", time: "6h ago" },
  { icon: MessageSquare, tint: "text-violet-600 bg-violet-50", title: "New message", detail: "James Miller: “Looking great!”", time: "1d ago" },
];

function SidebarLink({
  icon: Icon,
  label,
  active = false,
  muted = false,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  muted?: boolean;
}) {
  return (
    <li>
      <span
        className={cn(
          "group flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[11.5px] font-medium transition-colors duration-200",
          active && "bg-brand-50 text-brand-700 hover:bg-brand-100",
          !active && muted && "text-ink-400 hover:bg-ink-100 hover:text-ink-700",
          !active && !muted && "text-ink-500 hover:bg-ink-100 hover:text-ink-900",
        )}
      >
        <Icon className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        <span className="transition-transform duration-200 group-hover:translate-x-0.5">
          {label}
        </span>
      </span>
    </li>
  );
}

export function DashboardPreview() {
  return (
    <TiltCard>
      <div
        aria-hidden
        className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_40px_90px_-40px_rgba(7,11,24,0.35)]"
      >
        <div className="flex h-12 items-center gap-3 border-b border-ink-200 px-3 sm:px-4">
          <Logo href={null} className="h-5 w-auto shrink-0" />

          <div className="hidden h-7 flex-1 items-center gap-2 rounded-lg bg-ink-50 px-2.5 text-[11px] text-ink-400 sm:flex">
            <Search className="size-3.5" />
            Search clients, projects, invoices…
          </div>

          <div className="ml-auto flex items-center gap-3 sm:ml-0">
            <Bell className="size-4 text-ink-400" />
            <div className="flex items-center gap-2">
              <Image
                src={sarahAvatar}
                alt=""
                loading="eager"
                sizes="28px"
                className="size-7 shrink-0 rounded-full object-cover"
              />
              <span className="hidden leading-tight sm:block">
                <span className="block text-[11px] font-semibold text-ink-900">Sarah Chen</span>
                <span className="block text-[10px] text-ink-400">Acme Studio</span>
              </span>
              <ChevronDown className="hidden size-3.5 text-ink-400 sm:block" />
            </div>
          </div>
        </div>

        <div className="flex">
          <nav className="hidden w-36 shrink-0 flex-col justify-between border-r border-ink-200 py-3 md:flex">
            <ul className="space-y-0.5 px-2">
              {sidebarItems.map((item, index) => (
                <SidebarLink
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  active={index === 0}
                />
              ))}
            </ul>

            <ul className="space-y-0.5 px-2 pt-6">
              {sidebarFooterItems.map((item) => (
                <SidebarLink key={item.label} icon={item.icon} label={item.label} muted />
              ))}
            </ul>
          </nav>

          <div className="min-w-0 flex-1 bg-ink-50/60 p-3 sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-base font-bold text-ink-900 sm:text-lg">
                  Good morning, Sarah 👋
                </p>
                <p className="mt-0.5 text-[11px] text-ink-500">
                  Here&rsquo;s what&rsquo;s happening with your business today.
                </p>
              </div>
              <p className="hidden shrink-0 text-[11px] text-ink-400 sm:block">Mon, Apr 28, 2025</p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="group rounded-xl border border-ink-200 bg-white p-2.5 transition-colors duration-200 hover:border-brand-200"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-h-[2.4em] text-[10.5px] leading-tight text-ink-500">
                      {stat.label}
                    </p>
                    <span
                      className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-md transition-transform duration-200 group-hover:scale-110",
                        stat.tint,
                      )}
                    >
                      <stat.icon className="size-3" />
                    </span>
                  </div>
                  <p className="mt-1.5 font-display text-lg font-bold tracking-tight text-ink-900">
                    <CountUp value={stat.amount} prefix={stat.prefix} />
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 flex items-center gap-0.5 text-[10px] font-semibold",
                      stat.up ? "text-emerald-600" : "text-rose-500",
                    )}
                  >
                    {stat.up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                    {stat.delta}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-2.5 grid gap-2.5 lg:grid-cols-2">
              <div className="rounded-xl border border-ink-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11.5px] font-semibold text-ink-900">Project progress</p>
                  <span className="text-[10px] text-brand-600">View all projects</span>
                </div>

                <ul className="mt-2 space-y-1">
                  {projects.map((project, index) => (
                    <li
                      key={project.name}
                      className="-mx-1.5 flex items-center gap-2.5 rounded-lg px-1.5 py-1 transition-colors duration-200 hover:bg-ink-50"
                    >
                      <span className={cn("size-1.5 shrink-0 rounded-full", project.dot)} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[11px] font-medium text-ink-900">
                          {project.name}
                        </span>
                        <span className="block truncate text-[10px] text-ink-400">{project.client}</span>
                      </span>
                      <span className="h-1.5 w-12 shrink-0 overflow-hidden rounded-full bg-ink-100 sm:w-14">
                        <ProgressFill
                          value={project.progress}
                          delay={index * 0.12}
                          className={project.bar}
                        />
                      </span>
                      <span className="w-7 shrink-0 text-right text-[10px] font-semibold text-ink-500">
                        {project.progress}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-ink-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11.5px] font-semibold text-ink-900">Recent activity</p>
                  <span className="text-[10px] text-brand-600">View all</span>
                </div>

                <StaggerList className="mt-2 space-y-1">
                  {activity.map((entry) => (
                    <StaggerItem
                      key={entry.title}
                      className="-mx-1.5 flex items-start gap-2.5 rounded-lg px-1.5 py-1 transition-colors duration-200 hover:bg-ink-50"
                    >
                      <span className={cn("grid size-6 shrink-0 place-items-center rounded-md", entry.tint)}>
                        <entry.icon className="size-3" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[11px] font-medium text-ink-900">
                          {entry.title}
                        </span>
                        <span className="block truncate text-[10px] text-ink-400">{entry.detail}</span>
                      </span>
                      <span className="shrink-0 text-[10px] text-ink-400">{entry.time}</span>
                    </StaggerItem>
                  ))}
                </StaggerList>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}
