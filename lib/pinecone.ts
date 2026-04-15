import { Pinecone } from "@pinecone-database/pinecone";

let _client: Pinecone | null = null;

function getPineconeClient(): Pinecone {
  if (!process.env.PINECONE_API_KEY) {
    throw new Error("PINECONE_API_KEY environment variable is not set.");
  }
  if (!_client) {
    _client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  }
  return _client;
}

export interface RoadmapVector {
  id: string;
  values: number[];
  metadata: {
    planId: string;
    monthNumber: number;
    topic: string;
    description: string;
  };
}

/**
 * Upsert monthly block embeddings for a learning plan into Pinecone.
 * @param indexName  - Name of the Pinecone index (must already exist with correct dimension)
 * @param vectors    - Array of vectors to upsert
 */
export async function upsertPlanVectors(
  indexName: string,
  vectors: RoadmapVector[]
): Promise<void> {
  const client = getPineconeClient();
  const index = client.index(indexName);
  await index.upsert(vectors);
}

/**
 * Query Pinecone for the most relevant monthly blocks for a given query embedding.
 * @param indexName      - Name of the Pinecone index
 * @param queryVector    - Dense embedding of the user query
 * @param topK           - Number of results to return
 * @param filterPlanId   - Optional: limit results to a specific plan
 */
export async function queryPlanVectors(
  indexName: string,
  queryVector: number[],
  topK = 5,
  filterPlanId?: string
) {
  const client = getPineconeClient();
  const index = client.index(indexName);

  const queryOptions: Parameters<typeof index.query>[0] = {
    vector: queryVector,
    topK,
    includeMetadata: true,
  };

  if (filterPlanId) {
    queryOptions.filter = { planId: { $eq: filterPlanId } };
  }

  const result = await index.query(queryOptions);
  return result.matches ?? [];
}
