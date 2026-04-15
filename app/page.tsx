"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  Calendar,
  ChevronRight,
  Loader2,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

interface MonthlyBlock {
  id: string;
  monthNumber: number;
  topic: string;
  description: string;
  resources: string[];
}

interface LearningPlan {
  id: string;
  title: string;
  goal: string;
  createdAt: string;
  monthlyBlocks: MonthlyBlock[];
}

const MONTH_COLORS = [
  "from-violet-600 to-indigo-600",
  "from-indigo-600 to-blue-600",
  "from-blue-600 to-cyan-600",
  "from-cyan-600 to-teal-600",
  "from-teal-600 to-emerald-600",
  "from-emerald-600 to-green-600",
  "from-green-600 to-lime-600",
  "from-lime-600 to-yellow-600",
  "from-yellow-600 to-orange-600",
  "from-orange-600 to-red-600",
  "from-red-600 to-rose-600",
  "from-rose-600 to-pink-600",
];

function TimelineBlock({ block, index }: { block: MonthlyBlock; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const colorClass = MONTH_COLORS[index % MONTH_COLORS.length];

  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="relative flex gap-4 sm:gap-8"
    >
      {/* Timeline spine */}
      <div className="flex flex-col items-center">
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br ${colorClass} shadow-lg shadow-indigo-900/40 flex-shrink-0 z-10`}
        >
          <span className="text-white text-xs font-bold">{block.monthNumber}</span>
        </div>
        {index < 11 && (
          <div className="w-0.5 flex-1 bg-gradient-to-b from-indigo-700/50 to-transparent mt-2" />
        )}
      </div>

      {/* Card */}
      <div className="flex-1 pb-8">
        <button
          className="w-full text-left"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
        >
          <div className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 backdrop-blur-sm p-4 transition-all duration-200 hover:border-indigo-500/40 group">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-indigo-400 uppercase tracking-widest">
                  Month {block.monthNumber}
                </span>
                <h3 className="mt-0.5 text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">
                  {block.topic}
                </h3>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  expanded ? "rotate-90" : ""
                }`}
              />
            </div>
          </div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="rounded-b-xl border border-t-0 border-white/10 bg-gray-900/60 backdrop-blur-sm px-4 pb-4 pt-3">
                <p className="text-sm text-gray-300 leading-relaxed">
                  {block.description}
                </p>
                {block.resources.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">
                      Resources
                    </p>
                    <ul className="space-y-1.5">
                      {block.resources.map((res, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                          {res.startsWith("http") ? (
                            <a
                              href={res}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-300 hover:text-indigo-200 hover:underline flex items-center gap-1"
                            >
                              {res}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">{res}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<LearningPlan | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!goal.trim() || loading) return;

    setLoading(true);
    setError(null);
    setPlan(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: goal.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }

      setPlan(data.plan as LearningPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleCalendarSync() {
    if (!plan) return;
    alert(
      "Google Calendar sync coming soon!\n\nThis will create 12 calendar events — one per month — with your learning milestones."
    );
  }

  return (
    <main className="min-h-screen px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Gemini AI
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white text-balance">
            Your personalised{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              12-month
            </span>{" "}
            learning path
          </h1>

          <p className="mt-5 text-lg text-gray-400 text-balance">
            Tell us what you want to master. PathWise AI will craft a step-by-step
            curriculum tailored just for you.
          </p>
        </motion.div>

        {/* Input form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-10"
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
            <div className="relative flex flex-col sm:flex-row gap-3 bg-gray-900 rounded-2xl p-2 border border-white/10">
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Become a full-stack developer, learn machine learning, master Spanish…"
                maxLength={500}
                className="flex-1 bg-transparent px-4 py-3 text-white placeholder-gray-500 outline-none text-sm sm:text-base"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!goal.trim() || loading}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 text-sm sm:text-base whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Build my path
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}
        </motion.form>
      </div>

      {/* Timeline */}
      <AnimatePresence>
        {plan && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl mt-16"
          >
            {/* Plan header */}
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-400 uppercase tracking-widest mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                Your 12-Month Roadmap
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">{plan.title}</h2>
              <p className="mt-2 text-gray-400 text-sm">{plan.goal}</p>

              {/* Google Calendar button */}
              <button
                onClick={handleGoogleCalendarSync}
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm text-gray-300 hover:text-white transition-all duration-200"
              >
                <Calendar className="w-4 h-4 text-blue-400" />
                Sync to Google Calendar
              </button>
            </div>

            {/* Month blocks */}
            <div>
              {plan.monthlyBlocks.map((block, index) => (
                <TimelineBlock key={block.id} block={block} index={index} />
              ))}
            </div>

            {/* Footer CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-4 text-center text-xs text-gray-600"
            >
              Plan ID: {plan.id} · Saved to your local database
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
