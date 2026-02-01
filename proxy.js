import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "pos_session";

function getKey() {
  return new TextEncoder().encode(process.env.AUTH_JWT_SECRET);
}

async function verifyToken(token) {
  const { payload } = await jwtVerify(token, getKey());
  return payload;
}

// ✅ Ganti "middleware" menjadi "proxy"
export async function proxy(req) {
  const { pathname } = req.nextUrl;

  // 1. Public routes (no auth required)
  if (pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  // 2. Protect POS + Admin routes only
  const isPosRoute = pathname.startsWith("/pos");
  const isAdminRoute = pathname.startsWith("/admin");

  if (!isPosRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  // 3. Get session token from cookie
  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 4. Verify JWT
  let user;
  try {
    user = await verifyToken(token);
  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = user.role;

  // 5. RBAC Rules
  if (isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/pos", req.url));
  }

  if (isPosRoute && role !== "CASHIER" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/pos/:path*", "/admin/:path*"],
};