import createMiddleware from "next-intl/middleware";
import { routing } from "./lib/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!admin|auth|server|assets|items|extensions|files|folders|users|collections|fields|relations|roles|policies|presets|dashboards|panels|flows|operations|notifications|activity|settings|webhooks|schema|revisions|permissions|shares|uploads|translations|versions|comments|graphql|websocket|api|_next|.*\\..*).*)"],
};