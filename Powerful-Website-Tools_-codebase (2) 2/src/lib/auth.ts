import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { NextRequest } from 'next/server';
import { headers } from "next/headers"
import { db } from "@/db";
 
export const auth = betterAuth({
	secret: process.env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: "sqlite",
	}),
	emailAndPassword: {    
		enabled: true
	},
	user: {
		additionalFields: {
			role: {
				type: "string",
				required: false,
				defaultValue: "user",
				input: false,
			}
		}
	},
	plugins: [bearer()]
});

// Export handler and api separately for easier access
export const handler = auth.handler;
export const api = auth.api;

// Session validation helper
export async function getCurrentUser(request: NextRequest) {
  const session = await api.getSession({ headers: await headers() });
  return session?.user || null;
}