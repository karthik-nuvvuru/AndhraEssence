/**
 * Maps user roles to their appropriate redirect paths after login.
 */

export type UserRole = "customer" | "admin" | "restaurant_owner" | "rider";

export const ROLE_REDIRECT_PATHS: Record<UserRole, string> = {
  customer: "/(tabs)",
  admin: "/admin/dashboard",
  restaurant_owner: "/vendor/dashboard",
  rider: "/rider/dashboard",
};

export function getRoleRedirectPath(role: string | undefined): string {
  if (!role) return "/(tabs)";
  return ROLE_REDIRECT_PATHS[role as UserRole] || "/(tabs)";
}

export function isNonCustomerRole(role: string | undefined): boolean {
  if (!role) return false;
  return role !== "customer";
}
