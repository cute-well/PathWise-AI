import { NextRequest, NextResponse } from "next/server";
import { generateLearningRoadmap } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { goal, userId } = body as { goal: string; userId?: string };

    if (!goal || typeof goal !== "string" || goal.trim().length === 0) {
      return NextResponse.json(
        { error: "A non-empty goal string is required." },
        { status: 400 }
      );
    }

    if (goal.trim().length > 500) {
      return NextResponse.json(
        { error: "Goal must be 500 characters or fewer." },
        { status: 400 }
      );
    }

    // 1. Generate roadmap via Gemini
    const roadmap = await generateLearningRoadmap(goal.trim());

    // 2. Persist plan + monthly blocks in SQLite via Prisma
    const plan = await prisma.learningPlan.create({
      data: {
        title: roadmap.title,
        goal: roadmap.goal,
        ...(userId ? { userId } : {}),
        monthlyBlocks: {
          create: roadmap.months.map((m) => ({
            monthNumber: m.monthNumber,
            topic: m.topic,
            description: m.description,
            resources: JSON.stringify(m.resources),
          })),
        },
      },
      include: {
        monthlyBlocks: {
          orderBy: { monthNumber: "asc" },
        },
      },
    });

    // 3. Return the saved plan with parsed resources
    return NextResponse.json({
      success: true,
      plan: {
        ...plan,
        monthlyBlocks: plan.monthlyBlocks.map((b) => ({
          ...b,
          resources: JSON.parse(b.resources) as string[],
        })),
      },
    });
  } catch (error: unknown) {
    console.error("[/api/generate] Error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "AI returned malformed JSON. Please try again." },
        { status: 502 }
      );
    }

    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
