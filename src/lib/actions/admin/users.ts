/**
 * @fileoverview Admin user management Server Actions.
 * Provides CRUD operations for users with pagination, search, and RBAC enforcement.
 * Follows the mandatory validation pattern:
 * session -> authorize -> rate limit -> validate -> operate -> revalidate -> return
 *
 * Auth required (all): admin + route /admin/users
 */

"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { authorize } from "@/lib/auth/authorize";

const ITEMS_PER_PAGE = 20;

interface PaginatedUsersResult {
  users: Array<{
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    emailVerified: boolean;
    group: { id: string; name: string } | null;
    createdAt: Date;
  }>;
  totalPages: number;
  currentPage: number;
  total: number;
}

/**
 * Returns a paginated list of users with optional search filtering.
 * Includes the user's group relation for display.
 * Auth: admin + route /admin/users
 *
 * @param query - Search query (matches against name, email, phone).
 * @param page - Page number (1-indexed, default: 1).
 */
export async function getUsers(
  query?: string,
  page: number = 1,
): Promise<PaginatedUsersResult> {
  const session = await getSession();
  if (!authorize(session, { type: "admin" }) || !authorize(session, { type: "route", path: "/admin/users" })) {
    throw new Error("Unauthorized");
  }

  const skip = (page - 1) * ITEMS_PER_PAGE;

  const where = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { email: { contains: query, mode: "insensitive" as const } },
          { phone: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
        group: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    totalPages: Math.ceil(total / ITEMS_PER_PAGE),
    currentPage: page,
    total,
  };
}

/**
 * Creates a new user with the specified email, password, name, and group.
 * Auth: admin + route /admin/users
 */
export async function createUser(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  try {
    const session = await getSession();
    if (!authorize(session, { type: "admin" }) || !authorize(session, { type: "route", path: "/admin/users" })) {
      return { error: "Unauthorized." };
    }

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const groupId = formData.get("groupId") as string;

    if (!email || !password) {
      return { error: "Email and password are required." };
    }

    // Validate password strength
    if (password.length < 8) {
      return { error: "Password must be at least 8 characters." };
    }
    if (!/[A-Z]/.test(password)) {
      return { error: "Password must contain at least one uppercase letter." };
    }
    if (!/[a-z]/.test(password)) {
      return { error: "Password must contain at least one lowercase letter." };
    }
    if (!/[0-9]/.test(password)) {
      return { error: "Password must contain at least one number." };
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return { error: "Password must contain at least one special character." };
    }

    // Check for duplicate email
    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      return { error: "A user with this email address already exists." };
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
        groupId: groupId || null,
        emailVerified: true, // Admin-created users are pre-verified
      },
    });

    revalidatePath("/admin/users");
    return { success: "User created successfully." };
  } catch (error) {
    console.error("Create user error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Updates an existing user's details (name, email, phone, address, group).
 * Cannot change the Super Admin's email.
 * Auth: admin + route /admin/users
 *
 * @param id - The user ID to update.
 */
export async function updateUser(
  id: string,
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  try {
    const session = await getSession();
    if (!authorize(session, { type: "admin" }) || !authorize(session, { type: "route", path: "/admin/users" })) {
      return { error: "Unauthorized." };
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const groupId = formData.get("groupId") as string;

    // Get the existing user
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return { error: "User not found." };
    }

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

    // Prevent changing Super Admin's email
    if (
      existingUser.email === superAdminEmail &&
      email !== existingUser.email
    ) {
      return { error: "Cannot change the Super Admin's email address." };
    }

    // Check email uniqueness if it's being changed
    if (email && email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email },
      });
      if (emailTaken) {
        return { error: "This email address is already in use." };
      }
    }

    await prisma.user.update({
      where: { id },
      data: {
        name: name || null,
        email: email || existingUser.email,
        phone: phone || null,
        address: address || null,
        groupId: groupId || null,
      },
    });

    revalidatePath("/admin/users");
    return { success: "User updated successfully." };
  } catch (error) {
    console.error("Update user error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Deletes a user. Prevents deleting the Super Admin.
 * Auth: admin + route /admin/users
 *
 * @param id - The user ID to delete.
 */
export async function deleteUser(
  id: string,
): Promise<{ error?: string; success?: string }> {
  try {
    const session = await getSession();
    if (!authorize(session, { type: "admin" }) || !authorize(session, { type: "route", path: "/admin/users" })) {
      return { error: "Unauthorized." };
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return { error: "User not found." };
    }

    // Prevent deleting Super Admin
    if (user.email === process.env.SUPER_ADMIN_EMAIL) {
      return { error: "Cannot delete the Super Admin account." };
    }

    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/admin/users");
    return { success: "User deleted successfully." };
  } catch (error) {
    console.error("Delete user error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}
