/**
 * Centralised environment-variable configuration.
 * Values are read lazily so the module can be imported at build time
 * without throwing on missing variables.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

/**
 * All environment-variable accessors are wrapped in getters so the values
 * are resolved at call-time (runtime), not at module-load time (build time).
 */
export const config = {
  // Database
  get databaseUrl() { return requireEnv("DATABASE_URL"); },

  // Google Gemini API
  get geminiApiKey() { return requireEnv("GEMINI_API_KEY"); },

  // Pinecone
  get pineconeApiKey() { return requireEnv("PINECONE_API_KEY"); },
  get pineconeEnvironment() { return optionalEnv("PINECONE_ENVIRONMENT"); },
  get pineconeIndexName() { return optionalEnv("PINECONE_INDEX_NAME", "pathwise-ai"); },

  // YouTube Data API
  get youtubeApiKey() { return requireEnv("YOUTUBE_API_KEY"); },

  // Google Calendar OAuth 2.0
  get googleClientId() { return requireEnv("GOOGLE_CLIENT_ID"); },
  get googleClientSecret() { return requireEnv("GOOGLE_CLIENT_SECRET"); },
  get googleRedirectUri() {
    return optionalEnv(
      "GOOGLE_REDIRECT_URI",
      "http://localhost:3000/api/auth/callback/google"
    );
  },
  get googleRefreshToken() { return optionalEnv("GOOGLE_REFRESH_TOKEN"); },

  // App
  get appUrl() { return optionalEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"); },
};

export type Config = typeof config;
