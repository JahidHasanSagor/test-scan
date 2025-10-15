import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
 
export async function middleware(request: NextRequest) {
	// Apply security headers to all requests
	const response = NextResponse.next();
	
	// Security headers for production
	response.headers.set(
		'Strict-Transport-Security',
		'max-age=31536000; includeSubDomains; preload'
	);
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('X-XSS-Protection', '1; mode=block');
	response.headers.set(
		'Permissions-Policy',
		'camera=(), microphone=(), geolocation=()'
	);
	
	// Content Security Policy
	response.headers.set(
		'Content-Security-Policy',
		"default-src 'self'; " +
		"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://cdn.jsdelivr.net; " +
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
		"img-src 'self' data: https: blob:; " +
		"font-src 'self' data: https://fonts.gstatic.com; " +
		"connect-src 'self' https://api.stripe.com https://*.supabase.co; " +
		"frame-src 'self' https://js.stripe.com https://hooks.stripe.com; " +
		"object-src 'none'; " +
		"base-uri 'self'; " +
		"form-action 'self'; " +
		"frame-ancestors 'none'; " +
		"upgrade-insecure-requests;"
	);

	// Check auth for protected routes
	const protectedRoutes = ["/admin", "/dashboard", "/submit", "/saved"];
	const isProtectedRoute = protectedRoutes.some(route => 
		request.nextUrl.pathname.startsWith(route)
	);

	if (isProtectedRoute) {
		const session = await auth.api.getSession({
			headers: await headers()
		});
		
		if (!session) {
			return NextResponse.redirect(new URL("/sign-in", request.url));
		}
	}
 
	return response;
}
 
export const config = {
  runtime: "nodejs",
  matcher: [
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};