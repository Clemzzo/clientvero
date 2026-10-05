import type { OrganizationRole } from "@/db/schema";
import { AuthorizationError } from "@/server/errors";

export const permissions = {
  organizationRead: "organization.read",
  organizationUpdate: "organization.update",
  teamRead: "team.read",
  teamManage: "team.manage",
  leadsRead: "leads.read",
  leadsCreate: "leads.create",
  leadsUpdate: "leads.update",
  leadsDelete: "leads.delete",
  clientsRead: "clients.read",
  clientsCreate: "clients.create",
  clientsUpdate: "clients.update",
  clientsDelete: "clients.delete",
  proposalsRead: "proposals.read",
  proposalsCreate: "proposals.create",
  proposalsSend: "proposals.send",
  projectsRead: "projects.read",
  projectsCreate: "projects.create",
  projectsUpdate: "projects.update",
  projectsDelete: "projects.delete",
  invoicesRead: "invoices.read",
  invoicesCreate: "invoices.create",
  invoicesSend: "invoices.send",
  billingRead: "billing.read",
  billingManage: "billing.manage",
  activityDelete: "activity.delete",
} as const;

export type Permission = (typeof permissions)[keyof typeof permissions];

const allPermissions = Object.values(permissions);

const memberPermissions: Permission[] = [
  permissions.organizationRead,
  permissions.teamRead,
  permissions.leadsRead,
  permissions.leadsCreate,
  permissions.leadsUpdate,
  permissions.clientsRead,
  permissions.clientsCreate,
  permissions.clientsUpdate,
  permissions.proposalsRead,
  permissions.proposalsCreate,
  permissions.proposalsSend,
  permissions.projectsRead,
  permissions.projectsCreate,
  permissions.projectsUpdate,
  permissions.invoicesRead,
  permissions.invoicesCreate,
  permissions.invoicesSend,
];

const rolePermissions: Record<OrganizationRole, ReadonlySet<Permission>> = {
  OWNER: new Set(allPermissions),
  ADMIN: new Set(allPermissions),
  MEMBER: new Set(memberPermissions),
};

export function hasPermission(role: OrganizationRole, permission: Permission): boolean {
  return rolePermissions[role].has(permission);
}

export function requirePermission(context: { membership: { role: OrganizationRole } }, permission: Permission) {
  if (!hasPermission(context.membership.role, permission)) {
    throw new AuthorizationError();
  }
}
