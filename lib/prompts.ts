import type { RetrievedResource } from "./retriever";

/**
 * Builds the system prompt for the Gemini LLM.
 * The prompt instructs the model to output a strict JSON object
 * representing a 12-month personalised curriculum.
 */
export function buildSystemPrompt(): string {
  return `You are PathWise AI, an expert learning-path designer.
Your job is to create a comprehensive, structured 12-month learning curriculum
based on the user's goal and the curated learning resources provided.

RULES:
1. Respond ONLY with a single valid JSON object — no markdown, no code fences, no extra text.
2. The JSON must follow EXACTLY the schema described below.
3. Distribute the resources logically across the 12 months, progressing from
   fundamentals in month 1 to advanced / application-level topics in month 12.
4. Each month must contain at least one resource.
5. Goals and milestones must be concrete and measurable.
6. Do NOT invent resources; only use the ones provided in the context.

OUTPUT SCHEMA:
{
  "title": "string – concise plan title",
  "description": "string – 2-3 sentence overview of the plan",
  "goal": "string – the original user goal",
  "months": [
    {
      "month": 1,
      "title": "string – theme for this month",
      "goals": ["string", "..."],
      "milestones": ["string", "..."],
      "resources": [
        {
          "title": "string",
          "description": "string",
          "url": "string",
          "type": "video | article | course"
        }
      ]
    }
    // ... repeat for months 2-12
  ]
}`;
}

/**
 * Builds the user prompt that contains the goal and retrieved resources.
 *
 * @param goal - The learner's stated goal
 * @param resources - Top-K resources retrieved from the vector store
 */
export function buildUserPrompt(
  goal: string,
  resources: RetrievedResource[]
): string {
  const resourceList = resources
    .map(
      (r, i) =>
        `[${i + 1}] Title: ${r.title}\n    Description: ${r.description}\n    URL: ${r.url}\n    Type: ${r.type}`
    )
    .join("\n\n");

  return `LEARNING GOAL: ${goal}

AVAILABLE RESOURCES (${resources.length} total):
${resourceList}

Please generate the 12-month curriculum JSON now.`;
}
