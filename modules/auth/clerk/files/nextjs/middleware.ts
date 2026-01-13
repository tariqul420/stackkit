import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware((auth, req) => {
  // Add your middleware logic here if needed
  // For example, protecting routes:
  // if (!auth.userId && req.nextUrl.pathname === '/protected') {
  //   return NextResponse.redirect(new URL('/sign-in', req.url));
  // }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
