import { NextResponse } from "next/server";

const PRIVATE_ROUTES = ["/chat"];
const PUBLIC_ROUTES = ["/sign-in", "/sign-up"];

// This function checks if the user is authenticated based on the session
const isAuthenticated = (req) => {
  // Assuming the session or token is stored as a cookie
  const token = req.cookies.get("sb-access-token"); // Adjust the name to your session cookie
  return Boolean(token); // Returns true if token exists, indicating authentication
};

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Redirect "/" to "/chat" always
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/chat", req.url));
  }

  // If not authenticated and accessing private route, redirect to sign-in
  if (!isAuthenticated(req) && PRIVATE_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // If authenticated and accessing public route, redirect to "/chat"
  if (isAuthenticated(req) && PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/chat", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/sign-in", "/sign-up", "/chat"],
};
