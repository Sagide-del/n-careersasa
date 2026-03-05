"use client";

import Card from "@/components/Card";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { api, setAuthToken } from "@/lib/api";
import { saveToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

type Form = { email: string; password: string };

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<Form>();

  async function onSubmit(values: Form) {
    const res = await api.post("/auth/login", values);
    const token = res.data?.token;
    if (token) {
      saveToken(token);
      setAuthToken(token);
    }
    router.push("/pay");
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">CareerSasa</h1>
          <p className="text-slate-600 mt-1">Discover Your Best Career Path</p>
        </div>

        <Card title="Login">
          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="text-sm text-slate-700">Email</label>
              <input className="mt-1 w-full rounded-xl border p-3 text-base" {...register("email", { required: true })} />
              {errors.email ? <p className="text-xs text-red-600 mt-1">Email is required</p> : null}
            </div>

            <div>
              <label className="text-sm text-slate-700">Password</label>
              <input type="password" className="mt-1 w-full rounded-xl border p-3 text-base" {...register("password", { required: true })} />
              {errors.password ? <p className="text-xs text-red-600 mt-1">Password is required</p> : null}
            </div>

            <button disabled={isSubmitting} className="w-full rounded-xl bg-slate-900 text-white py-3 text-base">
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            <p className="text-sm text-slate-600 text-center">
              No account? <Link className="text-slate-900 underline" href="/register">Create one</Link>
            </p>
          </form>
        </Card>
      </div>
    </main>
  );
}
