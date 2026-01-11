import { useQuery } from "@tanstack/react-query";
import { useLoaderData, useParams } from "react-router";
import { userService } from "../api/services/user.service";

type User = { id?: string; name?: string; email?: string; avatar?: string; [key: string]: any };

export default function UserProfile() {
  const loaderUser = useLoaderData() as User | undefined;
  const { userId } = useParams();

  const { data: user = loaderUser ?? {} } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      if (!userId) throw new Error("Missing user id");
      return await userService.getUser(userId);
    },
    initialData: loaderUser,
    staleTime: 1000 * 60,
  });

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-xl p-8 bg-zinc-900 rounded-md shadow">
        <div className="flex items-center gap-4">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-zinc-700 flex items-center justify-center text-xl">
              {user.name?.[0] ?? "U"}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-semibold">{user.name}</h2>
            <p className="text-sm text-zinc-400">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
