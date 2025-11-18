"use client";

import Header from "@/components/header";
import { useState } from "react";

export default function InterviewInsights() {
  const [jdText, setJdText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    if (!jdText.trim()) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert("Interview insights would be displayed here!");
    }, 2000);
  };

  return (
    <>
    <Header />
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-slate-50 to-gray-100 px-4 py-16 md:py-24 relative overflow-hidden">
        {/* Animated background elements */}
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
              Get interview experiences, commonly asked questions, and insider
              tips. Just paste the JD for which you want to apply.
            </p>
          </header>

          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-500 animate-[slideUp_0.8s_ease-out_0.2s_both]">
            <div className="space-y-6">
              {/* Input Section */}
              <div>
                <label
                  htmlFor="job-description"
                  className="block text-base font-semibold text-slate-900 mb-3"
                >
                  Job Description
                </label>
                <div
                  className={`relative transition-all duration-300 ${
                    isFocused ? "transform scale-[1.01]" : ""
                  }`}
                >
                  <textarea
                    id="job-description"
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Paste the complete job description here..."
                    className="w-full h-64 px-5 py-4 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 text-sm leading-relaxed resize-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 outline-none transition-all duration-300 bg-white/50"
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
                onClick={handleSubmit}
                disabled={isLoading || !jdText.trim()}
                className="group relative w-full bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Button content */}
                <span className="relative flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 group-hover:scale-110 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <span className="group-hover:tracking-wide transition-all duration-300">
                        Find Interview Insights
                      </span>
                      <svg
                        className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </>
                  )}
                </span>

                {/* Ripple effect on click */}
                <span className="absolute inset-0 rounded-2xl">
                  <span className="absolute inset-0 animate-[ping_1s_cubic-bezier(0,0,0.2,1)] bg-white/20 rounded-2xl opacity-0 group-active:opacity-100" />
                </span>
              </button>
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-200">
              {[
                {
                  icon: "💼",
                  title: "Real Experiences",
                  desc: "Learn from actual candidates",
                },
                {
                  icon: "❓",
                  title: "Common Questions",
                  desc: "Frequently asked in interviews",
                },
                {
                  icon: "💡",
                  title: "Insider Tips",
                  desc: "Expert advice and strategies",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group p-4 rounded-xl bg-linear-to-br from-slate-50 to-blue-50/30 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 cursor-pointer animate-[fadeIn_0.8s_ease-out] hover:-translate-y-1"
                  style={{
                    animationDelay: `${0.4 + i * 0.1}s`,
                    animationFillMode: "both",
                  }}
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes float {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }

          @keyframes pulse {
            0%,
            100% {
              opacity: 0.3;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}</style>
      </div>
    </>
  );
}
