"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <button
        onClick={() => signIn()}
        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
      >
        Sign in
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <p className="text-sm text-gray-700">
        {session?.user?.name} ({session?.user?.role})
      </p>
      <button
        onClick={() => signOut()}
        className="text-sm font-medium text-red-600 hover:text-red-500"
      >
        Sign out
      </button>
    </div>
  );
}
