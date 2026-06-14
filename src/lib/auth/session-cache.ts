/**
 * @fileoverview In-memory cache for tokenVersion (per userId) and permissionVersion (per groupId)
 * with a 60-second TTL. On cache miss, queries the database and populates the cache.
 * This prevents a DB query on every request while keeping the invalidation window under a minute.
 */

import prisma from "@/lib/prisma";

const CACHE_TTL_MS = 60_000; // 60 seconds

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const tokenVersionCache = new Map<string, CacheEntry<number>>();
const permissionVersionCache = new Map<string, CacheEntry<number>>();

/**
 * Returns the current tokenVersion for the given userId.
 * Checks the in-memory cache first (60s TTL), queries DB on cache miss.
 * @param userId - The user's ID.
 * @returns The current tokenVersion from DB.
 */
export async function getCachedTokenVersion(
  userId: string,
): Promise<number> {
  const now = Date.now();
  const cached = tokenVersionCache.get(userId);

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  // Cache miss — query the database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tokenVersion: true },
  });

  const version = user?.tokenVersion ?? 0;
  tokenVersionCache.set(userId, { value: version, expiresAt: now + CACHE_TTL_MS });
  return version;
}

/**
 * Returns the current permissionVersion for the given groupId.
 * Checks the in-memory cache first (60s TTL), queries DB on cache miss.
 * @param groupId - The group's ID.
 * @returns The current permissionVersion (0 if group not found).
 */
export async function getCachedPermissionVersion(
  groupId: string,
): Promise<number> {
  const now = Date.now();
  const cached = permissionVersionCache.get(groupId);

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  // Cache miss — query the database
  const group = await prisma.userGroup.findUnique({
    where: { id: groupId },
    select: { permissionVersion: true },
  });

  const version = group?.permissionVersion ?? 0;
  permissionVersionCache.set(groupId, { value: version, expiresAt: now + CACHE_TTL_MS });
  return version;
}

/**
 * Invalidates the tokenVersion cache for a specific user.
 * Call this after updating a user's password or deleting an account.
 * @param userId - The user's ID.
 */
export function invalidateTokenVersionCache(userId: string): void {
  tokenVersionCache.delete(userId);
}

/**
 * Invalidates the permissionVersion cache for a specific group.
 * Call this after updating a group's route permissions.
 * @param groupId - The group's ID.
 */
export function invalidatePermissionVersionCache(groupId: string): void {
  permissionVersionCache.delete(groupId);
}
