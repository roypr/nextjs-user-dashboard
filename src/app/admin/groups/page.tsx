/**
 * @fileoverview Admin group list page.
 * Displays a table of all user groups with name, type, user count,
 * permission count, and actions. Super Admin only.
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
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Groups</h1>
        <Link
          href="/admin/groups/create"
          className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Create Group
        </Link>
      </div>

      {result.error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {result.error}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Users
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Permissions
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {result.groups?.map((group) => (
              <tr key={group.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {group.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {group.type === "admin" ? (
                    <span className="inline-flex rounded-full bg-purple-100 px-2 text-xs font-semibold leading-5 text-purple-800">
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
                      Regular
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                  {group._count.users}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {group.routePermissions.length > 0
                    ? group.routePermissions.join(", ")
                    : "—"}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/groups/${group.id}/edit`}
                      className="font-medium text-blue-600 hover:text-blue-500"
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
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  No groups found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
