import { ICookies } from "cookies";

export function decrementRetries(
  ctx: { cookies: ICookies },
  uid: string
): void {
  const path = `/interaction/${uid}`;
  const retries = parseInt(ctx.cookies.get("retries") || "3", 10) - 1;

  if (retries <= 0) {
    throw new Error("Out of retries");
  }

  ctx.cookies.set("retries", retries.toString(), {
    path,
    maxAge: 1000 * 120,
    sameSite: "strict",
  });
}
