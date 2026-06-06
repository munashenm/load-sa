/** Routes that use portal chrome (no marketing header/footer). */
const PORTAL_PREFIXES = [
  "/customer",
  "/book",
  "/track",
  "/driver",
  "/admin",
  "/pay",
  "/support",
] as const;

export function isPortalRoute(pathname: string): boolean {
  return PORTAL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
