"use client";

import { useState } from "react";

export default function InterviewInsights() {
  const [jdText, setJdText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [output, setOutput] = useState(""); // RESPONSE FROM BACKEND

  // For info cards
  const insights = [
    {
      icon: "📘",
      title: "Real Experiences",
      desc: "Learn from actual candidates",
    },
    {
      icon: "❓",
      title: "Common Questions",
      desc: "Frequently asked interview questions",
    },
    {
      icon: "💡",
      title: "Insider Tips",
      desc: "Strategies and hidden info",
    },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!jdText.trim()) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("jd_text", jdText);

      const response = await fetch("http://127.0.0.1:8000/interview-questions", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log(data);

      if (data.success) {
        setOutput(data.insights);
      } else {
        setOutput("Something went wrong!");
      }
    } catch (err) {
      console.error(err);
      setOutput("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>

      <div className="min-h-screen bg-linear-to-br from-gray-50 via-slate-50 to-gray-100 px-4 py-16 md:py-24 relative overflow-hidden">

        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/5 rounded-full blur-3xl animate-[float_6s_ease-in-out_infinite]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite_2s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/3 rounded-full blur-3xl animate-[pulse_10s_ease-in-out_infinite]" />
        </div>

        <div className="max-w-4xl mx-auto relative">

          {/* Header */}
          <header className="text-center mb-12 space-y-4 animate-[fadeIn_0.8s_ease-out]">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight">
              Get Past Interview Questions & Experiences
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Get interview experiences, questions, and insider tips. Paste the JD.
            </p>
          </header>

          {/* Card */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-8 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-500">

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Input */}
              <div>
                <label className="block text-base font-semibold text-slate-900 mb-3">
                  Job Description
                </label>

                <div className={`relative transition-all duration-300 ${isFocused ? "scale-[1.01]" : ""}`}>
                  <textarea
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Paste the complete job description here..."
                    className="w-full h-64 px-5 py-4 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 text-sm leading-relaxed resize-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 outline-none bg-white/50"
                  />

                  {jdText.length > 0 && (
                    <div className="absolute bottom-4 right-4 text-xs text-slate-400 bg-white/90 px-2 py-1 rounded-lg">
                      {jdText.length} characters
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !jdText.trim()}
                className="group relative w-full bg-linear-to-r from-cyan-500 to-blue-500 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg transition-all disabled:opacity-50"
              >
                <span className="relative flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>Find Interview Insights →</>
                  )}
                </span>
              </button>
            </form>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-200">
              {insights.map((item, index) => (
                <div
                  key={index}
                  className="group p-4 rounded-xl bg-linear-to-br from-slate-50 to-blue-50/30 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* OUTPUT SECTION */}
            {output && (
              <div className="mt-10 p-6 bg-white border border-slate-200 rounded-2xl shadow">
                <h2 className="font-bold text-xl mb-4 text-slate-900">Interview Insights</h2>
                <pre className="whitespace-pre-wrap text-sm text-slate-700">{output}</pre>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
