/**
 * @fileoverview Admin group list page.
 * Displays a table of all user groups with name, type, user count,
 * permission count, and actions. Super Admin only.
 * Warm-professional card design with styled table.
 */

import Link from "next/link";
import { getGroups } from "@/lib/actions/admin/groups";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import { redirect } from "next/navigation";
import DeleteGroupButton from "./delete-group-button";

/**
 * Admin groups list page — Super Admin only.
 */
export default async function GroupsPage() {
  const session = await getSession();
  if (!authorize(session, { type: "super_admin" })) {
    redirect("/admin/dashboard");
  }

  const result = await getGroups();

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="page-heading">User Groups</h1>
        <Link
          href="/admin/groups/create"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-[var(--accent-hover)] active:scale-[0.97]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Group
        </Link>
      </div>

      {result.error && (
        <div className="mb-4">
          <div className="animate-fade-in rounded-lg border border-[var(--error)]/30 bg-[var(--error-bg)] px-4 py-3 text-sm font-medium text-[var(--error)]">
            {result.error}
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border)]">
            <thead>
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Name
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Type
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Users
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Permissions
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {result.groups?.map((group) => (
                <tr key={group.id} className="transition-colors hover:bg-[var(--bg-subtle)]">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-[var(--text-primary)]">
                    {group.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {group.type === "admin" ? (
                      <span className="badge bg-[var(--accent-light)] text-[var(--accent)]">
                        Admin
                      </span>
                    ) : (
                      <span className="badge bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                        Regular
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {group._count.users}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {group.routePermissions.length > 0
                      ? group.routePermissions.join(", ")
                      : "—"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/groups/${group.id}/edit`}
                        className="font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
                      >
                        Edit
                      </Link>
                      <DeleteGroupButton
                        groupId={group.id}
                        groupName={group.name}
                        userCount={group._count.users}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {(!result.groups || result.groups.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
                    No groups found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
