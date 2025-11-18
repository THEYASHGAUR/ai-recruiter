"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full bg-white border-b">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
        {/* Left Section */}
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-semibold text-gray-900">AI Recruiter</span>
        </div>

        {/* Right Section */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-700 transition"
          >
            Resume Analyzer
          </Link>

          <Link
            href="/interview-questions"
            className="text-black font-bold hover:text-blue-700 transition"
          >
            Interview Questions
          </Link>
        </nav>
      </div>
    </header>
  );
}
