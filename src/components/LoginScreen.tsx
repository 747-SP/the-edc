"use client";

import { useState, FormEvent } from "react";

export default function LoginScreen() {
  const [did, setDid] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ did, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Reload to trigger auth state change
      window.location.reload();
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 w-full items-center justify-center p-8">
      <form
        onSubmit={handleSubmit}
            className="w-full max-w-sm space-y-6 bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8 border border-zinc-200 dark:border-zinc-800"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            The EDC
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Everyday Carry &middot; Bluesky
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="did"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Bluesky DID
            </label>
            <input
              id="did"
              type="text"
              required
              value={did}
              onChange={(e) => setDid(e.target.value)}
              placeholder="user.bsky.social"
              className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              App Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="xxxx xxxx xxxx xxxx"
              className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-500"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-4 py-2.5 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-xs text-center text-zinc-400 dark:text-zinc-500">
          App passwords are created in Bluesky Settings &gt; Account &gt; App Passwords
        </p>
      </form>
    </div>
  );
}
