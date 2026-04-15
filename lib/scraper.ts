import axios from "axios";
import { config } from "./config";

export interface ScrapedResource {
  title: string;
  description: string;
  url: string;
  type: "video" | "article";
  thumbnailUrl?: string;
  publishedAt?: string;
  channelTitle?: string;
}

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: { default: { url: string } };
    publishedAt: string;
    channelTitle: string;
  };
}

interface YouTubeSearchResponse {
  items: YouTubeSearchItem[];
}

/**
 * Searches YouTube for videos matching the given query and returns
 * a list of titles, descriptions, and URLs using the YouTube Data API.
 *
 * @param query - Search query, e.g. "Japanese N5 grammar"
 * @param maxResults - Maximum number of results to return (default 10)
 */
export async function scrapeYouTube(
  query: string,
  maxResults = 10
): Promise<ScrapedResource[]> {
  const response = await axios.get<YouTubeSearchResponse>(
    "https://www.googleapis.com/youtube/v3/search",
    {
      params: {
        key: config.youtubeApiKey,
        q: query,
        part: "snippet",
        type: "video",
        maxResults,
        relevanceLanguage: "en",
        safeSearch: "moderate",
      },
    }
  );

  return response.data.items.map((item) => ({
    title: item.snippet.title,
    description: item.snippet.description,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    type: "video" as const,
    thumbnailUrl: item.snippet.thumbnails?.default?.url,
    publishedAt: item.snippet.publishedAt,
    channelTitle: item.snippet.channelTitle,
  }));
}

/**
 * Convenience wrapper that runs several queries and deduplicates results.
 *
 * @param queries - Array of search queries to execute
 * @param maxResultsPerQuery - Maximum results per query (default 5)
 */
export async function scrapeMultipleQueries(
  queries: string[],
  maxResultsPerQuery = 5
): Promise<ScrapedResource[]> {
  const allResults = await Promise.all(
    queries.map((q) => scrapeYouTube(q, maxResultsPerQuery))
  );

  const seen = new Set<string>();
  const deduplicated: ScrapedResource[] = [];

  for (const results of allResults) {
    for (const item of results) {
      if (!seen.has(item.url)) {
        seen.add(item.url);
        deduplicated.push(item);
      }
    }
  }

  return deduplicated;
}
