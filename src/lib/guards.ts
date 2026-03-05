"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type GuardState = { loading: boolean; paid: boolean };

export function usePaidGuard(options?: { redirectTo?: string }) {
  const router = useRouter();
  const redirectTo = options?.redirectTo ?? "/pay";
  const [state, setState] = useState<GuardState>({ loading: true, paid: false });

  useEffect(() => {
    let alive = true;
    async function run() {
      try {
        const res = await api.get("/payments/me");
        const paid = Boolean(res.data?.paid);
        if (!alive) return;
        setState({ loading: false, paid });
        if (!paid) router.replace(redirectTo);
      } catch {
        if (!alive) return;
        setState({ loading: false, paid: false });
        router.replace(redirectTo);
      }
    }
    run();
    return () => { alive = false; };
  }, [router, redirectTo]);

  return state;
}
