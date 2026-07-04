import React, { useState } from "react";
import axios from "axios";
import { Sparkles, Copy, Check, Info, FileText, ArrowRight, Zap, RefreshCw } from "lucide-react";

interface ToolboxProps {
  jobRole: string;
  jobDescription: string;
}

export default function AIImprovementToolbox({ jobRole, jobDescription }: ToolboxProps) {
  const [sectionType, setSectionType] = useState<string>("summary");
  const [inputText, setInputText] = useState<string>("");
  const [outputText, setOutputText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const sections = [
    { value: "summary", label: "📄 Professional Summary" },
    { value: "projects", label: "🚀 Project Description" },
    { value: "skills", label: "💪 Skills Section" },
    { value: "achievements", label: "📈 Achievements & Metrics" },
  ];

  // Simulated optimization highlights based on role and input text
  const getOptimizations = () => {
    return [
      { category: "Action Verbs", text: "Substituted passive words with 'Pioneered', 'Orchestrated', and 'Optimized'", status: "excellent" },
      { category: "ATS Keywords", text: `Embedded key terms: '${jobRole || "Flask, REST API"}' directly into bullet descriptors`, status: "strong" },
      { category: "Quantified Metrics", text: "Appended metric place-holders (e.g. 'reduced latency by 35%', 'handled 10k+ requests')", status: "excellent" },
      { category: "Grammar & Structure", text: "Pruned wordy, passive phrases to streamline document density", status: "good" }
    ];
  };

  const handleGenerate = async () => {
    if (!jobRole || !jobDescription) {
      setError("Please run a resume analysis first to feed role details into the AI!");
      return;
    }
    setLoading(true);
    setError(null);
    setOutputText("");
    setCopied(false);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.post(
        "/api/v1/resume/generate-suggestion",
        {
          sectionType,
          jobRole,
          jobDescription,
          currentText: inputText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOutputText(res.data.suggestion);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to generate customized suggestion. Please log in again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300" id="ai-toolbox-card">
      <div className="border-b border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 rounded-md bg-indigo-50 text-indigo-600">
            <Sparkles className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
            AI Enhancer
          </span>
        </div>
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">
          AI Resume Optimizer
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xl">
          Instantly transform dry resume bullet points or professional summaries into high-impact, metrics-driven achievements customized for <strong>{jobRole || "Flask Developer"}</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT COMPONENT: INPUT FORM (40%) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 border-r border-slate-100 pr-0 lg:pr-6">
          <div>
            <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              1. Select Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {sections.map((sec) => (
                <button
                  key={sec.value}
                  type="button"
                  className={`px-3 py-2 text-left text-xs font-semibold rounded-lg border transition-all duration-150 ${
                    sectionType === sec.value
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                  onClick={() => setSectionType(sec.value)}
                >
                  {sec.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              2. Your Current Draft (Before)
            </label>
            <textarea
              className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-slate-700 transition-all font-sans"
              placeholder="e.g. Worked on the python backend and created some APIs using flask, fixed some database queries too."
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          <button
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl transition-all shadow hover:shadow-indigo-100 disabled:opacity-50"
            onClick={handleGenerate}
            disabled={loading || !jobRole}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Optimizing with Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Optimize Resume Section</span>
              </>
            )}
          </button>
          {!jobRole && (
            <p className="text-[10px] text-center text-rose-500 font-bold">
              ⚠️ Please scan your main resume first to feed Target JD metadata!
            </p>
          )}
          {error && <p className="text-[10px] text-rose-500 text-center font-bold">{error}</p>}
        </div>

        {/* RIGHT COMPONENT: BEFORE / AFTER & HIGHLIGHTS (60%) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* BEFORE CONTAINER */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                🔴 Original Draft
              </span>
              <div className="text-xs text-slate-500 font-sans italic leading-relaxed min-h-[110px] whitespace-pre-wrap">
                {inputText || "Draft is empty. Paste some points on the left to see original text comparisons."}
              </div>
            </div>

            {/* AFTER CONTAINER */}
            <div className="border border-blue-150 rounded-xl p-4 bg-blue-50/10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-blue-500 uppercase tracking-wider block mb-2">
                  🟢 Gemini Optimized Draft
                </span>
                {outputText ? (
                  <div className="text-xs text-slate-800 font-sans leading-relaxed min-h-[110px] whitespace-pre-wrap select-all font-medium">
                    {outputText}
                  </div>
                ) : loading ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
                    <p className="text-[11px] font-bold text-indigo-500 mt-2">Rewriting sentences...</p>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 font-sans italic leading-relaxed min-h-[110px] flex items-center justify-center">
                    Tap 'Optimize' to see the premium bullet draft
                  </div>
                )}
              </div>

              {outputText && (
                <button
                  className={`w-full flex items-center justify-center gap-1.5 py-1.5 mt-2 rounded-lg text-[10.5px] font-extrabold uppercase tracking-wider border transition-all ${
                    copied
                      ? "bg-green-100 border-green-200 text-green-800"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Optimized Draft
                    </>
                  )}
                </button>
              )}
            </div>

          </div>

          {/* AI IMPROVEMENTS METADATA PANEL */}
          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-500" /> Improvement Breakdowns (SaaS Analytics)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {getOptimizations().map((opt) => (
                <div key={opt.category} className="p-2.5 bg-white border border-slate-150 rounded-lg text-xs flex gap-2">
                  <div className="flex flex-col">
                    <span className="font-extrabold text-slate-800 text-[11px] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {opt.category}
                    </span>
                    <span className="text-[11px] text-slate-500 leading-normal mt-0.5">{opt.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
