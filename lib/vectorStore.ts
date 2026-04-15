import { Pinecone, type Index, type PineconeRecord } from "@pinecone-database/pinecone";
import { config } from "./config";

let pineconeClient: Pinecone | null = null;

/**
 * Returns a singleton Pinecone client instance.
 */
export function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: config.pineconeApiKey,
    });
  }
  return pineconeClient;
}

/**
 * Returns a reference to the configured Pinecone index.
 */
export async function getPineconeIndex(): Promise<Index> {
  const client = getPineconeClient();
  return client.index(config.pineconeIndexName);
}

/**
 * Creates a namespace for a specific user within the Pinecone index.
 * In Pinecone, namespaces isolate vectors per tenant without creating
 * a separate index, which keeps costs low.
 *
 * @param userId - Unique user identifier used as the namespace name
 * @returns The namespaced index ready for upsert / query operations
 */
export async function getUserNamespace(userId: string): Promise<Index> {
  const index = await getPineconeIndex();
  return index.namespace(userId);
}

export interface VectorRecord {
  id: string;
  values: number[];
  metadata: {
    url: string;
    title: string;
    type: string;
    relevance?: number;
    userId: string;
    text: string;
  };
}

/**
 * Upserts a batch of pre-computed vectors into the user's namespace.
 *
 * @param userId - The user's ID (namespace)
 * @param vectors - Array of vector records to upsert
 */
export async function upsertVectors(
  userId: string,
  vectors: VectorRecord[]
): Promise<void> {
  const ns = await getUserNamespace(userId);
  // Pinecone recommends batches of ≤100
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch: PineconeRecord[] = vectors.slice(i, i + batchSize).map((v) => ({
      id: v.id,
      values: v.values,
      metadata: v.metadata,
    }));
    await ns.upsert({ records: batch });
  }
}

/**
 * Queries a user's namespace for the top-k most similar vectors.
 *
 * @param userId - The user's ID (namespace)
 * @param queryVector - The embedding to search against
 * @param topK - Number of results to return (default 10)
 */
export async function queryVectors(
  userId: string,
  queryVector: number[],
  topK = 10
) {
  const ns = await getUserNamespace(userId);
  return ns.query({
    vector: queryVector,
    topK,
    includeMetadata: true,
  });
}

/**
 * Deletes all vectors in a user's namespace.
 * Useful when regenerating a plan from scratch.
 *
 * @param userId - The user's ID (namespace)
 */
export async function clearUserNamespace(userId: string): Promise<void> {
  const ns = await getUserNamespace(userId);
  await ns.deleteAll();
}
