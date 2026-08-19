import { destroySession, sessionCookieName } from "@/lib/auth";
import { ok } from "@/lib/api";

export async function POST() {
  destroySession();
  return ok({ loggedOut: true, cookie: sessionCookieName });
}
export const dynamic = "force-dynamic";