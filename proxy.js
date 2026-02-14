import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "pos_session";
const PUBLIC_API_PATHS = new Set([
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/me",
  "/api/webhooks/midtrans",
  "/api/dev/env-check",
  "/api/dev/simulate-midtrans",
]);

function getKey() {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret || secret.trim().length < 10) {
    throw new Error("AUTH_JWT_SECRET is missing/too short. Set it in .env.local");
  }
  return new TextEncoder().encode(secret);
}

async function verifyToken(token) {
  const { payload } = await jwtVerify(token, getKey());
  return payload;
}

export async function proxy(req) {
  const { pathname } = req.nextUrl;
  const hasSecret =
    typeof process.env.AUTH_JWT_SECRET === "string" &&
    process.env.AUTH_JWT_SECRET.trim().length >= 10;

  // 0. Redirect logged-in users away from login page / root
  if (pathname === "/login" || pathname === "/") {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (token && hasSecret) {
      try {
        const user = await verifyToken(token);
        // Redirect based on role
        const dest = user.role === "CASHIER" ? "/pos" : "/admin";
        return NextResponse.redirect(new URL(dest, req.url));
      } catch {
        // Token invalid — let them stay on login
      }
    }
    return NextResponse.next();
  }

  // 1. Public API routes (no auth required)
  if (PUBLIC_API_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  if (!hasSecret) {
    console.error("[proxy] AUTH_JWT_SECRET is missing/too short");
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { error: { message: "Server misconfigured: AUTH_JWT_SECRET missing" } },
        { status: 500 }
      );
    }
    const url = new URL("/login", req.url);
    url.searchParams.set("error", "server_misconfig");
    return NextResponse.redirect(url);
  }

  // 2. Protect API routes with lightweight token presence check
  if (pathname.startsWith("/api")) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
    }
    return NextResponse.next();
  }

  // 3. Protect POS + Admin routes only
  const isPosRoute = pathname.startsWith("/pos");
  const isAdminRoute = pathname.startsWith("/admin");
  const isSalesRoute = pathname.startsWith("/sales");

  if (!isPosRoute && !isAdminRoute && !isSalesRoute) {
    return NextResponse.next();
  }

  // 4. Get session token from cookie
  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 5. Verify JWT
  let user;
  try {
    user = await verifyToken(token);
  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = user.role;

  // 6. RBAC Rules
  if (isAdminRoute && role !== "OWNER" && role !== "OPS") {
    return NextResponse.redirect(new URL("/pos", req.url));
  }

  if (
    (isPosRoute || isSalesRoute) &&
    role !== "CASHIER" &&
    role !== "OWNER" &&
    role !== "OPS"
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/api/:path*", "/pos/:path*", "/admin/:path*", "/sales/:path*"],
};
