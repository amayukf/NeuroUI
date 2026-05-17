"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sparkles, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { useAuth } from "./AuthProvider";

interface AuthFormProps {
  mode: "signin" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { signIn, signUp, user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  const isSignup = mode === "signup";
  const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const passwordValid = password.length >= 6;
  const canSubmit = emailValid && passwordValid && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = isSignup ? await signUp(email, password) : await signIn(email, password);
      if (result.error) {
        setError(result.error);
      } else if (isSignup) {
        setSuccess(true);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (success && isSignup) {
    return (
      <AuthShell>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle2 className="h-7 w-7 text-emerald-400" />
          </div>
          <h2 className="text-xl font-semibold text-[#e5e5e5]">Check your email</h2>
          <p className="mt-2 text-sm text-[#71717a]">
            We sent a confirmation link to <span className="font-medium text-[#e5e5e5]">{email}</span>.
            <br />
            Click it to verify your account, then log in.
          </p>
          <Link href="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to log in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="mb-8 text-center">
        <Link href="/" className="mx-auto mb-5 flex justify-center" aria-label="NeuroUI home">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-[#e5e5e5]">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-1.5 text-sm text-[#71717a]">
          {isSignup ? "Start generating production UI in seconds." : "Log in to your NeuroUI dashboard."}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-[#e5e5e5]">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(null); }}
            placeholder="you@company.com"
            required
            className="w-full rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#e5e5e5] placeholder:text-[#71717a] outline-none transition-all focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-[#e5e5e5]">Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              autoComplete={isSignup ? "new-password" : "current-password"}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(null); }}
              placeholder={isSignup ? "At least 6 characters" : "Your password"}
              required
              minLength={6}
              className="w-full rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2.5 pr-10 text-sm text-[#e5e5e5] placeholder:text-[#71717a] outline-none transition-all focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-[#e5e5e5] transition-colors"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>{error}</div>
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 transition-all"
        >
          {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />{isSignup ? "Creating account…" : "Logging in…"}</> : isSignup ? "Create account" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-[#71717a]">
        {isSignup ? (
          <>Already have an account?{" "}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors font-medium">Log in</Link>
          </>
        ) : (
          <>Don't have an account?{" "}
            <Link href="/signup" className="text-violet-400 hover:text-violet-300 transition-colors font-medium">Sign up free</Link>
          </>
        )}
      </p>

      <p className="mt-8 text-center text-[10px] text-[#52525b]">
        <Link href="/" className="hover:text-[#71717a] transition-colors">← Back to home</Link>
      </p>
    </AuthShell>
  );
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 py-12">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
