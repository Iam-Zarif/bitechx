"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FiMail, FiCheck, FiAlertCircle } from "react-icons/fi";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle");
  const timerRef = useRef(null);

  const setTempStatus = (s) => {
    setStatus(s);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus("idle"), 4000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setTempStatus("invalid");
      return;
    }
    setLoading(true);
    setStatus("idle");
    try {
      const { data } = await axios.post(
        "https://api.bitechx.com/auth",
        { email },
        { headers: { "Content-Type": "application/json" }, timeout: 10000 }
      );
      const token = data?.token || "";
      if (!token) throw new Error("Invalid response");
      localStorage.setItem("bitechx_token", token);
      setStatus("success");
      setTimeout(() => router.push("/products"), 500);
    } catch {
      setTempStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const btnColor =
    status === "success"
      ? "bg-verdant text-mist"
      : status === "error" || status === "invalid"
      ? "bg-rust text-mist"
      : "bg-verdant text-mist";

  return (
    <main className="min-h-screen bg-mist text-ink grid place-items-center p-6">
      <div className="w-full max-w-md">
        <div className="relative rounded-3xl bg-mist text-ink shadow-[0_10px_30px_rgba(0,0,0,0.08)] ring-1 ring-ink/10">
          <div className="p-8">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-semibold tracking-tight">
                Inventra
              </h1>
              <span className="inline-flex items-center gap-2 rounded-full bg-verdant/10 px-3 py-1 text-xs text-verdant">
                Secure Login
              </span>
            </div>

            <form onSubmit={onSubmit} className="space-y-5" noValidate>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm">
                  Email
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 grid w-10 place-items-center text-ink/50">
                    <FiMail />
                  </span>
                  <input
                    id="email"
                    type="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-ink/15 bg-mist/80 pl-10 pr-4 py-3 text-ink placeholder-ink/40 outline-none focus:ring-2 focus:ring-verdant/60"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                onClick={() => console.log("Login button clicked")}
                className={`inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 transition active:scale-[.98] hover:bg-verdant/90 disabled:opacity-60 ${btnColor}`}
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-mist border-b-transparent" />
                ) : status === "success" ? (
                  <>
                    <FiCheck className="h-5 w-5" />
                    <span>Success</span>
                  </>
                ) : status === "error" ? (
                  <>
                    <FiAlertCircle className="h-5 w-5" />
                    <span>Authentication failed</span>
                  </>
                ) : status === "invalid" ? (
                  <>
                    <FiAlertCircle className="h-5 w-5" />
                    <span>Invalid email format</span>
                  </>
                ) : (
                  <span>Login</span>
                )}
              </button>
            </form>
          </div>

          <div className="rounded-b-3xl border-t border-ink/10 bg-mist/70 px-8 py-4 text-center text-sm">
            By continuing you agree to our{" "}
            <a href="#" className="text-verdant hover:underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="text-verdant hover:underline">
              Privacy
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
