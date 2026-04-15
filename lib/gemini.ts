import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export function getGeminiModel(modelName = "gemini-1.5-flash"): GenerativeModel {
  return genAI.getGenerativeModel({ model: modelName });
}

export interface MonthlyBlock {
  monthNumber: number;
  topic: string;
  description: string;
  resources: string[];
}

export interface LearningRoadmap {
  title: string;
  goal: string;
  months: MonthlyBlock[];
}

/**
 * Generates a 12-month AI learning roadmap for a given goal using Gemini.
 */
export async function generateLearningRoadmap(goal: string): Promise<LearningRoadmap> {
  const model = getGeminiModel();

  const prompt = `You are an expert learning path designer. Generate a detailed 12-month learning roadmap for the following goal:

Goal: "${goal}"

Respond ONLY with a valid JSON object matching this exact schema (no markdown, no explanation):
{
  "title": "<concise plan title>",
  "goal": "<restate the goal clearly>",
  "months": [
    {
      "monthNumber": 1,
      "topic": "<topic name>",
      "description": "<2-3 sentences describing what to learn and why>",
      "resources": ["<resource title or URL>", "<resource title or URL>", "<resource title or URL>"]
    }
    // ... repeat for months 2-12
  ]
}

Rules:
- months array MUST have exactly 12 entries.
- monthNumber values must be 1 through 12.
- Each resources array must have 2-4 items (book titles, free courses, or URLs).
- Keep topics progressive — build from fundamentals to advanced.
- Return ONLY the raw JSON object, no code fences.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Strip any accidental markdown code fences
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  const roadmap = JSON.parse(cleaned) as LearningRoadmap;

  if (!Array.isArray(roadmap.months) || roadmap.months.length !== 12) {
    throw new Error("Gemini returned an invalid roadmap: expected 12 monthly blocks.");
  }

  return roadmap;
}
