import { queryVectors } from "./vectorStore";
import { embedText } from "./embeddings";
import type { ScrapedResource } from "./scraper";

export interface RetrievedResource extends ScrapedResource {
  relevanceScore: number;
  vectorId: string;
}

/**
 * Performs a similarity search in Pinecone based on a user's learning goal
 * and returns the top 10 most relevant resources from their namespace.
 *
 * @param userId - User whose namespace will be searched
 * @param goal - The learning goal to use as the query (e.g. "Learn Japanese N5")
 * @param topK - Number of results to return (default 10)
 * @returns Array of relevant resources ordered by similarity score
 */
export async function retrieveRelevantResources(
  userId: string,
  goal: string,
  topK = 10
): Promise<RetrievedResource[]> {
  // 1. Embed the user's goal into a query vector
  const queryVector = await embedText(goal);

  // 2. Query Pinecone for the most similar vectors in the user's namespace
  const result = await queryVectors(userId, queryVector, topK);

  // 3. Map matches back into a typed resource list
  return (result.matches ?? [])
    .filter((match) => match.metadata)
    .map((match) => {
      const meta = match.metadata as {
        url: string;
        title: string;
        type: string;
        text: string;
      };

      return {
        title: meta.title ?? "",
        description: meta.text ?? "",
        url: meta.url ?? "",
        type: (meta.type as "video" | "article") ?? "article",
        relevanceScore: match.score ?? 0,
        vectorId: match.id,
      };
    });
}
