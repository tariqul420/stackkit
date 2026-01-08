import { clerkClient, clerkMiddleware, requireAuth } from '@clerk/express';

// Middleware to protect routes
export { clerkMiddleware, requireAuth };

// Helper to get current user
export async function getCurrentUser(userId: string) {
  return await clerkClient.users.getUser(userId);
}
