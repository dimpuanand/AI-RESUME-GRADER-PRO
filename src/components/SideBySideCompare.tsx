import React, { useState } from "react";
import axios from "axios";
import { Upload, ArrowRight, Check, X, ShieldAlert, Award, Star, RefreshCw, Sparkles, TrendingUp, HelpCircle } from "lucide-react";
import { ResumeAnalysis } from "../types";

export default function SideBySideCompare() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [jobRole, setJobRole] = useState<string>("");
  const [jobDesc, setJobDesc] = useState<string>("");

  const [resultA, setResultA] = useState<ResumeAnalysis | null>(null);
  const [resultB, setResultB] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMsg, setLoadingMsg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async () => {
    if (!fileA || !fileB) {
      return setError("Please upload both Resume A and Resume B first!");
    }
    if (!jobRole.trim() || !jobDesc.trim()) {
      return setError("Please fill out both the Job Role and Job Description!");
    }

    setLoading(true);
    setError(null);
    setResultA(null);
    setResultB(null);

    const token = localStorage.getItem("accessToken");
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      // Step 1: Upload Resume A
      setLoadingMsg("Uploading & Analyzing Resume A...");
      const formDataA = new FormData();
      formDataA.append("resume", fileA);
      formDataA.append("jobRole", jobRole.trim());
      formDataA.append("jobDescription", jobDesc.trim());
      const resA = await axios.post("/api/v1/resume/upload", formDataA, { headers });

      // Step 2: Upload Resume B
      setLoadingMsg("Uploading & Analyzing Resume B...");
      const formDataB = new FormData();
      formDataB.append("resume", fileB);
      formDataB.append("jobRole", jobRole.trim());
      formDataB.append("jobDescription", jobDesc.trim());
      const resB = await axios.post("/api/v1/resume/upload", formDataB, { headers });

      setResultA(resA.data);
      setResultB(resB.data);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "An error occurred during comparison. Please ensure you are logged in."
      );
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600 border-green-200 bg-green-50";
    if (score >= 50) return "text-amber-600 border-amber-200 bg-amber-50";
    return "text-red-600 border-red-200 bg-red-50";
  };

  // Determine winner resume
  const winner = resultA && resultB ? (resultA.score > resultB.score ? "A" : resultB.score > resultA.score ? "B" : "Tie") : null;

  return (
    <div className="card rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300" id="comparer-card">
      {/* Header section */}
      <div className="border-b border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 rounded-md bg-blue-50 text-blue-600">
            <Award className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            Comparer Tool
          </span>
        </div>
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">
          Compare Resumes Instantly
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xl">
          Upload two resumes (e.g. Candidate A vs Candidate B or Version 1 vs Version 2) to evaluate their scores, matches, experience, and syntax side-by-side.
        </p>
      </div>

      {/* Inputs block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
            Target Job Role (Required)
          </label>
          <input
            type="text"
            className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-slate-700 transition-all font-sans"
            placeholder="e.g. Flask Developer"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
            Job Description (Required)
          </label>
          <textarea
            className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-slate-700 transition-all font-sans"
            placeholder="We are looking for a Python Developer experienced with Flask and RESTful APIs..."
            rows={1}
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
          />
        </div>
      </div>

      {/* Side by side upload cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Card Resume A */}
        <div
          className={`border-2 border-dashed p-5 rounded-2xl text-center bg-slate-50/40 hover:bg-slate-50/70 transition-all duration-200 ${
            winner === "A" ? "border-green-500/80 bg-green-50/10" : "border-slate-200"
          }`}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">
              Resume A (Candidate A / V1)
            </span>
            {winner === "A" && (
              <span className="text-[9px] font-extrabold bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                👑 Winner
              </span>
            )}
          </div>
          <input
            type="file"
            accept=".pdf,.docx"
            id="compareFileA"
            className="hidden"
            onChange={(e) => e.target.files && setFileA(e.target.files[0])}
          />
          <label
            htmlFor="compareFileA"
            className="block cursor-pointer border border-slate-200 py-3 px-4 rounded-xl text-xs font-bold bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            {fileA ? `✅ ${fileA.name}` : "📄 Choose Resume A (.pdf / .docx)"}
          </label>
        </div>

        {/* Card Resume B */}
        <div
          className={`border-2 border-dashed p-5 rounded-2xl text-center bg-slate-50/40 hover:bg-slate-50/70 transition-all duration-200 ${
            winner === "B" ? "border-green-500/80 bg-green-50/10" : "border-slate-200"
          }`}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">
              Resume B (Candidate B / V2)
            </span>
            {winner === "B" && (
              <span className="text-[9px] font-extrabold bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                👑 Winner
              </span>
            )}
          </div>
          <input
            type="file"
            accept=".pdf,.docx"
            id="compareFileB"
            className="hidden"
            onChange={(e) => e.target.files && setFileB(e.target.files[0])}
          />
          <label
            htmlFor="compareFileB"
            className="block cursor-pointer border border-slate-200 py-3 px-4 rounded-xl text-xs font-bold bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            {fileB ? `✅ ${fileB.name}` : "📄 Choose Resume B (.pdf / .docx)"}
          </label>
        </div>
      </div>

      <button
        className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white text-xs font-extrabold rounded-xl transition-all shadow-md disabled:opacity-50"
        onClick={handleCompare}
        disabled={loading || !fileA || !fileB}
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{loadingMsg}</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Run Comparison Grader</span>
          </>
        )}
      </button>

      {error && <p className="text-xs text-rose-500 font-bold text-center mt-3">{error}</p>}

      {/* MATRIX RESULTS */}
      {resultA && resultB && (
        <div className="mt-8 border-t border-slate-100 pt-6">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Award className="w-5 h-5 text-amber-500 animate-bounce" />
            <h4 className="text-sm font-extrabold text-slate-800 tracking-tight uppercase">
              Resume Comparison Matrix
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card Matrix A */}
            <div
              className={`rounded-2xl p-5 border ${
                winner === "A"
                  ? "border-green-500 bg-green-50/10 shadow-lg"
                  : "border-slate-200/80 bg-white"
              }`}
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <span className="text-xs font-black text-slate-800">
                  📄 Resume A {winner === "A" && "👑"}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-black border ${getScoreColor(resultA.score)}`}>
                  ATS: {resultA.score}/100
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[9px] block mb-1">
                    Skills Match Ratio
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600" style={{ width: `${resultA.job_match_percent}%` }} />
                    </div>
                    <span className="font-bold text-blue-600">{resultA.job_match_percent}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-0.5">Projects Suggested</span>
                    <span className="font-extrabold text-slate-800">{resultA.suggested_projects.length} Found</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-0.5">Experience Level</span>
                    <span className="font-extrabold text-slate-800">{resultA.years_experience}+ Years</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-0.5">Grammar Errors</span>
                    <span className="font-extrabold text-rose-600">{resultA.grammar_errors_count} Issues</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-0.5">Spelling Errors</span>
                    <span className="font-extrabold text-rose-600">{resultA.spelling_errors_count} Issues</span>
                  </div>
                </div>

                <div>
                  <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[9px] block mb-1">
                    Missing Target Skills
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {resultA.missing_skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold text-[10px]">
                        {s}
                      </span>
                    ))}
                    {resultA.missing_skills.length === 0 && (
                      <span className="text-green-600 italic">None - complete match!</span>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[9px] block mb-1">
                    AI Guidance Recommendation
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed italic">
                    {resultA.score >= 75
                      ? "Excellent skills alignment. Highly recommended for direct interviews."
                      : "Consider adding more core Python libraries and Flask project items."}
                  </p>
                </div>
              </div>
            </div>

            {/* Card Matrix B */}
            <div
              className={`rounded-2xl p-5 border ${
                winner === "B"
                  ? "border-green-500 bg-green-50/10 shadow-lg"
                  : "border-slate-200/80 bg-white"
              }`}
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <span className="text-xs font-black text-slate-800">
                  📄 Resume B {winner === "B" && "👑"}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-black border ${getScoreColor(resultB.score)}`}>
                  ATS: {resultB.score}/100
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[9px] block mb-1">
                    Skills Match Ratio
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600" style={{ width: `${resultB.job_match_percent}%` }} />
                    </div>
                    <span className="font-bold text-indigo-600">{resultB.job_match_percent}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-0.5">Projects Suggested</span>
                    <span className="font-extrabold text-slate-800">{resultB.suggested_projects.length} Found</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-0.5">Experience Level</span>
                    <span className="font-extrabold text-slate-800">{resultB.years_experience}+ Years</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-0.5">Grammar Errors</span>
                    <span className="font-extrabold text-rose-600">{resultB.grammar_errors_count} Issues</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-0.5">Spelling Errors</span>
                    <span className="font-extrabold text-rose-600">{resultB.spelling_errors_count} Issues</span>
                  </div>
                </div>

                <div>
                  <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[9px] block mb-1">
                    Missing Target Skills
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {resultB.missing_skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold text-[10px]">
                        {s}
                      </span>
                    ))}
                    {resultB.missing_skills.length === 0 && (
                      <span className="text-green-600 italic">None - complete match!</span>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[9px] block mb-1">
                    AI Guidance Recommendation
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed italic">
                    {resultB.score >= 75
                      ? "Excellent skills alignment. Highly recommended for direct interviews."
                      : "Consider adding more core Python libraries and Flask project items."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
