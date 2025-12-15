"use client";

import { useState, useEffect } from "react";
import { FileText, User, Sparkles, Mic, Edit3, X, Upload } from "lucide-react";

export default function AIInterview() {
  const [screen, setScreen] = useState(1);
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [timer, setTimer] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");

  // Timer effect for interview screen
  useEffect(() => {
    if (screen === 3) {
      const interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [screen]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleFileRead = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setResume(e.target.result);
      setFileName(file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (
      file &&
      (file.type === "text/plain" ||
        file.type === "application/pdf" ||
        file.name.endsWith(".txt"))
    ) {
      handleFileRead(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileRead(file);
    }
  };

  const handleStartInterview = () => {
    if (jobDescription && resume) {
      setScreen(2);
      setTimeout(() => {
        setCurrentQuestion(
          "Tell me about yourself and your experience with the technologies mentioned in your resume."
        );
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
  };

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 opacity-20">
            <div className="flex gap-2">
              <div className="w-8 h-24 bg-blue-300 rounded-sm transform -rotate-12"></div>
              <div className="w-8 h-20 bg-cyan-300 rounded-sm"></div>
              <div className="w-8 h-24 bg-gray-300 rounded-sm transform rotate-12"></div>
              <div className="w-8 h-28 bg-yellow-200 rounded-sm"></div>
            </div>
          </div>

          <div className="absolute top-64 left-20 opacity-20">
            <div className="w-20 h-8 bg-orange-200 rounded-full"></div>
            <div className="w-16 h-6 bg-rose-200 rounded-full ml-2 mt-1"></div>
          </div>

          <div className="absolute bottom-20 left-16 opacity-20">
            <div className="w-32 h-24 bg-gray-300 rounded-lg"></div>
            <div className="w-36 h-2 bg-gray-400 rounded-full mx-auto mt-1"></div>
          </div>

          <div className="absolute top-32 right-20 opacity-20">
            <div className="w-28 h-28 border-4 border-cyan-300 rounded-lg p-2">
              <div className="w-full h-full bg-linear-to-br from-blue-200 to-cyan-200 rounded"></div>
            </div>
          </div>

          <div className="absolute top-80 right-32 opacity-20">
            <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
          </div>

          <div className="absolute bottom-32 right-16 opacity-20">
            <div className="flex gap-2">
              <div className="w-16 h-32 bg-green-300 rounded-full transform rotate-12"></div>
              <div className="w-20 h-36 bg-emerald-300 rounded-full"></div>
            </div>
          </div>

          <div className="absolute bottom-20 right-48 opacity-20">
            <div className="flex gap-1">
              <div className="w-6 h-20 bg-blue-200 rounded-sm"></div>
              <div className="w-6 h-16 bg-yellow-200 rounded-sm"></div>
              <div className="w-6 h-20 bg-gray-300 rounded-sm"></div>
            </div>
          </div>

          <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-blue-100 rounded-full opacity-30 blur-2xl"></div>
          <div className="absolute bottom-1/4 right-1/3 w-40 h-40 bg-green-100 rounded-full opacity-30 blur-2xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl">
          {screen === 1 && (
            <div className="w-full max-w-5xl mx-auto animate-fade-in">
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-gray-900 mb-4">
                  AI Mock Interview
                </h1>
                <p className="text-gray-600 text-lg">
                  Practice your interview skills with our AI interviewer. Paste
                  your JD and resume to get personalized questions.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-4">
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
                    className="w-full h-64 p-4 text-black bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-cyan-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Your Resume
                    </h2>
                  </div>

                  {!resume ? (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={`relative h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                        isDragging
                          ? "border-cyan-500 bg-cyan-50"
                          : "border-gray-300 bg-gray-50 hover:border-cyan-400 hover:bg-cyan-50/50"
                      }`}
                    >
                      <input
                        type="file"
                        id="resume-upload"
                        accept=".txt,.pdf,text/plain,application/pdf"
                        onChange={handleFileInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center gap-3 pointer-events-none">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                            isDragging ? "bg-cyan-500" : "bg-gray-200"
                          }`}
                        >
                          <Upload
                            className={`w-8 h-8 transition-colors ${
                              isDragging ? "text-white" : "text-gray-400"
                            }`}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-gray-700 font-medium mb-1">
                            {isDragging
                              ? "Drop your resume here"
                              : "Drag & drop your resume"}
                          </p>
                          <p className="text-gray-500 text-sm">
                            or click to browse
                          </p>
                          <p className="text-gray-400 text-xs mt-2">
                            Supports TXT, PDF files
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-64">
                      <div className="absolute top-2 right-2 z-10">
                        <button
                          onClick={() => {
                            setResume("");
                            setFileName("");
                          }}
                          className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-110"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      {fileName && (
                        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 mb-3 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-cyan-600" />
                          <span className="text-sm text-cyan-900 font-medium truncate">
                            {fileName}
                          </span>
                        </div>
                      )}
                      <textarea
                        value={resume}
                        onChange={(e) => setResume(e.target.value)}
                        placeholder="Your resume content..."
                        className="w-full h-52 p-4 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleStartInterview}
                  disabled={!jobDescription || !resume}
                  className="group relative px-8 py-4 bg-linear-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Start AI Interview
                  </div>
                </button>
              </div>
            </div>
          )}

          {screen === 2 && (
            <div className="text-center animate-fade-in">
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto bg-linear-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center animate-pulse-slow">
                  <div className="w-24 h-24 bg-linear-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-white animate-spin-slow" />
                  </div>
                </div>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Preparing Your Interview
              </h2>
              <p className="text-gray-600 text-lg">
                Analyzing your resume and job description to generate
                personalized questions...
              </p>
              <div className="flex justify-center gap-2 mt-8">
                <div
                  className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          )}

          {screen === 3 && (
            <div className="w-full max-w-4xl mx-auto animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Mock Interview Session
                </h2>
                <div className="text-2xl font-mono text-gray-600">
                  {formatTime(timer)}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
                <div className="flex items-center justify-center gap-16 mb-8">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                    <div className="font-semibold text-gray-900">You</div>
                    <div className="text-sm text-gray-500">Candidate</div>
                  </div>

                  <div className="text-center">
                    <div className="relative">
                      <div className="w-24 h-24 bg-linear-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center mb-3 mx-auto animate-pulse-slow">
                        <Sparkles className="w-12 h-12 text-cyan-600" />
                      </div>
                      {isRecording && (
                        <div className="absolute bottom-2 right-0 flex gap-1">
                          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                          <div
                            className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"
                            style={{ animationDelay: "0.4s" }}
                          ></div>
                        </div>
                      )}
                    </div>
                    <div className="font-semibold text-gray-900">
                      AI Recruiter
                    </div>
                    <div className="text-sm text-gray-500">Interviewer</div>
                  </div>
                </div>

                <div className="bg-linear-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
                  <p className="text-gray-800 text-lg leading-relaxed text-center">
                    &quot;{currentQuestion}&quot;
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-110 ${
                      isRecording
                        ? "bg-red-500 hover:bg-red-600 animate-pulse"
                        : "bg-gray-900 hover:bg-gray-800"
                    }`}
                  >
                    <Mic className="w-6 h-6 text-white" />
                  </button>

                  <button className="w-14 h-14 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center shadow-md transform transition-all duration-300 hover:scale-110">
                    <Edit3 className="w-5 h-5 text-gray-600" />
                  </button>

                  <button
                    onClick={handleEndSession}
                    className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-full font-medium shadow-md transform transition-all duration-300 hover:scale-105 border border-gray-200"
                  >
                    End session
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <style jsx global>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes pulse-slow {
            0%,
            100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }

          @keyframes spin-slow {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }

          .animate-pulse-slow {
            animation: pulse-slow 2s ease-in-out infinite;
          }

          .animate-spin-slow {
            animation: spin-slow 3s linear infinite;
          }
        `}</style>
      </div>
    </>
  );
}
