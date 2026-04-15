import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PathWise AI — Your 12-Month Learning Roadmap",
  description:
    "AI-powered learning path generator. Enter your goal and get a personalised 12-month curriculum in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans bg-gray-950 text-gray-100 antialiased">
        {children}
      </body>
    </html>
  );
}
