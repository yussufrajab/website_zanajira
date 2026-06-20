import createMiddleware from "next-intl/middleware";
import { routing } from "./lib/routing";

export default createMiddleware(routing);

// Exclude:
//   - Admin UI and admin/auth API routes (handled outside next-intl so they
//     are not locale-prefixed): /admin, /api/admin, /api/auth
//   - Next.js internals and static files
//   - The legacy Directus proxy paths (kept for a transition period; harmless
//     once Directus is decommissioned).
export const config = {
  matcher: ["/((?!admin|api/admin|api/auth|api/contact|api/download|server|assets|items|extensions|files|folders|users|collections|fields|relations|roles|policies|presets|dashboards|panels|flows|operations|notifications|activity|settings|webhooks|schema|revisions|permissions|shares|uploads|translations|versions|comments|graphql|websocket|api|_next|.*\\..*).*)"],
};