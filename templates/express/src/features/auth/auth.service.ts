// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */

const signup = async (payload: Record<string, unknown>) => {
  // your logic here
};

const signin = async (
  email: string,
  password: string,
): Promise<{ token: string; user: any } | null> => {
  // your logic here
  return null;
};

export const authServices = {
  signup,
  signin,
};

export type { User };
