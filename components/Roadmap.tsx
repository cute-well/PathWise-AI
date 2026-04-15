"use client";

import { useState } from "react";

export interface Resource {
  title: string;
  description: string;
  url: string;
  type: string;
}

export interface MonthData {
  month: number;
  title: string;
  goals: string[];
  milestones: string[];
  resources: Resource[];
}

export interface RoadmapProps {
  title: string;
  description: string;
  goal: string;
  months: MonthData[];
}

function ResourceBadge({ type }: { type: string }) {
  const colours: Record<string, string> = {
    video: "bg-red-100 text-red-700",
    article: "bg-blue-100 text-blue-700",
    course: "bg-purple-100 text-purple-700",
  };
  const cls = colours[type.toLowerCase()] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {type}
    </span>
  );
}

function MonthCard({ data }: { data: MonthData }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative pl-10">
      {/* Timeline connector dot */}
      <span className="absolute left-0 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-lg">
        {data.month}
      </span>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        {/* Header */}
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="flex w-full items-center justify-between text-left"
          aria-expanded={expanded}
        >
          <h3 className="text-lg font-semibold text-gray-900">
            Month {data.month}: {data.title}
          </h3>
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Collapsed preview: first goal */}
        {!expanded && data.goals.length > 0 && (
          <p className="mt-2 text-sm text-gray-500 line-clamp-1">
            {data.goals[0]}
          </p>
        )}

        {/* Expanded content */}
        {expanded && (
          <div className="mt-4 space-y-4">
            {/* Goals */}
            <section>
              <h4 className="mb-1 text-sm font-semibold uppercase tracking-wide text-indigo-600">
                Goals
              </h4>
              <ul className="space-y-1">
                {data.goals.map((goal, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-indigo-400" />
                    {goal}
                  </li>
                ))}
              </ul>
            </section>

            {/* Milestones */}
            <section>
              <h4 className="mb-1 text-sm font-semibold uppercase tracking-wide text-green-600">
                Milestones
              </h4>
              <ul className="space-y-1">
                {data.milestones.map((milestone, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {milestone}
                  </li>
                ))}
              </ul>
            </section>

            {/* Resources */}
            <section>
              <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Resources
              </h4>
              <ul className="space-y-2">
                {data.resources.map((resource, i) => (
                  <li key={i}>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-3 rounded-lg border border-gray-100 p-3 transition hover:border-indigo-200 hover:bg-indigo-50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900 group-hover:text-indigo-700">
                          {resource.title}
                        </p>
                        {resource.description && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                            {resource.description}
                          </p>
                        )}
                      </div>
                      <ResourceBadge type={resource.type} />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Roadmap component – renders an interactive vertical timeline of
 * 12 monthly learning blocks with expandable detail cards.
 */
export default function Roadmap({ title, description, goal, months }: RoadmapProps) {
  const sortedMonths = [...months].sort((a, b) => a.month - b.month);

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      {/* Plan header */}
      <div className="mb-10 text-center">
        <span className="mb-2 inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700">
          12-Month Learning Plan
        </span>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">{title}</h1>
        <p className="mt-3 text-base text-gray-600">{description}</p>
        <p className="mt-2 text-sm text-gray-400">
          Goal: <span className="font-medium text-gray-600">{goal}</span>
        </p>
      </div>

      {/* Vertical timeline */}
      <div className="relative space-y-6">
        {/* Continuous vertical line */}
        <div
          className="absolute left-4 top-0 bottom-0 w-0.5 bg-indigo-100"
          aria-hidden="true"
        />

        {sortedMonths.map((month) => (
          <MonthCard key={month.month} data={month} />
        ))}
      </div>
    </section>
  );
}
