"use client";

import { useState, useEffect, useRef } from "react";
import {
  FileText,
  User,
  Sparkles,
  Mic,
  X,
  Upload,
  Clock,
  Briefcase,
  Check,
  ChevronDown,
} from "lucide-react";

export default function AIInterview() {
  const [screen, setScreen] = useState(1);
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [timer, setTimer] = useState(0);
//   const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");

  // Custom Dropdown States
  const [duration, setDuration] = useState("15 min");
  const [isDurationOpen, setIsDurationOpen] = useState(false);

  const [interviewType, setInterviewType] = useState("Technical Round");
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  const durationOptions = ["10 min", "15 min", "30 min"];
  const interviewTypeOptions = [
    "Technical Round",
    "Behavioural Round",
    "Coding Round",
    "HR Round",
  ];

  // Refs to detect outside clicks
  const durationRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        durationRef.current &&
        !durationRef.current.contains(event.target as Node)
      ) {
        setIsDurationOpen(false);
      }
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setIsTypeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Timer effect
  useEffect(() => {
    if (screen === 3) {
      const interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [screen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleFileRead = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setResume(e.target?.result as string);
      setFileName(file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (
      file &&
      (file.type.includes("text") || file.type === "application/pdf")
    ) {
      handleFileRead(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileRead(file);
  };

  const handleStartInterview = () => {
    if (jobDescription && resume) {
      setScreen(2);
      setTimeout(() => {
        setCurrentQuestion("Tell me about yourself and your experience...");
        setScreen(3);
      }, 3000);
    }
  };

  const handleEndSession = () => {
    setScreen(1);
    setTimer(0);
    setCurrentQuestion("");
    setJobDescription("");
    setResume("");
    setFileName("");
    setDuration("15 min");
    setInterviewType("Technical Round");
  };

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl">
          {screen === 1 && (
            <div className="mx-auto animate-fade-in">
              <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="text-center py-10 px-8">
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                    AI Mock Interview
                  </h1>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    Practice your interview skills with our AI interviewer.
                    Paste your JD and resume to get personalized questions.
                  </p>
                </div>

                {/* Dropdowns */}
                <div className="px-10 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                    {/* Duration Dropdown */}
                    <div ref={durationRef} className="relative">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Clock className="w-4 h-4 text-cyan-600" />
                        Duration
                      </label>
                      <button
                        onClick={() => setIsDurationOpen(!isDurationOpen)}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between hover:bg-gray-100 transition-all"
                      >
                        <span className="text-gray-900">{duration}</span>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            isDurationOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isDurationOpen && (
                        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                          {durationOptions.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => {
                                setDuration(opt);
                                setIsDurationOpen(false);
                              }}
                              className={`w-full px-5 py-3.5 text-left flex items-center justify-between hover:bg-gray-50 transition-all ${
                                duration === opt ? "bg-green-50" : ""
                              }`}
                            >
                              <span className="text-gray-800">{opt}</span>
                              {duration === opt && (
                                <Check className="w-5 h-5 text-green-600" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Interview Type Dropdown */}
                    <div ref={typeRef} className="relative">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Briefcase className="w-4 h-4 text-cyan-600" />
                        Interview Type
                      </label>
                      <button
                        onClick={() => setIsTypeOpen(!isTypeOpen)}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between hover:bg-gray-100 transition-all"
                      >
                        <span className="text-gray-900">{interviewType}</span>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            isTypeOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isTypeOpen && (
                        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                          {interviewTypeOptions.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => {
                                setInterviewType(opt);
                                setIsTypeOpen(false);
                              }}
                              className={`w-full px-5 py-3.5 text-left flex items-center justify-between hover:bg-gray-50 transition-all ${
                                interviewType === opt ? "bg-green-50" : ""
                              }`}
                            >
                              <span className="text-gray-800">{opt}</span>
                              {interviewType === opt && (
                                <Check className="w-5 h-5 text-green-600" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* JD and Resume */}
                <div className="grid md:grid-cols-2 gap-8 px-10 pb-10">
                  {/* Job Description */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Job Description
                      </h2>
                    </div>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job description here..."
                      className="w-full h-64 p-5 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    />
                  </div>

                  {/* Resume */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-cyan-600" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Your Resume
                      </h2>
                    </div>

                    {!resume ? (
                      /* Upload Area */
                      <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`relative h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                          isDragging
                            ? "border-cyan-500 bg-cyan-50"
                            : "border-gray-300 bg-gray-50 hover:border-cyan-400 hover:bg-cyan-50/30"
                        }`}
                      >
                        <input
                          type="file"
                          accept=".txt,.pdf"
                          onChange={handleFileInput}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Upload
                          className={`w-12 h-12 mb-4 ${
                            isDragging ? "text-cyan-600" : "text-gray-400"
                          }`}
                        />
                        <p className="text-gray-700 font-medium">
                          Drag & drop your resume
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          or click to browse
                        </p>
                        <p className="text-gray-400 text-xs mt-2">
                          Supports TXT, PDF files
                        </p>
                      </div>
                    ) : (
                      /* Uploaded File Chip - Clean & Minimal */
                      <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-cyan-200 rounded-lg flex items-center justify-center">
                              <FileText className="w-4 h-4 text-cyan-700" />
                            </div>
                            <span className="text-cyan-900 font-medium truncate max-w-xs">
                              {fileName || "Resume uploaded"}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setResume("");
                              setFileName("");
                            }}
                            className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Start Button */}
                <div className="px-10 pb-12 text-center">
                  <button
                    onClick={handleStartInterview}
                    disabled={!jobDescription || !resume}
                    className="inline-flex items-center gap-3 px-12 py-5 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-xl rounded-full shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Sparkles className="w-6 h-6" />
                    Start AI Interview
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Other screens (2 and 3) remain the same */}
          {screen === 2 && (
            <div className="text-center animate-fade-in">
              <div className="w-32 h-32 mx-auto bg-linear-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-24 h-24 bg-linear-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-white animate-spin-slow" />
                </div>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mt-8 mb-4">
                Preparing Your Interview
              </h2>
              <p className="text-gray-600 text-lg">Analyzing your inputs...</p>
            </div>
          )}

          {screen === 3 && (
            <div className="w-full max-w-4xl mx-auto animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl p-10 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Mock Interview Session
                </h2>
                <div className="text-2xl font-mono text-gray-600 mb-8">
                  {formatTime(timer)}
                </div>
                <div className="bg-linear-to-r from-gray-50 to-gray-100 rounded-xl p-8 max-w-3xl mx-auto">
                  <p className="text-xl text-gray-800">
                    &quot;{currentQuestion}&quot;
                  </p>
                </div>
                <div className="flex justify-center gap-6 mt-10">
                  <button className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center shadow-lg">
                    <Mic className="w-8 h-8 text-white" />
                  </button>
                  <button
                    onClick={handleEndSession}
                    className="px-8 py-4 bg-white border border-gray-300 rounded-full font-medium hover:bg-gray-50"
                  >
                    End session
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
