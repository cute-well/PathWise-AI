"use client";

import { useState } from "react";
import Roadmap from "./Roadmap";
import type { LearningPlanResponse } from "@/app/api/generate-path/route";

export default function PathwiseForm() {
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<LearningPlanResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!goal.trim()) return;

    setLoading(true);
    setError(null);
    setPlan(null);

    try {
      const res = await fetch("/api/generate-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: goal.trim(),
          // TODO: Replace with the authenticated user's ID once NextAuth is wired up.
          // Using a per-session placeholder in the meantime to avoid cross-user data leakage.
          userId: `demo-${typeof window !== "undefined" ? btoa(goal.trim()).slice(0, 8) : "user"}`,
          queries: [goal.trim()],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? `Request failed with status ${res.status}`);
      }

      const data: LearningPlanResponse = await res.json();
      setPlan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
      >
        <label
          htmlFor="goal"
          className="block text-sm font-semibold text-gray-700"
        >
          What do you want to learn?
        </label>
        <div className="mt-2 flex gap-3">
          <input
            id="goal"
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder='e.g. "Learn Japanese N5" or "Master React in 12 months"'
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !goal.trim()}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Generating…
              </span>
            ) : (
              "Generate Plan"
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          PathWise AI will scrape YouTube, embed resources, and craft a
          personalised 12-month curriculum just for you.
        </p>
      </form>

      {/* Error state */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Result */}
      {plan && (
        <div className="mt-10">
          <Roadmap
            title={plan.title}
            description={plan.description}
            goal={plan.goal}
            months={plan.months}
          />
        </div>
      )}
    </div>
  );
}
