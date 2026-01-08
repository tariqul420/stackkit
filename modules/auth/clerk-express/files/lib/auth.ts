import { clerkClient, clerkMiddleware, requireAuth } from '@clerk/express';

export { clerkMiddleware, requireAuth };

export async function getCurrentUser(userId: string) {
  return await clerkClient.users.getUser(userId);
}
