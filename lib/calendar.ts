import { google } from "googleapis";
import { config } from "./config";

// Local type definition to avoid requiring a live database for compilation
interface MonthlyBlockWithResources {
  id: string;
  month: number;
  title: string;
  goals: string[];
  milestones: string[];
  calendarEventId?: string | null;
  resources?: { title: string; url: string }[];
}

/** Google Calendar color ID for "blueberry" */
const CALENDAR_COLOR_BLUEBERRY = "9";

/**
 * Creates an authenticated Google Calendar API client using OAuth 2.0
 * credentials stored in environment variables.
 */
function getCalendarClient() {
  const oauth2Client = new google.auth.OAuth2(
    config.googleClientId,
    config.googleClientSecret,
    config.googleRedirectUri
  );

  oauth2Client.setCredentials({
    refresh_token: config.googleRefreshToken,
  });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

/**
 * Creates a Google Calendar event for a single monthly block.
 *
 * @param calendar - Authenticated Calendar API client
 * @param block - The monthly block data
 * @param planStartDate - The start date of the overall learning plan
 * @returns The created event ID
 */
async function createMonthlyEvent(
  calendar: ReturnType<typeof getCalendarClient>,
  block: MonthlyBlockWithResources,
  planStartDate: Date
): Promise<string | null> {
  // Calculate the start and end dates for this month's block
  const startDate = new Date(planStartDate);
  startDate.setMonth(startDate.getMonth() + block.month - 1);

  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(endDate.getDate() - 1);

  const goalsText = block.goals.map((g: string) => `• ${g}`).join("\n");
  const milestonesText = block.milestones.map((m: string) => `✓ ${m}`).join("\n");

  const description = [
    `Month ${block.month}: ${block.title}`,
    "",
    "GOALS:",
    goalsText,
    "",
    "MILESTONES:",
    milestonesText,
  ].join("\n");

  const event = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: `PathWise AI – Month ${block.month}: ${block.title}`,
      description,
      start: {
        date: startDate.toISOString().split("T")[0],
      },
      end: {
        date: endDate.toISOString().split("T")[0],
      },
      colorId: CALENDAR_COLOR_BLUEBERRY,
    },
  });

  return event.data.id ?? null;
}

/**
 * Iterates through all 12 MonthlyBlocks and creates a corresponding
 * Google Calendar event for each one, then returns the event IDs.
 *
 * @param blocks - Array of MonthlyBlock records (should contain 12 items)
 * @param planStartDate - When the learning plan begins (defaults to today)
 * @returns Map of monthlyBlockId → calendarEventId
 */
export async function syncPlanToCalendar(
  blocks: MonthlyBlockWithResources[],
  planStartDate: Date = new Date()
): Promise<Map<string, string>> {
  const calendar = getCalendarClient();
  const eventMap = new Map<string, string>();

  for (const block of blocks) {
    const eventId = await createMonthlyEvent(calendar, block, planStartDate);
    if (eventId) {
      eventMap.set(block.id, eventId);
    }
  }

  return eventMap;
}
