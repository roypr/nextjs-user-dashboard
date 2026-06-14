/**
 * @fileoverview Admin group management Server Actions.
 * Provides CRUD operations for user groups with RBAC enforcement (Super Admin only).
 * Follows the mandatory validation pattern:
 * session -> authorize -> validate -> operate -> revalidate -> return
 *
 * Auth required (all): super_admin
 */

"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import { invalidatePermissionVersionCache } from "@/lib/auth/session-cache";
import { createGroupSchema, updateGroupSchema } from "@/lib/validators/group";
import type { SessionData } from "@/types";

interface GroupWithUserCount {
  id: string;
  name: string;
  type: string;
  routePermissions: string[];
  permissionVersion: number;
  createdAt: Date;
  updatedAt: Date;
  _count: { users: number };
}

/**
 * Returns all groups with their user counts.
 * Auth: super_admin.
 */
export async function getGroups(): Promise<{
  groups?: GroupWithUserCount[];
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!authorize(session, { type: "super_admin" })) {
      return { error: "Unauthorized. Only Super Admin can manage groups." };
    }

    const groups = await prisma.userGroup.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { users: true } },
      },
    });

    return { groups };
  } catch (error) {
    console.error("Get groups error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Creates a new group with name, type, and route permissions.
 * Auth: super_admin.
 *
 * @param prevState - Previous form state.
 * @param formData - Form data with name, type, routePermissions.
 */
export async function createGroup(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  try {
    const session = await getSession();
    if (!authorize(session, { type: "super_admin" })) {
      return { error: "Unauthorized. Only Super Admin can manage groups." };
    }

    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const routePermissionsRaw = formData.getAll("routePermissions") as string[];

    // Validate with Zod
    const parsed = createGroupSchema.safeParse({
      name,
      type,
      routePermissions: routePermissionsRaw,
    });

    if (!parsed.success) {
      const issue = (parsed.error as any).issues?.[0];
      return { error: issue?.message || "Invalid input." };
    }

    // Check for duplicate name
    const existing = await prisma.userGroup.findUnique({
      where: { name: parsed.data.name },
    });
    if (existing) {
      return { error: "A group with this name already exists." };
    }

    await prisma.userGroup.create({
      data: {
        name: parsed.data.name,
        type: parsed.data.type,
        routePermissions: parsed.data.routePermissions,
        permissionVersion: 1, // Start at 1
      },
    });

    revalidatePath("/admin/groups");
    return { success: "Group created successfully." };
  } catch (error) {
    console.error("Create group error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Updates an existing group's name, type, and route permissions.
 * If permissions changed, increments permissionVersion (invalidates sessions for users in group).
 * Prevents changing own group's type or permissions to avoid lockout.
 * Auth: super_admin.
 *
 * @param id - The group ID to update.
 * @param prevState - Previous form state.
 * @param formData - Form data with name, type, routePermissions.
 */
export async function updateGroup(
  id: string,
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  try {
    const session = await getSession();
    if (!authorize(session, { type: "super_admin" })) {
      return { error: "Unauthorized. Only Super Admin can manage groups." };
    }

    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const routePermissionsRaw = formData.getAll("routePermissions") as string[];

    // Validate with Zod
    const parsed = updateGroupSchema.safeParse({
      name,
      type,
      routePermissions: routePermissionsRaw,
    });

    if (!parsed.success) {
      const issue = (parsed.error as any).issues?.[0];
      return { error: issue?.message || "Invalid input." };
    }

    // Get the existing group
    const existingGroup = await prisma.userGroup.findUnique({
      where: { id },
    });

    if (!existingGroup) {
      return { error: "Group not found." };
    }

    // Check if this is the Super Admin's own group — prevent lockout
    const isOwnGroup = await isSuperAdminGroup(existingGroup, session);
    if (isOwnGroup) {
      // Can change name but not type or permissions
      if (
        parsed.data.type !== existingGroup.type ||
        JSON.stringify(parsed.data.routePermissions) !==
          JSON.stringify(existingGroup.routePermissions)
      ) {
        return {
          error:
            "Cannot change type or permissions of your own group to avoid lockout. Contact another Super Admin.",
        };
      }
    }

    // Check name uniqueness (if changed)
    if (parsed.data.name !== existingGroup.name) {
      const nameTaken = await prisma.userGroup.findUnique({
        where: { name: parsed.data.name },
      });
      if (nameTaken) {
        return { error: "A group with this name already exists." };
      }
    }

    // Determine if permissions actually changed
    const permissionsChanged =
      JSON.stringify(parsed.data.routePermissions) !==
        JSON.stringify(existingGroup.routePermissions) ||
      parsed.data.type !== existingGroup.type;

    await prisma.userGroup.update({
      where: { id },
      data: {
        name: parsed.data.name,
        type: parsed.data.type,
        routePermissions: parsed.data.routePermissions,
        permissionVersion: permissionsChanged
          ? existingGroup.permissionVersion + 1
          : existingGroup.permissionVersion,
      },
    });

    // Invalidate the permission version cache so the proxy picks up changes
    if (permissionsChanged) {
      invalidatePermissionVersionCache(id);
    }

    revalidatePath("/admin/groups");
    return { success: "Group updated successfully." };
  } catch (error) {
    console.error("Update group error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Deletes a group. Refuses if the group has users assigned or if it's the Super Admin's group.
 * Auth: super_admin.
 *
 * @param id - The group ID to delete.
 */
export async function deleteGroup(
  id: string,
): Promise<{ error?: string; success?: string }> {
  try {
    const session = await getSession();
    if (!authorize(session, { type: "super_admin" })) {
      return { error: "Unauthorized. Only Super Admin can manage groups." };
    }

    const group = await prisma.userGroup.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!group) {
      return { error: "Group not found." };
    }

    // Prevent deleting the Super Admin's group
    if (await isSuperAdminGroup(group, session)) {
      return { error: "Cannot delete the Super Admin's group." };
    }

    // Refuse if group has users assigned
    if (group._count.users > 0) {
      return {
        error: `Cannot delete group "${group.name}" — it has ${group._count.users} user(s) assigned. Reassign them first.`,
      };
    }

    await prisma.userGroup.delete({
      where: { id },
    });

    revalidatePath("/admin/groups");
    return { success: "Group deleted successfully." };
  } catch (error) {
    console.error("Delete group error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Checks if a given group is the Super Admin's group.
 * The Super Admin's group is identified as the group containing the
 * user whose email matches SUPER_ADMIN_EMAIL.
 */
async function isSuperAdminGroup(
  group: { id: string; name: string },
  session: SessionData | null,
): Promise<boolean> {
  // If the current session user is the Super Admin and belongs to this group
  if (session?.isSuperAdmin && session.groupId === group.id) {
    return true;
  }

  // Also check if any user in this group is the Super Admin
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  if (!superAdminEmail) return false;

  const superAdminInGroup = await prisma.user.findFirst({
    where: {
      email: superAdminEmail,
      groupId: group.id,
    },
    select: { id: true },
  });

  return !!superAdminInGroup;
}
