"use client";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
export default function Login() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
    setLoading(false);
    if (!response.ok) {
      setError("The email or password is incorrect.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }
  return (
    <main className="login-page">
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
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Enter your password"
            />
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
