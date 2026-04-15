import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { v4 as uuidv4 } from "uuid";
import { config } from "./config";
import { cleanAndMerge } from "./cleaner";
import { upsertVectors, type VectorRecord } from "./vectorStore";
import type { ScrapedResource } from "./scraper";

let embeddingsModel: GoogleGenerativeAIEmbeddings | null = null;

/**
 * Returns a singleton instance of the Gemini embeddings model.
 */
function getEmbeddingsModel(): GoogleGenerativeAIEmbeddings {
  if (!embeddingsModel) {
    embeddingsModel = new GoogleGenerativeAIEmbeddings({
      apiKey: config.geminiApiKey,
      modelName: "embedding-001",
    });
  }
  return embeddingsModel;
}

/**
 * Converts a single string into a Gemini embedding vector.
 *
 * @param text - Clean text to embed
 * @returns Array of floating-point numbers representing the embedding
 */
export async function embedText(text: string): Promise<number[]> {
  const model = getEmbeddingsModel();
  return model.embedQuery(text);
}

/**
 * Converts an array of strings into embedding vectors in one batch call.
 *
 * @param texts - Clean texts to embed
 * @returns Array of embedding vectors (same order as input)
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const model = getEmbeddingsModel();
  return model.embedDocuments(texts);
}

/**
 * Takes scraped resources, cleans the text, generates embeddings using the
 * Gemini model, and upserts them into Pinecone under the user's namespace.
 *
 * @param userId - Target user / Pinecone namespace
 * @param resources - Raw scraped resources
 */
export async function embedAndUpsertResources(
  userId: string,
  resources: ScrapedResource[]
): Promise<void> {
  if (resources.length === 0) return;

  // 1. Build clean text for each resource
  const texts = resources.map((r) => cleanAndMerge([r.title, r.description]));

  // 2. Embed in one batch
  const embeddings = await embedTexts(texts);

  // 3. Build VectorRecord array
  const vectors: VectorRecord[] = resources.map((resource, i) => ({
    id: uuidv4(),
    values: embeddings[i],
    metadata: {
      url: resource.url,
      title: resource.title,
      type: resource.type,
      userId,
      text: texts[i],
    },
  }));

  // 4. Upsert into Pinecone
  await upsertVectors(userId, vectors);
}
