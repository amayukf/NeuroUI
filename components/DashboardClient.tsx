"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { useAuth } from "./AuthProvider";
import NeuroUIApp from "./NeuroUIApp";

interface DemoMeta {
  label: string;
  icon?: string;
  prompt: string;
}

export function DashboardClient({ demos }: { demos: DemoMeta[] }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-[#71717a]">
            <Loader2 className="h-4 w-4 animate-spin" />
            {loading ? "Loading your workspace…" : "Redirecting to login…"}
          </div>
        </div>
      </div>
    );
  }

  return <NeuroUIApp demos={demos} />;
}
