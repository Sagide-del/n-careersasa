"use client";

import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

const AMOUNT = 100;
const TILL_NUMBER = "123456";
const DEV_ALLOW_DEMO_CONTINUE = true;

export default function PayPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);

  async function startStkPush() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await api.post("/payments/mpesa/stkpush", { phone, amount: AMOUNT });
      setCheckoutId(res.data?.checkoutRequestId || null);
      setStatus("STK Push sent. Please complete payment on your phone.");
    } catch (e: any) {
      setStatus(e?.response?.data?.message || "STK Push failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyPayment() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await api.get("/payments/me");
      const paid = Boolean(res.data?.paid);
      if (paid) {
        setStatus("Payment confirmed âœ… Unlocking assessmentâ€¦");
        router.push("/assessment");
      } else {
        setStatus("Payment not confirmed yet. If you just paid, wait 10â€“20 seconds and try again.");
      }
    } catch (e: any) {
      setStatus(e?.response?.data?.message || "Could not verify payment. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function demoContinue() {
    router.push("/assessment");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:py-8 space-y-6">
        <Card title="Pay KES 100 to Start">
          <p className="text-slate-600">
            Payment is required before you begin the assessment and generate your PDF report.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">Option A: Pay via M-Pesa Till</h3>
              <p className="text-sm text-slate-600 mt-1">
                Go to M-Pesa â†’ Lipa na M-Pesa â†’ Buy Goods and Services
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-sm text-slate-700">Till Number:</span>
                <span className="rounded-xl bg-slate-900 text-white px-3 py-2 font-mono">{TILL_NUMBER}</span>
                <span className="text-sm text-slate-700">Amount:</span>
                <span className="rounded-xl bg-slate-100 px-3 py-2 font-mono text-slate-900">{AMOUNT}</span>
              </div>

              <p className="text-xs text-slate-500 mt-2">
                After paying via Till, tap â€œVerify Paymentâ€ below to unlock the assessment.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">Option B: STK Push (Recommended)</h3>
              <p className="text-sm text-slate-600 mt-1">
                Enter your phone number to receive a payment prompt.
              </p>

              <div className="mt-3">
                <label className="text-sm text-slate-700">M-Pesa Phone Number</label>
                <input
                  className="mt-1 w-full rounded-xl border p-3 text-base"
                  placeholder="07XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <button onClick={startStkPush} disabled={loading || !phone} className="mt-3 w-full rounded-xl bg-slate-900 text-white px-4 py-3 text-base disabled:opacity-50">
                {loading ? "Requesting..." : "Send STK Push"}
              </button>

              {checkoutId ? (
                <p className="text-xs text-slate-500 mt-2">
                  Checkout ID: <span className="font-mono">{checkoutId}</span>
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={verifyPayment} disabled={loading} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base hover:bg-slate-50 disabled:opacity-50">
                {loading ? "Checking..." : "Verify Payment"}
              </button>

              {DEV_ALLOW_DEMO_CONTINUE ? (
                <button onClick={demoContinue} className="w-full rounded-xl bg-slate-200 px-4 py-3 text-base text-slate-700">
                  Continue (demo)
                </button>
              ) : null}
            </div>

            {status ? <p className="text-sm text-slate-700">{status}</p> : null}
          </div>
        </Card>
      </main>
    </div>
  );
}
