"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/admin");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <div className="w-full max-w-sm px-6">
        <h1 className="text-editorial text-xl tracking-[0.15em] font-bold mb-8 text-center">
          SOFIA ADMIN
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-[11px] tracking-[0.1em] uppercase font-semibold mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-[var(--color-border)] px-3 py-2 text-[13px] bg-transparent focus:border-2 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[11px] tracking-[0.1em] uppercase font-semibold mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-[var(--color-border)] px-3 py-2 text-[13px] bg-transparent focus:border-2 focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-[var(--color-error)] text-[12px]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-[var(--color-border)] py-3 text-editorial-sm text-[12px] tracking-[0.15em] bg-[var(--color-primary)] text-[var(--color-background)] hover:bg-transparent hover:text-[var(--color-primary)] transition-colors min-h-[44px]"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
