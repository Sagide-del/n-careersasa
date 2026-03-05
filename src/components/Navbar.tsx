"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { clearToken } from "@/lib/auth";
import { setAuthToken } from "@/lib/api";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link href={href} className={\lock rounded-xl px-3 py-2 text-sm \\}>
      {label}
    </Link>
  );
}

export default function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function logout() {
    clearToken();
    setAuthToken(null);
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/brand/careersasa-logo.png" alt="CareerSasa" width={36} height={36} className="rounded-lg" priority />
          <div className="leading-tight">
            <div className="font-bold">CareerSasa</div>
            <div className="text-xs text-slate-500 -mt-0.5">Discover Your Best Career Path</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <NavLink href="/dashboard" label="Dashboard" />
          <NavLink href="/pay" label="Pay" />
          <NavLink href="/assessment" label="Assessment" />
          <button onClick={logout} className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Logout</button>
        </nav>

        <button onClick={() => setOpen((v) => !v)} className="md:hidden rounded-xl border border-slate-300 px-3 py-2 text-sm" aria-label="Menu">
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open ? (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-3 space-y-1">
            <NavLink href="/dashboard" label="Dashboard" />
            <NavLink href="/pay" label="Pay" />
            <NavLink href="/assessment" label="Assessment" />
            <button onClick={logout} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left">Logout</button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
