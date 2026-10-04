"use client";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
export default function Login() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const values = Object.fromEntries(new FormData(e.currentTarget));
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const result = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    setLoading(false);
    if (!response.ok) {
      setError(
        response.status === 429
          ? result.error || "Too many sign-in attempts. Please try again later."
          : "The email or password is incorrect.",
      );
      return;
    }
    router.push("/admin");
    router.refresh();
  }
  return (
    <main className="login-page">
      <div className="login-theme">
        <ThemeToggle />
      </div>
      <div className="login-visual">
        <Link href="/">
          <Image
            src="/images/cedah-logo.png"
            alt="CEDAH"
            width={320}
            height={106}
          />
        </Link>
        <div>
          <span>CEDAH COMMAND CENTRE</span>
          <h1>
            Manage growth.
            <br />
            Measure impact.
          </h1>
          <p>
            One secure workspace for content, enterprises, enquiries and
            organisational performance.
          </p>
        </div>
        <small>Capital Economic Development Alliance Holdings Ltd.</small>
      </div>
      <div className="login-panel">
        <form onSubmit={submit}>
          <div className="login-mark">
            <Image src="/icon.png" alt="CEDAH mark" width={58} height={58} />
          </div>
          <span className="admin-kicker">Secure administration</span>
          <h2>Welcome back</h2>
          <p>Sign in to manage the CEDAH platform.</p>
          <label>
            Email address
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              placeholder="name@cedah.com"
            />
          </label>
          <label>
            Password
            <span className="password-field">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                title={showPassword ? "Hide password" : "Show password"}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  {showPassword ? (
                    <>
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.2A10.8 10.8 0 0 1 12 4c5.4 0 9 5 9 5a16 16 0 0 1-2.1 2.5M6.6 6.7C4.4 8.2 3 10 3 10s3.6 5 9 5c1 0 2-.2 2.9-.5" />
                    </>
                  ) : (
                    <>
                      <path d="M3 12s3.6-5 9-5 9 5 9 5-3.6 5-9 5-9-5-9-5Z" />
                      <circle cx="12" cy="12" r="2.4" />
                    </>
                  )}
                </svg>
              </button>
            </span>
          </label>
          {error && <div className="login-error">{error}</div>}
          <button disabled={loading}>
            {loading ? "Signing in…" : "Sign in to dashboard"}
            <span>→</span>
          </button>
          <Link href="/">← Return to website</Link>
        </form>
      </div>
    </main>
  );
}
