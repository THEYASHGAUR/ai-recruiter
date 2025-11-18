"use client";

import { useState, useRef, FormEvent, DragEvent, KeyboardEvent } from "react";

interface AnalysisResult {
  match_score?: string;
  summary?: string;
  strengths?: string[];
  missing_skills?: string[];
}

interface ApiResponse {
  analysis: string | AnalysisResult;
  jd_summary: string | object;
  selected_chunks_count?: number;
}

type TabType = "text" | "link" | "file";

export default function ResumeAnalyzer() {
  const [activeTab, setActiveTab] = useState<TabType>("text");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<ApiResponse | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "warn" | "success";
  } | null>(null);

  const resumeInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const ANALYZE_ENDPOINT = "http://127.0.0.1:8000/analyze";
  const DEFAULT_TOP_K = 5;

  const showToast = (message: string, type: "warn" | "success" = "warn") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return "";
    const units = ["B", "KB", "MB", "GB"];
    const exponent = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1
    );
    const size = bytes / 1024 ** exponent;
    return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[exponent]}`;
  };

  const handleFileSelect = (file: File | undefined) => {
    if (file) setResumeFile(file);
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) setResumeFile(file);
  };

  const handleAnalyze = async (e: FormEvent) => {
    e.preventDefault();

    if (!resumeFile) {
      showToast("Please upload your resume to proceed.");
      return;
    }

    if (!jdText.trim()) {
      showToast("Provide a JD file or paste the JD text to continue.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("top_k", String(DEFAULT_TOP_K));
    formData.append("jd_text", jdText);

    setIsAnalyzing(true);
    showToast("Analyzing resume...");

    try {
      const response = await fetch(ANALYZE_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      const payload: ApiResponse = await response.json();

      if (!response.ok) {
        const errorMessage =(payload as { error?: string })?.error || "Unable to analyze resume.";
        throw new Error(errorMessage);
      }

      showToast("Analysis complete!", "success");
      setResults(payload);
      setTimeout(
        () => resultsRef.current?.scrollIntoView({ behavior: "smooth" }),
        100
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to analyze resume.";
      showToast(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const parseAnalysis = (analysis: string | AnalysisResult): AnalysisResult => {
    const stripCodeFence = (s: string) => {
      return s.replace(/^```\s*json\s*/i, "").replace(/^```/, "").replace(/```\s*$/, "").trim();
    };

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const normalize = (obj: any): AnalysisResult => {
      if (!obj || typeof obj !== "object") return {};
      const out: AnalysisResult = {};
      out.match_score = ((obj.match_score ?? obj.matchScore ?? obj.match) || obj.score);
      // summary may be under several keys (summary or an advice question)
      out.summary = obj.summary ?? obj.description ?? obj['Should u apply in this Job?'] ?? obj['should_u_apply'] ?? obj['should_apply'];
      // ensure arrays
      out.strengths = Array.isArray(obj.strengths) ? obj.strengths : (obj.strengths ? [String(obj.strengths)] : []);
      out.missing_skills = Array.isArray(obj.missing_skills)
        ? obj.missing_skills
        : (obj.missingSkills ? obj.missingSkills : (obj.missing_skills ? [String(obj.missing_skills)] : []));
      return out;
    };

    if (typeof analysis === "string") {
      const cleaned = stripCodeFence(analysis);
      try {
        const parsed = JSON.parse(cleaned);
        return normalize(parsed);
      } catch {
        return {};
      }
    }
    return normalize(analysis as AnalysisResult);
  };

  const parseJdSummary = (jd: string | object) => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const normalizeJd = (obj: any) => {
      if (!obj || typeof obj !== "object") return obj;
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const out: any = {};
      out.job_title = obj.job_title || obj.jobTitle || obj.title || obj.jobTitle_raw || obj['job title'] || obj.job || null;
      out.company = obj.company || obj.company_name || obj.employer || null;
      out.location = obj.location || obj.city || obj.location_raw || null;
      out.company_description = obj.company_description || obj.company_description || obj.company_overview || obj.company_summary || null;
      out.overview = obj.overview || obj.description || obj.summary || null;
      out.role_summary = obj.role_summary || obj.role_description || obj.role || null;
      out.responsibilities = obj.responsibilities || obj.responsibility || obj.resp || [];

      // Normalize requirements nested object
      const req = obj.requirements || obj.requirement || obj.requirement_details || {};
      out.requirements = {};
      out.requirements.education = req.education || req.education_required || req.education_required || req['education_required'] || req.education_required || req.education_required || null;
      out.requirements.experience = req.experience || req.experience_required || req['experience_required'] || req.years || null;
      out.requirements.skills = req.skills || req.skills_required || req.skills_required || req.skills_required || req.skills_required || req.skills_required || [];

      out.must_haves = obj.must_haves || obj.mustHaves || obj.mandatory || [];
      out.nice_to_haves = obj.nice_to_haves || obj.niceToHaves || obj.preferred || [];
      out.benefits = obj.benefits || obj.package_offering || obj.benefits_offered || [];
      return out;
    };

    if (typeof jd !== "string") {
      // already an object, normalize and return
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      return normalizeJd(jd as any);
    }

    const stripCodeFence = (s: string) => s.replace(/^```\s*json\s*/i, "").replace(/^```/, "").replace(/```\s*$/, "").trim();
    const cleaned = stripCodeFence(jd as string);
    try {
      const parsed = JSON.parse(cleaned);
      return normalizeJd(parsed);
    } catch {
      return jd; // return original string if not parseable
    }
  };

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const buildJdTextForCopy = (jd: any) => {
    if (!jd) return "";
    if (typeof jd === "string") return jd;

    const lines: string[] = [];
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const push = (label: string, value: any) => {
      if (!value) return;
      lines.push(`${label}: ${value}`);
    };

    push("Job Title", jd.job_title || jd.jobTitle || jd.title);
    push("Company", jd.company);
    push("Location", jd.location);
    if (jd.company_description) {
      lines.push("");
      lines.push("Company Description:");
      lines.push(jd.company_description);
    }
    if (jd.overview) {
      lines.push("");
      lines.push("Overview:");
      lines.push(jd.overview);
    }
    if (jd.role_summary || jd.role_description) {
      lines.push("");
      lines.push("Role:");
      lines.push(jd.role_summary || jd.role_description);
    }
    if (Array.isArray(jd.responsibilities) && jd.responsibilities.length) {
      lines.push("");
      lines.push("Responsibilities:");
      jd.responsibilities.forEach((r: string) => lines.push(`- ${r}`));
    }
    const req = jd.requirements || {};
    if (req.education || req.experience || Array.isArray(req.skills)) {
      lines.push("");
      lines.push("Requirements:");
      if (req.education) lines.push(`- Education: ${req.education}`);
      if (req.experience) lines.push(`- Experience: ${req.experience}`);
      if (Array.isArray(req.skills) && req.skills.length) {
        lines.push("- Skills:");
        req.skills.forEach((s: string) => lines.push(`  - ${s}`));
      }
    }

    if (Array.isArray(jd.must_haves) && jd.must_haves.length) {
      lines.push("");
      lines.push("Must Haves:");
      jd.must_haves.forEach((m: string) => lines.push(`- ${m}`));
    }
    if (Array.isArray(jd.nice_to_haves) && jd.nice_to_haves.length) {
      lines.push("");
      lines.push("Nice To Haves:");
      jd.nice_to_haves.forEach((n: string) => lines.push(`- ${n}`));
    }
    if (Array.isArray(jd.benefits) && jd.benefits.length) {
      lines.push("");
      lines.push("Benefits:");
      jd.benefits.forEach((b: string) => lines.push(`- ${b}`));
    }

    return lines.join("\n");
  };

  const analysis = results ? parseAnalysis(results.analysis) : null;
  const jdSummaryParsed = results ? parseJdSummary(results.jd_summary) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 px-4 py-12 md:py-20 relative overflow-hidden">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.03),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(99,102,241,0.03),transparent_50%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        {/* Refined Hero */}
        <header className="text-center mb-12 md:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full mb-3 shadow-sm">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            <span className="text-[11px] font-semibold text-slate-600 tracking-wider uppercase">
              AI Powered Matching
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900">
            Resume <span className="text-blue-600">Analyzer</span>
          </h1>

          <p className="text-slate-600 max-w-2xl mx-auto text-base leading-relaxed">
            Get instant insights on how well your resume matches job
            requirements. Upload your resume and job description to receive
            detailed feedback.
          </p>
        </header>

        {/* Cleaner Cards Grid */}
        <main className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Resume Upload Panel */}
          <section className="bg-white border border-slate-200/60 rounded-3xl p-7 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 font-semibold flex items-center justify-center text-sm">
                1
              </span>
              <h2 className="text-xl font-semibold text-slate-900">
                Your Resume
              </h2>
            </div>

            {!resumeFile ? (
              <div
                className={`relative border-2 border-dashed rounded-2xl text-center p-10 cursor-pointer transition-all duration-200 ${
                  isDragOver
                    ? "border-blue-400 bg-blue-50/50"
                    : "border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/30"
                }`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => resumeInputRef.current?.click()}
                onKeyDown={(e: KeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    resumeInputRef.current?.click();
                  }
                }}
                tabIndex={0}
                role="button"
              >
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                />
                <div className="w-16 h-16 rounded-xl bg-blue-100 text-blue-600 text-3xl grid place-items-center mx-auto mb-4">
                  ⬆
                </div>
                <p className="text-base font-semibold text-slate-900 mb-1.5">
                  Upload Resume
                </p>
                <p className="text-sm text-slate-600 mb-2">
                  Drag and drop or click to upload
                </p>
                <p className="text-xs text-slate-500">
                  Supports PDF, DOC, DOCX
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 grid place-items-center text-2xl">
                  📄
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate text-sm">
                    {resumeFile.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatBytes(resumeFile.size)}
                  </p>
                </div>
                <button
                  onClick={() => setResumeFile(null)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-50 hover:text-slate-700 transition-colors text-sm"
                  aria-label="Remove file"
                >
                  ✕
                </button>
              </div>
            )}
          </section>

          {/* Job Description Panel */}
          <section className="bg-white border border-slate-200/60 rounded-3xl p-7 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 font-semibold flex items-center justify-center text-sm">
                2
              </span>
              <h2 className="text-xl font-semibold text-slate-900">
                Job Description
              </h2>
            </div>

            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl mb-5">
              <button
                className={`flex-1 rounded-lg py-2 px-3 text-sm font-medium transition-all duration-150 ${
                  activeTab === "text"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                onClick={() => setActiveTab("text")}
              >
                Paste Text
              </button>
              <button
                className="flex-1 rounded-lg py-2 px-3 text-sm font-medium text-slate-400 cursor-not-allowed"
                disabled
              >
                Job Link
              </button>
              <button
                className={`flex-1 rounded-lg py-2 px-3 text-sm font-medium transition-all duration-150 ${
                  activeTab === "file"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                onClick={() => setActiveTab("file")}
              >
                Upload File
              </button>
            </div>

            {activeTab === "text" && (
              <div>
                <label
                  htmlFor="jd-text"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Paste Job Description
                </label>
                <textarea
                  id="jd-text"
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste the complete job description here..."
                  className="w-full rounded-xl border border-slate-200 p-3.5 min-h-[220px] bg-white text-slate-900 text-sm placeholder-slate-400 resize-y focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            )}

            {activeTab === "file" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Upload Job Description
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl text-center p-8 text-slate-600 text-sm bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    className="block mx-auto mt-2 text-xs"
                  />
                  <p className="mt-2">
                    Drag and drop or click to upload the JD file.
                  </p>
                </div>
              </div>
            )}
          </section>
        </main>

        {/* Results Panel */}
        {results && (
          <section
            ref={resultsRef}
            className="bg-white border border-slate-200/60 rounded-3xl p-7 md:p-8 shadow-sm mb-8"
          >
            <div className="flex items-center gap-3 mb-7">
              <span className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 font-semibold flex items-center justify-center text-sm">
                3
              </span>
              <h2 className="text-xl font-semibold text-slate-900">
                Analysis Output
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-5 mb-7">
              <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Match Score
                </p>
                <p className="text-4xl font-bold text-blue-600">
                  {analysis?.match_score ?? "--"}
                </p>
              </div>
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Relevant Chunks
                </p>
                <p className="text-4xl font-bold text-slate-900">
                  {results.selected_chunks_count ?? "--"}
                </p>
              </div>
            </div>

            <div className="mb-6 p-5 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="text-base font-semibold text-slate-900 mb-2.5">
                Should u apply for this job?
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                {analysis?.summary || "No summary returned."}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5 mb-6">
              <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-100">
                <h3 className="text-2xl font-stretch-50% text-slate-900 mb-3">
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {analysis?.strengths?.length ? (
                    analysis.strengths.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-slate-700"
                      >
                        <span className="text-emerald-500 mt-0.5 text-xs">
                          ●
                        </span>
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-slate-500 italic">None</li>
                  )}
                </ul>
              </div>
              <div className="p-5 bg-amber-50 rounded-xl border border-amber-100">
                <h3 className="text-2xl font-stretch-50% text-slate-900 mb-3">
                  Gaps / Missing Skills
                </h3>
                <ul className="space-y-2">
                  {analysis?.missing_skills?.length ? (
                    analysis.missing_skills.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-slate-700"
                      >
                        <span className="text-amber-500 mt-0.5 text-xs">●</span>
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-slate-500 italic">None</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="mb-5 p-5 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-start justify-between">
                <h3 className="text-2xl font-stretch-50% text-slate-900 mb-3">
                  JD Summary
                </h3>
                <div className="ml-4">
                  <button
                    onClick={async () => {
                      const textToCopy = buildJdTextForCopy(jdSummaryParsed ?? results?.jd_summary);
                      try {
                        await navigator.clipboard.writeText(textToCopy);
                        showToast("JD summary copied to clipboard", "success");
                      } catch {
                        showToast("Failed to copy JD summary", "warn");
                      }
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {typeof jdSummaryParsed === "string" ? (
                <p className="text-sm text-slate-700 leading-relaxed">
                  {jdSummaryParsed}
                </p>
              ) : (
                (() => {
                  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                  const jd: any = jdSummaryParsed;
                  return (
                    <div className="space-y-4 text-sm text-slate-700">
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900">
                          {jd.job_title || jd.jobTitle || jd.title || "Job Title"}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {jd.company ? jd.company : ""}
                          {jd.company && jd.location ? " • " : ""}
                          {jd.location ? jd.location : ""}
                        </p>
                      </div>

                      {jd.overview && (
                        <p className="leading-relaxed">{jd.overview}</p>
                      )}

                      {(jd.role_summary || jd.role_description) && (
                        <div>
                          <h5 className="font-medium text-slate-900 mb-1">Role</h5>
                          <p className="leading-relaxed">{jd.role_summary || jd.role_description}</p>
                        </div>
                      )}

                      {Array.isArray(jd.responsibilities) && jd.responsibilities.length > 0 && (
                        <div>
                          <h5 className="font-medium text-slate-900 mb-2">Responsibilities</h5>
                          <ul className="space-y-2">
                            {jd.responsibilities.map((item: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                <span className="text-blue-600 mt-0.5 text-xs">●</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {jd.requirements && (
                        <div>
                          <h5 className="font-medium text-slate-900 mb-2">Requirements</h5>
                          <div className="text-sm text-slate-700 space-y-1">
                            {jd.requirements.education && (
                              <div>
                                <strong className="text-slate-900">Education Required:</strong> {jd.requirements.education}
                              </div>
                            )}

                            {jd.requirements.experience && (
                              <div>
                                <strong className="text-slate-900">Experience Required:</strong> {jd.requirements.experience}
                              </div>
                            )}
                            {jd.requirements.experience && (
                              <div>
                                <strong className="text-slate-900">Skills Required:</strong> {jd.requirements.skills_required}
                              </div>
                            )}
                            {jd.package_offering && (
                              <div>
                                <strong className="text-slate-900">Package Offering:</strong> {jd.package_offering}
                              </div>
                            )}

                            {Array.isArray(jd.requirements.skills) && jd.requirements.skills.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {jd.requirements.skills.map((s: string, i: number) => (
                                  <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-700">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>

            <details className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <summary className="text-sm font-medium text-slate-900 cursor-pointer select-none">
                Raw Response
              </summary>
              <pre className="mt-3 text-xs text-slate-600 overflow-x-auto bg-white p-3 rounded-lg border border-slate-200">
                {JSON.stringify(results, null, 2)}
              </pre>
            </details>
          </section>
        )}

        {/* CTA Button */}
        <div className="flex justify-center">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-12 py-4 rounded-full shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 text-base"
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2.5">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
              </span>
            ) : (
              "Analyze Resume"
            )}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-sm font-medium shadow-xl backdrop-blur-sm animate-[slideUp_0.3s_ease] ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}
        >
          {toast.message}
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
}
