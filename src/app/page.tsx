"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/target-urls");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      <div className="max-w-md w-full space-y-8 p-8">
        <h1 className="text-4xl font-bold text-center text-[#333333]">
          Please sign in
        </h1>
        <button
          onClick={() => router.push("/auth/signin")}
          className="w-full py-3 rounded-md text-white text-base font-medium bg-[#4F46E5] hover:bg-[#4338CA] transition-colors"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
