import PathwiseForm from "@/components/PathwiseForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="mx-auto max-w-4xl px-4 py-16">
        {/* Hero */}
        <div className="mb-12 text-center">
          <span className="mb-4 inline-block rounded-full bg-indigo-100 px-4 py-1 text-sm font-semibold text-indigo-700">
            AI-Powered Learning Paths
          </span>
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
            PathWise{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AI
            </span>
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Tell us your learning goal. We&apos;ll build a personalised
            12-month curriculum powered by Gemini AI and curated YouTube
            resources.
          </p>
        </div>

        {/* Main form / roadmap panel */}
        <PathwiseForm />
      </div>
    </main>
  );
}
