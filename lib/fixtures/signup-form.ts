import type { SandboxFile } from "../sandbox";

const APP_TSX = `import { useMemo, useState } from "react";

interface FormState {
  email: string;
  password: string;
  confirm: string;
  acceptTerms: boolean;
}

interface PasswordChecks {
  length: boolean;
  upper: boolean;
  digit: boolean;
  symbol: boolean;
}

function checkPassword(p: string): PasswordChecks {
  return {
    length: p.length >= 8,
    upper: /[A-Z]/.test(p),
    digit: /\\d/.test(p),
    symbol: /[^A-Za-z0-9]/.test(p),
  };
}

export default function App() {
  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
    confirm: "",
    acceptTerms: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const checks = useMemo(() => checkPassword(form.password), [form.password]);
  const passwordsMatch = form.confirm.length > 0 && form.password === form.confirm;
  const passwordStrong = Object.values(checks).every(Boolean);
  const emailValid = /^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(form.email);

  const canSubmit = emailValid && passwordStrong && passwordsMatch && form.acceptTerms && !submitting;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
            <CheckIcon className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Check your inbox</h1>
          <p className="mt-2 text-sm text-zinc-400">
            We sent a confirmation link to <strong className="text-zinc-200">{form.email}</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 text-zinc-100">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-zinc-400">Start your free 14-day trial. No credit card required.</p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <SocialButton provider="Google" />
          <SocialButton provider="GitHub" />
        </div>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-zinc-500">
          <div className="h-px flex-1 bg-zinc-800" />
          <span>or with email</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field
            id="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => update("email", v)}
            placeholder="you@company.com"
            autoComplete="email"
            error={form.email.length > 0 && !emailValid ? "Please enter a valid email address." : undefined}
          />

          <Field
            id="password"
            label="Password"
            type="password"
            value={form.password}
            onChange={(v) => update("password", v)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            describedBy="pw-checks"
          />

          <ul id="pw-checks" className="grid grid-cols-2 gap-1.5 text-xs">
            <Check label="8+ characters" ok={checks.length} />
            <Check label="Uppercase letter" ok={checks.upper} />
            <Check label="Number" ok={checks.digit} />
            <Check label="Symbol" ok={checks.symbol} />
          </ul>

          <Field
            id="confirm"
            label="Confirm password"
            type="password"
            value={form.confirm}
            onChange={(v) => update("confirm", v)}
            placeholder="Re-enter password"
            autoComplete="new-password"
            error={form.confirm.length > 0 && !passwordsMatch ? "Passwords do not match." : undefined}
          />

          <label className="flex items-start gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={form.acceptTerms}
              onChange={(e) => update("acceptTerms", e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-900 accent-violet-500"
            />
            <span className="text-xs text-zinc-400">
              I agree to the{" "}
              <a href="#" className="text-violet-300 hover:text-violet-200">Terms</a> and{" "}
              <a href="#" className="text-violet-300 hover:text-violet-200">Privacy Policy</a>.
            </span>
          </label>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-lg bg-violet-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>

          <p className="text-center text-xs text-zinc-500">
            Already have an account?{" "}
            <a href="#" className="text-violet-300 hover:text-violet-200">Sign in</a>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
  describedBy,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  describedBy?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-zinc-300">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={[error ? \`\${id}-error\` : null, describedBy].filter(Boolean).join(" ") || undefined}
        className={\`w-full rounded-lg border bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500 outline-none transition-colors focus:border-violet-500 \${
          error ? "border-rose-500/60" : "border-zinc-800"
        }\`}
      />
      {error && (
        <p id={\`\${id}-error\`} className="mt-1 text-xs text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}

function Check({ label, ok }: { label: string; ok: boolean }) {
  return (
    <li className={\`flex items-center gap-1.5 \${ok ? "text-emerald-400" : "text-zinc-500"}\`}>
      <span className={\`flex h-3.5 w-3.5 items-center justify-center rounded-full border \${ok ? "border-emerald-500/60 bg-emerald-500/15" : "border-zinc-700"}\`}>
        {ok && <CheckIcon className="h-2.5 w-2.5" />}
      </span>
      {label}
    </li>
  );
}

function SocialButton({ provider }: { provider: "Google" | "GitHub" }) {
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 transition-colors hover:border-zinc-700"
      aria-label={\`Continue with \${provider}\`}
    >
      {provider === "Google" ? <GoogleIcon /> : <GithubIcon />}
      <span>Continue with {provider}</span>
    </button>
  );
}

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4L8.5 12 15.3 5.3a1 1 0 011.4 0z" clipRule="evenodd" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 11-3.3-12.9l5.7-5.7A20 20 0 1044 24c0-1.2-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0124 12c3 0 5.7 1.1 7.8 3l5.7-5.7A20 20 0 006.3 14.7z" />
      <path fill="#4CAF50" d="M24 44a20 20 0 0013.6-5.2l-6.3-5.3A12 12 0 0124 36a12 12 0 01-11.3-7.9l-6.5 5A20 20 0 0024 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 01-4 5.4l6.3 5.4C40.9 36 44 30.4 44 24c0-1.2-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M8 .2a8 8 0 00-2.5 15.6c.4.1.5-.2.5-.4v-1.5c-2.2.5-2.7-1-2.7-1-.3-.9-.8-1.2-.8-1.2-.7-.4.1-.4.1-.4.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.4.6 0-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.2-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3.7 0 1.4.1 2 .3 1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.2 0 3.1-1.9 3.8-3.6 4 .3.3.6.8.6 1.6v2.4c0 .2.1.5.6.4A8 8 0 008 .2z" />
    </svg>
  );
}
`;

const SPEC_JSON = `{
  "componentName": "SignUpForm",
  "componentType": "form",
  "summary": "Polished sign-up form with social auth, password strength checks, real-time validation, and a confirmation state.",
  "sections": [
    { "id": "header", "title": "Headline + sub", "purpose": "Set context and reassurance" },
    { "id": "social", "title": "Social providers", "purpose": "One-click sign-in alternatives" },
    { "id": "form", "title": "Email + password form", "purpose": "Primary sign-up path" },
    { "id": "confirmation", "title": "Inbox confirmation state", "purpose": "Show post-submit success" }
  ],
  "interactions": ["typing validation", "submit", "switch to sign-in", "social sign-in"],
  "dataShape": [
    { "name": "email", "type": "string", "example": "you@company.com" },
    { "name": "password", "type": "string", "example": "********" },
    { "name": "acceptTerms", "type": "boolean", "example": true }
  ],
  "tone": "minimal"
}`;

const DESIGN_JSON = `{
  "palette": {
    "mode": "dark",
    "background": "bg-zinc-950",
    "surface": "bg-zinc-900",
    "surfaceMuted": "bg-zinc-900/60",
    "border": "border-zinc-800",
    "text": "text-zinc-100",
    "textMuted": "text-zinc-400",
    "accent": "bg-violet-500",
    "accentText": "text-white",
    "success": "text-emerald-400",
    "warn": "text-amber-400",
    "error": "text-rose-400"
  },
  "typography": {
    "display": "text-2xl font-semibold tracking-tight",
    "heading": "text-sm font-semibold",
    "body": "text-sm",
    "label": "text-xs font-medium",
    "mono": "font-mono"
  },
  "layout": {
    "container": "max-w-md mx-auto px-4",
    "gap": "gap-4",
    "radius": "rounded-lg",
    "shadow": "shadow-none",
    "density": "comfortable"
  },
  "vibe": "Minimal sign-up — focused, validated, and quietly delightful."
}`;

const REPORT_MD = `# Validation report

## Issues
- minor [src/App.tsx] inputs use real <label htmlFor> and aria-invalid + aria-describedby for errors.

## Notes
- Password checks are exposed via aria-describedby so AT users can hear strength feedback.
- Social buttons have explicit aria-label since the visible text is sufficient but icons are decorative.
`;

export const SIGNUP_FORM_FILES: SandboxFile[] = [
  { path: "/spec.json", contents: SPEC_JSON },
  { path: "/design.json", contents: DESIGN_JSON },
  { path: "/src/App.tsx", contents: APP_TSX },
  { path: "/report.md", contents: REPORT_MD },
];
