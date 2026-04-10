import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnAdmin = req.nextUrl.pathname.startsWith("/admin");
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  if (isOnAdmin) {
    if (!isLoggedIn) return Response.redirect(new URL("/login", req.nextUrl));
    if ((req.auth?.user as any)?.role !== "MANAGER") {
      return Response.redirect(new URL("/dashboard", req.nextUrl));
    }
  }

  if (isOnDashboard) {
    if (!isLoggedIn) return Response.redirect(new URL("/login", req.nextUrl));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
