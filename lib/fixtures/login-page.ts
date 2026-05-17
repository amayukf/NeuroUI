import type { SandboxFile } from "../sandbox";

const APP_TSX = `import { useState } from "react";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const emailValid = /^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email);
  const passwordValid = password.length >= 8;

  function validate() {
    const e: { email?: string; password?: string } = {};
    if (!email) e.email = "Email is required.";
    else if (!emailValid) e.email = "Please enter a valid email.";
    if (!password) e.password = "Password is required.";
    else if (!passwordValid) e.password = "Password must be at least 8 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f]">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle2 className="h-7 w-7 text-emerald-400" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-[#e5e5e5]">Welcome back!</h2>
          <p className="mt-1 text-sm text-[#71717a]">Redirecting to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500" />
          <h1 className="text-2xl font-semibold tracking-tight text-[#e5e5e5]">Sign in to Acme</h1>
          <p className="mt-1 text-sm text-[#71717a]">Welcome back — we missed you.</p>
        </div>

        <button
          type="button"
          className="mb-4 flex w-full items-center justify-center gap-3 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-2.5 text-sm font-medium text-[#e5e5e5] hover:border-[#3a3a3a] hover:bg-[#222] active:scale-95 transition-all"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#2a2a2a]" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-[#0f0f0f] px-3 text-[#71717a]">or continue with email</span></div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-[#e5e5e5]">Email</label>
            <input
              id="email" type="email" autoComplete="email" value={email}
              onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); }}
              placeholder="you@company.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-err" : undefined}
              className={"w-full rounded-lg border bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#e5e5e5] placeholder:text-[#71717a] outline-none transition-all focus:ring-2 " +
                (errors.email ? "border-rose-500/60 focus:ring-rose-500/20" : "border-[#2a2a2a] focus:ring-violet-500/40 focus:border-violet-500/60")}
            />
            {errors.email && <p id="email-err" className="mt-1 flex items-center gap-1 text-xs text-rose-400"><AlertCircle className="h-3 w-3" />{errors.email}</p>}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-medium text-[#e5e5e5]">Password</label>
              <button type="button" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Forgot password?</button>
            </div>
            <div className="relative">
              <input
                id="password" type={showPw ? "text" : "password"} autoComplete="current-password" value={password}
                onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })); }}
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "pw-err" : undefined}
                className={"w-full rounded-lg border bg-[#1a1a1a] px-3 py-2.5 pr-10 text-sm text-[#e5e5e5] placeholder:text-[#71717a] outline-none transition-all focus:ring-2 " +
                  (errors.password ? "border-rose-500/60 focus:ring-rose-500/20" : "border-[#2a2a2a] focus:ring-violet-500/40 focus:border-violet-500/60")}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-[#e5e5e5] transition-colors">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p id="pw-err" className="mt-1 flex items-center gap-1 text-xs text-rose-400"><AlertCircle className="h-3 w-3" />{errors.password}</p>}
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-[#e5e5e5]">
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-[#2a2a2a] bg-[#1a1a1a] accent-violet-500" />
            <span className="text-xs text-[#71717a]">Remember me for 30 days</span>
          </label>

          <button type="submit" disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-500 px-4 py-2.5 text-sm font-medium text-white hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 transition-all">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Signing in…</> : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#71717a]">
          Don't have an account?{" "}
          <button className="text-violet-400 hover:text-violet-300 transition-colors font-medium">Sign up free</button>
        </p>
      </div>
    </div>
  );
}
`;

export const LOGIN_PAGE_FILES: SandboxFile[] = [
  { path: "/src/App.tsx", contents: APP_TSX },
];
