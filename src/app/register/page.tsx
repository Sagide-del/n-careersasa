"use client";

import Card from "@/components/Card";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

type Form = { name: string; email: string; password: string };

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<Form>();

  async function onSubmit(values: Form) {
    await api.post("/auth/register", values);
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">CareerSasa</h1>
          <p className="text-slate-600 mt-1">Discover Your Best Career Path</p>
        </div>

        <Card title="Create account">
          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="text-sm text-slate-700">Full name</label>
              <input className="mt-1 w-full rounded-xl border p-3 text-base" {...register("name", { required: true })} />
            </div>
            <div>
              <label className="text-sm text-slate-700">Email</label>
              <input className="mt-1 w-full rounded-xl border p-3 text-base" {...register("email", { required: true })} />
            </div>
            <div>
              <label className="text-sm text-slate-700">Password</label>
              <input type="password" className="mt-1 w-full rounded-xl border p-3 text-base" {...register("password", { required: true, minLength: 6 })} />
            </div>

            <button disabled={isSubmitting} className="w-full rounded-xl bg-slate-900 text-white py-3 text-base">
              {isSubmitting ? "Creating..." : "Create account"}
            </button>

            <p className="text-sm text-slate-600 text-center">
              Have an account? <Link className="text-slate-900 underline" href="/login">Login</Link>
            </p>
          </form>
        </Card>
      </div>
    </main>
  );
}
