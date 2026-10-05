import Link from "next/link";

import { ProjectProgress } from "@/components/projects/ProjectProgress";
import { RowDeleteMenu } from "@/components/shared/RowDeleteMenu";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { projectStatusLabels, projectStatusTones } from "@/features/projects/project-status";
import { formatDate, formatMoney } from "@/lib/utils/format";
import { deleteProjectAction } from "@/server/actions/projects";
import type { ProjectListRow } from "@/server/repositories/project.repository";

type ProjectsTableProps = {
  projects: ProjectListRow[];
  canDelete: boolean;
  showClient?: boolean;
};

const headerCell = "px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-500";

function ProjectDeleteMenu({ project }: { project: ProjectListRow }) {
  return (
    <RowDeleteMenu
      name={project.name}
      archiveDescription="This project will be hidden from your projects. Its milestones and history are kept."
      permanentDescription="This project, its milestones, and its activity history will be erased from the database. This can't be undone."
      onDelete={deleteProjectAction.bind(null, project.id)}
    />
  );
}

function budget(project: ProjectListRow) {
  return project.budget ? formatMoney(project.budget, project.currency) : "—";
}

export function ProjectsTable({ projects, canDelete, showClient = true }: ProjectsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
      <table className="hidden w-full md:table">
        <thead className="border-b border-ink-200 bg-ink-50">
          <tr>
            <th scope="col" className={headerCell}>Project</th>
            <th scope="col" className={headerCell}>Status</th>
            <th scope="col" className={`${headerCell} w-48`}>Progress</th>
            <th scope="col" className={`${headerCell} text-right`}>Due</th>
            <th scope="col" className={`${headerCell} text-right`}>Budget</th>
            {canDelete && (
              <th scope="col" className="w-14">
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-200">
          {projects.map((project) => (
            <tr key={project.id} className="transition-colors hover:bg-ink-50">
              <td className="max-w-80 px-4 py-3.5">
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="block truncate text-[14px] font-semibold text-ink-900 hover:text-brand-700"
                >
                  {project.name}
                </Link>
                {showClient && <p className="truncate text-[13px] text-ink-500">{project.clientName}</p>}
              </td>
              <td className="px-4 py-3.5">
                <StatusBadge label={projectStatusLabels[project.status]} tone={projectStatusTones[project.status]} />
              </td>
              <td className="px-4 py-3.5">
                <ProjectProgress value={project.progress} label={`${project.name} progress`} />
              </td>
              <td className="px-4 py-3.5 text-right text-[13px] text-ink-500">
                {project.dueDate ? <time dateTime={project.dueDate}>{formatDate(project.dueDate)}</time> : "—"}
              </td>
              <td className="px-4 py-3.5 text-right text-[14px] font-medium tabular-nums text-ink-900">{budget(project)}</td>
              {canDelete && (
                <td className="py-3.5 pr-3 text-right">
                  <ProjectDeleteMenu project={project} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-ink-200 md:hidden">
        {projects.map((project) => (
          <li key={project.id} className="flex items-start gap-1 hover:bg-ink-50">
            <Link href={`/dashboard/projects/${project.id}`} className="block min-w-0 flex-1 space-y-2.5 px-4 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-ink-900">{project.name}</p>
                  {showClient && <p className="truncate text-[13px] text-ink-500">{project.clientName}</p>}
                </div>
                <StatusBadge label={projectStatusLabels[project.status]} tone={projectStatusTones[project.status]} />
              </div>
              <ProjectProgress value={project.progress} label={`${project.name} progress`} />
              <p className="flex justify-between text-[13px] text-ink-500">
                <span className="font-medium tabular-nums text-ink-900">{budget(project)}</span>
                <span>{project.dueDate ? `Due ${formatDate(project.dueDate)}` : "No due date"}</span>
              </p>
            </Link>
            {canDelete && (
              <div className="py-3 pr-2">
                <ProjectDeleteMenu project={project} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
