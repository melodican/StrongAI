import { NextResponse } from "next/server";

const PRIVATE_ROUTES = ["/chat"];
const PUBLIC_ROUTES = ["/sign-in", "/sign-up"];

const isAuthenticated = (req) => {
  const token = req.cookies.get("sb-access-token"); 
  return Boolean(token);
};

export function middleware(req) {
  const { pathname } = req.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/chat", req.url));
  }

  if (!isAuthenticated(req) && PRIVATE_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (isAuthenticated(req) && PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/chat", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/sign-in", "/sign-up", "/chat"],
};
