import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "@/lib/config";
import { scrapeMultipleQueries } from "@/lib/scraper";
import { embedAndUpsertResources } from "@/lib/embeddings";
import { retrieveRelevantResources } from "@/lib/retriever";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompts";

export interface MonthData {
  month: number;
  title: string;
  goals: string[];
  milestones: string[];
  resources: {
    title: string;
    description: string;
    url: string;
    type: string;
  }[];
}

export interface LearningPlanResponse {
  title: string;
  description: string;
  goal: string;
  months: MonthData[];
}

/**
 * POST /api/generate-path
 *
 * Body: { goal: string; userId: string; queries?: string[] }
 *
 * 1. Scrape YouTube for resources matching the goal
 * 2. Embed & upsert resources into Pinecone
 * 3. Retrieve the top-10 most relevant resources via similarity search
 * 4. Call Gemini to generate the 12-month curriculum JSON
 * 5. Return the structured plan to the client
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { goal, userId, queries } = body as {
      goal: string;
      userId: string;
      queries?: string[];
    };

    if (!goal || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: goal and userId" },
        { status: 400 }
      );
    }

    // Step 1: Scrape YouTube
    const searchQueries: string[] = queries ?? [goal];
    const scrapedResources = await scrapeMultipleQueries(searchQueries, 10);

    if (scrapedResources.length === 0) {
      return NextResponse.json(
        { error: "No resources found for the given goal" },
        { status: 404 }
      );
    }

    // Step 2: Embed & upsert into Pinecone
    await embedAndUpsertResources(userId, scrapedResources);

    // Step 3: Retrieve top-10 relevant resources
    const relevantResources = await retrieveRelevantResources(userId, goal, 10);

    // Step 4: Build prompts and call Gemini
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(goal, relevantResources);

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Understood. I will respond only with valid JSON following the specified schema.",
            },
          ],
        },
      ],
    });

    const result = await chat.sendMessage(userPrompt);
    // Step 5: Parse and validate the JSON
    let plan: LearningPlanResponse;
    const rawJson = result.response.text().trim();

    // Extract JSON content – Gemini sometimes wraps it in markdown fences
    const jsonMatch =
      rawJson.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
      rawJson.match(/(\{[\s\S]*\})/);

    const jsonText = jsonMatch ? jsonMatch[1].trim() : rawJson;

    try {
      plan = JSON.parse(jsonText);
    } catch {
      return NextResponse.json(
        { error: "The AI returned an invalid response. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(plan, { status: 200 });
  } catch (err) {
    console.error("[generate-path] Error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
