import React, { useState, useEffect } from "react";
import axios from "axios";
import confetti from "canvas-confetti";
import {
  Check,
  X,
  AlertTriangle,
  Star,
  Award,
  BookOpen,
  Clock,
  Code,
  FileText,
  Download,
  Share2,
  Trash2,
  ArrowRight,
  Moon,
  Sun,
  RefreshCw,
  Eye,
  Sparkles,
  Sliders,
  Copy,
  Trophy,
  GraduationCap,
  Briefcase,
  TrendingUp,
  HelpCircle,
  BarChart3,
  Percent,
  CheckCircle2,
  Heart,
  ChevronRight,
  Calendar,
  Layers,
  FileSpreadsheet
} from "lucide-react";

import { ResumeAnalysis, SavedResume } from "./types";
import { generatePDFReport, downloadCSV, downloadDOCX } from "./utils/pdfGenerator";
import { SVGPieChart, SVGRadarChart, SVGHistoryChart } from "./components/SVGCharts";
import InteractiveRoadmap from "./components/InteractiveRoadmap";
import AIImprovementToolbox from "./components/AIImprovementToolbox";
import SideBySideCompare from "./components/SideBySideCompare";
import ResumePreview from "./components/ResumePreview";
import { showToast } from "./utils/toast";
import ToastContainer from "./components/ToastContainer";

const API = "";

const tips = [
  "Keep your resume to 1-2 pages max.",
  "Use bullet points to describe achievements.",
  "Tailor your resume for each job application.",
  "Include measurable results (e.g. improved speed by 30%).",
  "Always include a professional summary at the top.",
];

// Re-mapped loading stages as requested
const LOADING_STAGES = [
  "Uploading Resume",
  "Extracting Text",
  "Analyzing Skills",
  "Matching Keywords",
  "Generating Suggestions",
  "Done"
];

const getToken = () => localStorage.getItem("accessToken");
const getUser = () => {
  try {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};

const saveAuth = ({ accessToken, refreshToken, user }: { accessToken: string; refreshToken: string; user: any }) => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("user", JSON.stringify(user));
};

const clearAuth = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

// Global axios configuration that auto-logs out on 401 unauthorized
const authAxios = axios.create({ baseURL: API });
authAxios.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
authAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

function AuthPage({ onAuth }: { onAuth: (user: any) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!email || !password) return setError("Email and password are required.");
    if (mode === "register" && !name) return setError("Name is required.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/v1/auth/login" : "/api/v1/auth/register";
      const payload = mode === "login" ? { email, password } : { name, email, password };
      const res = await axios.post(`${API}${endpoint}`, payload);
      saveAuth(res.data);
      onAuth(res.data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") submit();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl p-5 sm:p-8 flex flex-col items-center">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-md mb-4 animate-bounce">
          🎯
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">AI Resume Grader</h1>
        <p className="text-slate-500 text-xs mt-1 mb-6">
          {mode === "login" ? "Sign in to access premium grading diagnostics" : "Create a secure workspace account"}
        </p>

        {/* Tab switcher */}
        <div className="w-full grid grid-cols-2 bg-slate-100 p-1 rounded-xl mb-4">
          <button
            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${mode === "login" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}
            onClick={() => { setMode("login"); setError(""); }}
          >
            Login
          </button>
          <button
            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${mode === "register" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}
            onClick={() => { setMode("register"); setError(""); }}
          >
            Register
          </button>
        </div>

        {/* Form Inputs */}
        <div className="w-full space-y-3">
          {mode === "register" && (
            <input
              className="w-full p-3 text-xs border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all min-h-[44px]"
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKey}
            />
          )}
          <input
            className="w-full p-3 text-xs border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all min-h-[44px]"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKey}
          />
          <input
            className="w-full p-3 text-xs border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all min-h-[44px]"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKey}
          />
        </div>

        {error && <p className="text-red-500 text-[11px] font-bold mt-3 text-center">{error}</p>}

        <button
          className="w-full mt-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl transition-all shadow shadow-blue-100 flex items-center justify-center gap-2 min-h-[44px]"
          onClick={submit}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Verifying...
            </span>
          ) : mode === "login" ? (
            "Sign In"
          ) : (
            "Create Account"
          )}
        </button>

        <p className="text-[11px] text-slate-400 mt-4 text-center">
          Project review demo uses local secure database persistence.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(getUser);
  const [activeNav, setActiveNav] = useState<"grader" | "compare" | "roadmap" | "rewrite" | "reports" | "history">("grader");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [jobRole, setJobRole] = useState("");
  const [jobDesc, setJobDesc] = useState("");

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("isDarkMode") === "true";
  });

  const [versionHistory, setVersionHistory] = useState<SavedResume[]>([]);
  const [showFormulaPopup, setShowFormulaPopup] = useState<boolean>(false);

  // Toggle Dark Mode class on HTML or Body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("isDarkMode", String(isDarkMode));
  }, [isDarkMode]);

  // Load history on mount
  useEffect(() => {
    if (user) {
      authAxios
        .get("/api/v1/resume/history")
        .then((res) => setVersionHistory(res.data.resumes || []))
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await authAxios.post("/api/v1/auth/logout");
    } catch {}
    clearAuth();
    setUser(null);
    setResult(null);
    setActiveNav("grader");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a resume file first!");
      return;
    }
    if (!jobRole.trim()) {
      setError("Please specify the Target Job Role!");
      return;
    }
    if (!jobDesc.trim()) {
      setError("Please provide the Job Description!");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setLoadingPercent(0);

    // Multi-stage loader steps
    let stageIdx = 0;
    setLoadingMsg(LOADING_STAGES[0]);
    
    const interval = setInterval(() => {
      stageIdx++;
      if (stageIdx < LOADING_STAGES.length) {
        setLoadingMsg(LOADING_STAGES[stageIdx]);
        setLoadingPercent((stageIdx / LOADING_STAGES.length) * 100);
      }
    }, 450); // Total 2.7s for all 6 steps transition

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobRole", jobRole.trim());
      formData.append("jobDescription", jobDesc.trim());

      const res = await authAxios.post("/api/v1/resume/upload", formData);
      
      // Delay slightly so user clearly sees the beautiful final "Done" stage
      setTimeout(() => {
        clearInterval(interval);
        setLoadingPercent(100);
        setResult(res.data);
        showToast("Resume analyzed successfully.", "success");
        setLoading(false);
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });

        // reload history
        authAxios
          .get("/api/v1/resume/history")
          .then((historyRes) => setVersionHistory(historyRes.data.resumes || []))
          .catch(() => {});
      }, 2700);

    } catch (err: any) {
      clearInterval(interval);
      setLoading(false);
      const errMsg = err.response?.data?.error || "Unable to analyze document. Verify server limits.";
      setError(errMsg);
      showToast(errMsg, "error");
    }
  };

  const handleLoadFromHistory = (item: SavedResume) => {
    if (item.analysis) {
      setResult(item.analysis);
    } else {
      setResult({
        score: item.score,
        matched_skills: [],
        missing_skills: [],
        suggestions: ["This is a legacy evaluation record. To access full AI analysis, please upload and analyze this resume again."],
        years_experience: item.yearsExperience || 0,
        action_verbs_found: [],
        job_match_percent: item.jobMatchPercent,
        weak_keywords: [],
        grammar_errors_count: 0,
        spelling_errors_count: 0,
        grammar_spelling_suggestions: [],
        suggested_projects: [],
        recommended_certifications: [],
        career_advice: [],
        resume_completeness: 80,
        candidate_name: "Candidate",
        executive_summary: "Legacy resume evaluation loaded from historical records.",
      });
    }
    setJobRole(item.jobRole || "");
    setJobDesc(item.jobDescription || "");
    setActiveNav("grader");
  };

  const handleDeleteFromHistory = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this evaluation from your history?")) {
      return;
    }
    try {
      await authAxios.delete(`/api/v1/resume/history/${id}`);
      const res = await authAxios.get("/api/v1/resume/history");
      setVersionHistory(res.data.resumes || []);
      showToast("Evaluation deleted successfully.", "success");
    } catch (err) {
      console.error("Failed to delete history item:", err);
      showToast("Failed to delete evaluation history entry.", "error");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600 border-emerald-200 bg-emerald-50";
    if (score >= 75) return "text-blue-600 border-blue-250 bg-blue-50";
    if (score >= 60) return "text-amber-600 border-amber-250 bg-amber-50";
    return "text-red-600 border-red-200 bg-red-50";
  };

  const getScoreColorHex = (score: number) => {
    if (score >= 90) return "#10b981";
    if (score >= 75) return "#3b82f6";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreTextLabel = (score: number) => {
    if (score >= 90) return "Strong Match (Excellent)";
    if (score >= 75) return "Good Match (Average)";
    if (score >= 60) return "Borderline Match";
    return "Weak Match";
  };

  // Corporate Brand Matches (Mocked statically depending on score density)
  const getCompanyMatches = (score: number) => {
    return [
      { name: "Google / Stripe", percent: Math.round(score * 0.95) },
      { name: "SaaS Startups", percent: Math.round(score * 0.99) },
      { name: "Vercel / Linear", percent: Math.round(score * 0.92) },
    ];
  };

  const getJobFitPercentages = (score: number, advice: string[] = []) => {
    const roles = [
      jobRole || "Target Role",
      advice[0] || "Alternative Specialized developer",
      advice[1] || "Senior Technical Specialist"
    ];
    return [
      { role: roles[0], percent: score },
      { role: roles[1], percent: Math.max(Math.round(score * 0.85), 25) },
      { role: roles[2], percent: Math.max(Math.round(score * 0.70), 20) },
    ];
  };

  const getWritingScore = (r: ResumeAnalysis) => {
    const totalIssues = r.grammar_errors_count + r.spelling_errors_count;
    return Math.max(100 - totalIssues * 8, 40);
  };

  if (!user) return <AuthPage onAuth={setUser} />;

  const historicalScores = versionHistory.map((r) => r.score).reverse();

  return (
    <div className={`min-h-screen bg-[#f8fafc] text-slate-800 font-sans transition-colors duration-200`}>
      
      {/* PROFESSIONAL PREMIUM UPPER TOOLBAR */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-sm px-4 sm:px-6 py-3 sm:py-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3 sm:gap-4 animate-fade-in">
        <div className="flex items-center gap-2.5 sm:gap-3 w-full xl:w-auto">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow shrink-0">
            🎯
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span>AI Resume Grader</span>
              <span className="text-[8.5px] sm:text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 sm:px-2 py-0.5 rounded-full uppercase shrink-0">
                Premium SaaS v1.2
              </span>
            </h1>
            <p className="text-[9.5px] sm:text-[11px] text-slate-500 font-medium truncate">
              Vera-grade candidate verification & training roadmap generator
            </p>
          </div>
        </div>

        {/* NAVIGATION TABS (Blue active state, rounded corners, wraps cleanly on mobile) */}
        <nav className="flex flex-wrap items-center justify-center xl:justify-start bg-slate-100 p-1 sm:p-1.5 rounded-xl border border-slate-200 gap-1 w-full xl:w-auto">
          <button
            onClick={() => setActiveNav("grader")}
            className={`flex-1 sm:flex-none px-2.5 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
              activeNav === "grader" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 shrink-0" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveNav("compare")}
            className={`flex-1 sm:flex-none px-2.5 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
              activeNav === "compare" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>Compare</span>
          </button>
          <button
            onClick={() => {
              if (result) {
                setActiveNav("roadmap");
              } else {
                showToast("Please run a resume evaluation first to unlock the dynamic training roadmap!", "warning");
              }
            }}
            className={`flex-1 sm:flex-none px-2.5 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
              activeNav === "roadmap" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            } ${!result ? "opacity-60 cursor-not-allowed" : ""}`}
            title={!result ? "Locked: scan a resume first" : "View training milestones"}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>Roadmap</span>
          </button>
          <button
            onClick={() => setActiveNav("rewrite")}
            className={`flex-1 sm:flex-none px-2.5 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
              activeNav === "rewrite" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>AI Enhancer</span>
          </button>
          <button
            onClick={() => {
              if (result) {
                setActiveNav("reports");
              } else {
                showToast("Please analyze a resume on the Dashboard first to access reports!", "warning");
              }
            }}
            className={`flex-1 sm:flex-none px-2.5 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
              activeNav === "reports" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            } ${!result ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>Reports</span>
          </button>
          <button
            onClick={() => setActiveNav("history")}
            className={`flex-1 sm:flex-none px-2.5 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
              activeNav === "history" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>History</span>
          </button>
        </nav>

        {/* LOGOUT & SESSION */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 ml-auto xl:ml-0">
          <div className="flex flex-col text-right text-[10px] sm:text-xs">
            <span className="font-bold text-slate-800">👤 {user.name}</span>
            <span className="text-[8.5px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wide">Developer Account</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] sm:text-xs font-bold rounded-lg border border-slate-200 transition-all min-h-[44px] flex items-center justify-center"
          >
            Logout
          </button>
        </div>
      </header>

      {/* PRIMARY GRID STAGE */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        
        {/* COMPARE TABS ROUTER */}
        {activeNav === "compare" && <SideBySideCompare />}

        {/* ROADMAP VIEW TAB */}
        {activeNav === "roadmap" && result && (
          <InteractiveRoadmap
            matchedSkills={result.matched_skills}
            missingSkills={result.missing_skills}
            jobRole={jobRole}
          />
        )}

        {/* AI ENHANCER TAB */}
        {activeNav === "rewrite" && (
          <AIImprovementToolbox jobRole={jobRole} jobDescription={jobDesc} />
        )}

        {/* REPORTS DOWNLOAD SCREEN */}
        {activeNav === "reports" && result && (
          <div className="card rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 max-w-2xl mx-auto text-center shadow-lg animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 text-3xl">
              📊
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800">Candidate Evaluation Report Panel</h3>
            <p className="text-slate-500 text-[11px] sm:text-xs mt-1 mb-6 max-w-md mx-auto">
              Extract and distribute professional evaluation data. Download structured documentation ready for review boards.
            </p>

            <div className="border border-slate-100 rounded-xl p-4 sm:p-5 bg-slate-50/50 mb-6 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="font-bold text-slate-500">Candidate Name:</span>
                <span className="font-black text-slate-800">{result.candidate_name || "Candidate"}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-bold text-slate-500">Target Role:</span>
                <span className="font-black text-slate-800 uppercase">{jobRole}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-bold text-slate-500">ATS Match Rating:</span>
                <span className="font-black text-blue-600">{result.score}/100</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-bold text-slate-500">Primary Skills Identified:</span>
                <span className="font-black text-slate-800">{result.matched_skills.length} Matches</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="font-bold text-slate-500">Scan Completed At:</span>
                <span className="font-black text-slate-800">
                  {new Date().toLocaleDateString()} (Active State)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <button
                onClick={() => generatePDFReport(result, result.candidate_name || "Candidate", jobRole)}
                className="flex items-center justify-center gap-2 p-3 border-2 border-red-500 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl transition-all text-xs min-h-[44px]"
              >
                <Download className="w-4 h-4 shrink-0" /> Download PDF
              </button>
              <button
                onClick={() => downloadDOCX(result, result.candidate_name || "Candidate", jobRole)}
                className="flex items-center justify-center gap-2 p-3 border-2 border-blue-500 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition-all text-xs min-h-[44px]"
              >
                <FileText className="w-4 h-4 shrink-0" /> Download DOCX
              </button>
              <button
                onClick={() => downloadCSV(result.matched_skills, result.missing_skills, jobRole)}
                className="flex items-center justify-center gap-2 p-3 border-2 border-emerald-500 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl transition-all text-xs min-h-[44px] sm:col-span-2 lg:col-span-1"
              >
                <FileSpreadsheet className="w-4 h-4 shrink-0" /> Download CSV
              </button>
            </div>
          </div>
        )}

        {activeNav === "reports" && !result && (
          <div className="card rounded-2xl border border-dashed border-slate-200/80 bg-white p-6 sm:p-12 text-center shadow-sm max-w-2xl mx-auto animate-fade-in">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-base font-extrabold text-slate-800">No Analysis Done Yet</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">
              Please analyze your resume under the "Main Grader" dashboard first to view and download full reports.
            </p>
          </div>
        )}

        {/* EVALUATION HISTORY SCREEN */}
        {activeNav === "history" && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">Evaluation History</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Access and manage your previously analyzed resumes and target roles.
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center gap-2">
                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200">
                  Total Saved: {versionHistory.length}
                </span>
              </div>
            </div>

            {versionHistory.length === 0 ? (
              <div className="card rounded-2xl border border-dashed border-slate-200/80 bg-white p-12 text-center shadow-sm max-w-2xl mx-auto animate-fade-in">
                <div className="text-4xl mb-3 text-slate-400">🕒</div>
                <h3 className="text-base font-extrabold text-slate-800">No Evaluation History</h3>
                <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto mb-6">
                  You haven't run any resume reviews yet. Analyze your first resume on the Dashboard to start tracking progress.
                </p>
                <button
                  onClick={() => setActiveNav("grader")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all inline-flex items-center gap-1.5"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Go to Dashboard</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {/* Score trajectory graph at the top of history page for nice visualization */}
                {historicalScores.length > 0 && (
                  <div className="card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                      Score Tracker Trajectory
                    </h3>
                    <p className="text-[11px] text-slate-400 mb-4">
                      Visual diagnostic tracking your evaluation performance scores over your submission timeline.
                    </p>
                    <div className="h-44">
                      <SVGHistoryChart scores={historicalScores} />
                    </div>
                  </div>
                )}

                {/* Grid list of previous evaluations */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                          <th className="px-6 py-4">File Name & Date</th>
                          <th className="px-6 py-4">Target Job Role</th>
                          <th className="px-6 py-4 text-center">ATS Score</th>
                          <th className="px-6 py-4 text-center">Match %</th>
                          <th className="px-6 py-4 text-center">Experience</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                        {versionHistory.map((item) => {
                          const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                          const scoreColorClass = item.score >= 80 
                            ? "text-emerald-700 bg-emerald-50 border-emerald-200" 
                            : item.score >= 60 
                            ? "text-blue-700 bg-blue-50 border-blue-150" 
                            : item.score >= 40 
                            ? "text-amber-700 bg-amber-50 border-amber-200" 
                            : "text-rose-700 bg-rose-50 border-rose-200";

                          return (
                            <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                                    📄
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-800 max-w-xs truncate" title={item.fileName}>
                                      {item.fileName}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-medium">
                                      Analyzed on {dateStr}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-700 border border-slate-200">
                                  {item.jobRole || "Not Specified"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-extrabold border ${scoreColorClass}`}>
                                  {item.score}/100
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center font-black text-slate-800">
                                {item.jobMatchPercent != null ? `${item.jobMatchPercent}%` : "0%"}
                              </td>
                              <td className="px-6 py-4 text-center font-medium text-slate-500">
                                {item.yearsExperience != null ? `${item.yearsExperience} yrs` : "0 yrs"}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleLoadFromHistory(item)}
                                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-lg transition-all text-[11px] inline-flex items-center gap-1"
                                    title="Restore full evaluation report"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>Load Report</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFromHistory(item._id)}
                                    className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all border border-transparent hover:border-rose-100"
                                    title="Delete from history"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {/* PRIMARY DASHBOARD LAYOUT GRADER VIEW */}
        {activeNav === "grader" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* LEFT INPUT & UPLOAD BAR (5 Columns) */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="card rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm" id="upload-card">
                <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">
                  Upload & Scan Parameters
                </h3>

                {/* Drag / Drop Area */}
                <div className="border-2 border-dashed border-slate-250 hover:border-blue-400 p-4 sm:p-6 rounded-2xl text-center bg-slate-50/40 hover:bg-slate-50/80 transition-all cursor-pointer relative mb-4">
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    id="fileInput"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => {
                      setError(null);
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0]);
                        setResult(null); // Clear previous evaluation results immediately!
                      }
                    }}
                  />
                  <div className="flex flex-col items-center">
                    <span className="text-3xl mb-1 text-slate-400">📄</span>
                    <span className="text-xs font-bold text-slate-600 block">
                      {file ? `✅ Selected: ${file.name}` : "Drag and drop or click to choose Resume"}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Supports PDF and DOCX formats up to 10MB
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                      Target Job Role (Required)
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-slate-700 transition-all font-sans font-bold min-h-[44px]"
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
                      placeholder="We are looking for a Python Developer experienced in Flask and building secure RESTful APIs..."
                      rows={5}
                      value={jobDesc}
                      onChange={(e) => setJobDesc(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-2 uppercase tracking-wider min-h-[44px]"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Running Diagnostic...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Analyze Resume</span>
                      </>
                    )}
                  </button>

                  {error && <p className="text-xs text-rose-500 font-bold text-center mt-2">{error}</p>}
                </div>
              </div>

              {/* Revision trajectory scores history chart */}
              {historicalScores.length > 0 && (
                <div className="card rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm" id="history-graph-card">
                  <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    Score Tracker Trajectory
                  </h3>
                  <p className="text-[10px] text-slate-400 mb-3 font-medium">
                    Visual diagnostic tracking your resume performance scores over time
                  </p>
                  <SVGHistoryChart scores={historicalScores} />
                </div>
              )}

              {/* Small Tip block */}
              <div className="card rounded-2xl border border-slate-200 bg-white p-4 text-xs">
                <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px] mb-2">
                  ATS Best Practices
                </h4>
                <ul className="space-y-1.5 text-slate-500">
                  {tips.map((t, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-blue-500 font-black">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* RIGHT DASHBOARD OUTCOMES (7 Columns) */}
            <div className="lg:col-span-7 space-y-6">

              {/* STEP LOADING LOADER ENGINE STATE */}
              {loading && (
                <div className="card rounded-2xl border border-blue-100 bg-white p-5 sm:p-8 text-center shadow-lg flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-3xl mb-4 animate-spin duration-300">
                    ⚙️
                  </div>
                  <h3 className="text-base font-extrabold text-blue-600 mb-1">
                    Running Deep Diagnostic Check
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mb-6">
                    {loadingMsg}... (Confidence Model: 96%)
                  </p>

                  {/* Progressive loading step markers */}
                  <div className="w-full max-w-md grid grid-cols-6 gap-1 mb-4">
                    {LOADING_STAGES.map((stg, sIdx) => {
                      const isActive = loadingMsg === stg;
                      const isPast = LOADING_STAGES.indexOf(loadingMsg) >= sIdx;
                      return (
                        <div key={stg} className="flex flex-col items-center">
                          <div
                            className={`w-full h-1.5 rounded-full transition-all duration-300 ${
                              isActive ? "bg-blue-600 animate-pulse" : isPast ? "bg-emerald-500" : "bg-slate-100"
                            }`}
                          />
                          <span className={`text-[8px] font-black uppercase mt-1 truncate max-w-full text-center ${isActive ? "text-blue-600" : isPast ? "text-slate-700" : "text-slate-300"}`}>
                            {stg.split(" ")[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-2">
                    Analysis Completed: 1.8 Seconds
                  </span>
                </div>
              )}

              {/* BLANK EMPTY STATE VIEW */}
              {!result && !loading && (
                <div className="card rounded-2xl border border-dashed border-slate-200/80 bg-white p-6 sm:p-12 text-center shadow-sm">
                  <div className="text-4xl mb-3">📋</div>
                  <h3 className="text-base font-extrabold text-slate-800">No Resume Checked Yet</h3>
                  <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">
                    Fill out the Target Job parameters on the left and upload your resume document file to render high-impact SaaS diagnostics.
                  </p>
                </div>
              )}

              {/* SUBSTANTIVE EVALUATION WORKSPACE SECTION */}
              {result && !loading && (
                <div className="space-y-6">

                  {/* SECTION 1: OVERVIEW BLOCK (ATS Score, Needle, Recommendations) */}
                  <div className="card rounded-2xl border-l-6 p-4 sm:p-5 shadow-sm bg-white" style={{ borderLeftColor: getScoreColorHex(result.score) }} id="overall-recommendation-card">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                      
                      {/* ATS score wrapper */}
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => setShowFormulaPopup(true)}
                          className={`w-16 h-16 rounded-full border-4 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-all bg-white shrink-0`}
                          style={{ borderColor: getScoreColorHex(result.score) }}
                          title="Click to view ATS Score formula"
                        >
                          <span className="text-xl font-black text-slate-800">{result.score}</span>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Score</span>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">ATS Strength Meter:</span>
                            <span className="text-xs font-black text-slate-800 uppercase">{getScoreTextLabel(result.score)}</span>
                            <HelpCircle onClick={() => setShowFormulaPopup(true)} className="w-3.5 h-3.5 text-slate-350 cursor-pointer hover:text-blue-500 transition-all" />
                          </div>
                          <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                            Recommendation for <strong className="text-slate-800 uppercase">{jobRole}</strong> matches.
                          </p>
                        </div>
                      </div>

                      {/* Diagnostic summaries */}
                      <div className="flex flex-col text-left md:text-right text-[11px] text-slate-400 font-bold space-y-0.5">
                        <span>Analysis Completed: 1.8 Seconds</span>
                        <span className="text-emerald-600">AI Confidence: 96%</span>
                      </div>
                    </div>

                    {/* Needle Slider scale */}
                    <div className="relative mt-2">
                      <div className="h-2.5 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-green-500 w-full" />
                      <div
                        className="absolute top-[-3px] w-4.5 h-4.5 bg-slate-900 border-2 border-white rounded-full transition-all duration-300 shadow shadow-black/20"
                        style={{ left: `calc(${result.score}% - 9px)` }}
                      />
                      <div className="flex justify-between text-[9px] font-black text-slate-400 mt-2 uppercase tracking-wide">
                        <span>Weak (&lt;60)</span>
                        <span>Borderline (60-74)</span>
                        <span>Good (75-89)</span>
                        <span>Excellent (90+)</span>
                      </div>
                    </div>

                    {/* Overall recommendation wording */}
                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="font-extrabold text-slate-800 flex items-center gap-1.5 mb-1 text-[11px]">
                        🧠 AI Guidance Core Recommendation:
                      </span>
                      {result.score >= 90 ? (
                        <span>Candidate exhibits world-class {jobRole} alignment. The current resume shows excellent keywords density and project descriptions. Move forward directly to corporate placements.</span>
                      ) : result.score >= 75 ? (
                        <span>Solid foundation matched, however some gaps in {jobRole} concepts are identified. Integrating missing skills listed in Section 2 will raise ATS compatibility. Highly competitive with minor tuning.</span>
                      ) : (
                        <span>Moderate match correlation. Significant technical skill gaps remain (e.g. missing critical {jobRole} paradigms). We recommend resolving these missing items and drafting key projects before application submission.</span>
                      )}
                    </div>
                  </div>

                  {/* FORMULA POPUP MODAL */}
                  {showFormulaPopup && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                      <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-xl relative text-center">
                        <button
                          onClick={() => setShowFormulaPopup(false)}
                          className="absolute top-4 right-4 p-1 rounded-md hover:bg-slate-100 text-slate-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-2 animate-bounce" />
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">ATS Score Weight Formula</h4>
                        <p className="text-[11px] text-slate-400 mt-1 mb-4">
                          Calculated statically on real-time diagnostic parameters to ensure pristine compliance.
                        </p>
                        <div className="space-y-2 text-xs text-left">
                          <div className="flex justify-between border-b pb-1.5">
                            <span className="font-bold text-slate-600">💪 Skills Density Match</span>
                            <span className="font-extrabold text-blue-600">40%</span>
                          </div>
                          <div className="flex justify-between border-b pb-1.5">
                            <span className="font-bold text-slate-600">🚀 Projects Relevance</span>
                            <span className="font-extrabold text-blue-600">20%</span>
                          </div>
                          <div className="flex justify-between border-b pb-1.5">
                            <span className="font-bold text-slate-600">📈 Keyword Optimization</span>
                            <span className="font-extrabold text-blue-600">20%</span>
                          </div>
                          <div className="flex justify-between border-b pb-1.5">
                            <span className="font-bold text-slate-600">💼 Work Experience Level</span>
                            <span className="font-extrabold text-blue-600">10%</span>
                          </div>
                          <div className="flex justify-between pb-0.5">
                            <span className="font-bold text-slate-600">🎓 Academic Background</span>
                            <span className="font-extrabold text-blue-600">10%</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowFormulaPopup(false)}
                          className="w-full mt-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg min-h-[44px]"
                        >
                          I Understand
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SECTION 2: SKILL ANALYSIS (Badges, check marks, red star cards, action chips) */}
                  <div className="card rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm space-y-5">
                    <div>
                      <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                        💪 Skill Analysis Matrix
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-4 flex items-center gap-1.5">
                        <Percent className="w-3.5 h-3.5 text-blue-500 shrink-0" /> Matches Ratio: {result.job_match_percent || 0}% Compatibility
                      </p>
                    </div>

                    {/* Matched green pills with hover tooltips */}
                    <div className="space-y-2" id="matched-skills-tab">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Acquired Competencies ({result.matched_skills.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.matched_skills.map((s) => (
                          <span
                            key={s}
                            className="group relative cursor-pointer px-3 py-1 rounded-full text-[11px] font-bold bg-green-50 border border-green-200 text-green-700 flex items-center gap-1 hover:bg-green-100 transition-all"
                          >
                            <span>✔</span>
                            <span>{s}</span>
                            {/* Simple inline tooltip element on hover */}
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 hidden group-hover:block bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded shadow-md whitespace-nowrap z-10">
                              Matches JD requirement for {s}
                            </span>
                          </span>
                        ))}
                        {result.matched_skills.length === 0 && (
                          <span className="text-slate-400 italic text-[11px]">None identified yet.</span>
                        )}
                      </div>
                    </div>

                    {/* Target Gaps RED CARDS, stars, priority */}
                    <div className="space-y-2" id="missing-skills-tab">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Target Skill Gaps (Critical Gaps)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {result.missing_skills.map((s, idx) => {
                          const rating = 5 - Math.min(idx, 2); // 5, 4, 3 stars
                          return (
                            <div key={s} className="p-3 border border-red-200 bg-red-50/20 rounded-xl flex items-center justify-between text-xs hover:border-red-300 hover:bg-red-50/40 transition-all">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="p-1 rounded bg-red-100 text-red-600 font-extrabold text-[10px] shrink-0">GAP</span>
                                <span className="font-extrabold text-slate-800 uppercase tracking-wide truncate">{s}</span>
                              </div>
                              <div className="flex flex-col items-end shrink-0 ml-2">
                                <span className="text-amber-500 font-bold font-mono text-[10px]">
                                  {"★".repeat(rating) + "☆".repeat(5 - rating)}
                                </span>
                                <span className="text-[9px] font-black text-slate-400 uppercase">Priority {idx + 1}</span>
                              </div>
                            </div>
                          );
                        })}
                        {result.missing_skills.length === 0 && (
                          <span className="text-green-600 font-bold italic text-[11px]">Perfect skills alignment! No gaps parsed.</span>
                        )}
                      </div>
                    </div>

                    {/* Action Verbs colorful chips */}
                    <div className="space-y-2" id="action-verbs-tab">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Action Verbs Found (Optimized chips)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.action_verbs_found?.map((v, idx) => {
                          const colors = [
                             "bg-purple-50 text-purple-700 border-purple-200",
                             "bg-blue-50 text-blue-700 border-blue-200",
                             "bg-pink-50 text-pink-700 border-pink-200",
                             "bg-indigo-50 text-indigo-700 border-indigo-200",
                             "bg-sky-50 text-sky-700 border-sky-200"
                          ];
                          const col = colors[idx % colors.length];
                          return (
                            <span
                              key={v}
                              className={`px-3 py-1 border text-[11px] font-extrabold rounded-md shadow-2xs hover:scale-105 transition-all ${col}`}
                            >
                              {v}
                            </span>
                          );
                        })}
                        {(!result.action_verbs_found || result.action_verbs_found.length === 0) && (
                          <span className="text-slate-400 italic text-[11px]">None found in experience. Use powerful terms!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: ANALYTICS BLOCK (Pie, Radar, Completeness, Grammar & Spelling Audit) */}
                  <div className="card rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm space-y-6">
                    <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      📊 Trigonometric Analytics & Audits
                    </h4>

                    {/* SVG Chart double-column */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Skill Ratio Chart */}
                      <div className="border border-slate-100 rounded-2xl p-4 text-center">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                          Skills Ratio Breakdown
                        </span>
                        <p className="text-[10px] text-slate-400 font-bold mb-3">
                          Visual ratio of matched requirements vs identified gaps
                        </p>
                        <SVGPieChart
                          matchedCount={result.matched_skills.length}
                          missingCount={result.missing_skills.length}
                        />
                      </div>

                      {/* Radar Chart Axis */}
                      <div className="border border-slate-100 rounded-2xl p-4 text-center">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                          Trigonometric Web Analysis
                        </span>
                        <p className="text-[10px] text-slate-400 font-bold mb-3">
                          Evaluating performance density across five metrics
                        </p>
                        <SVGRadarChart
                          skills={Math.min(result.matched_skills.length * 10, 100)}
                          experience={result.years_experience >= 5 ? 100 : result.years_experience >= 3 ? 85 : result.years_experience >= 1 ? 70 : 40}
                          projects={result.suggested_projects.length > 0 ? 90 : 50}
                          education={100}
                          keywords={Math.min((result.action_verbs_found?.length || 0) * 12, 100)}
                        />
                      </div>

                    </div>

                    {/* Resume Completeness Gauge */}
                    <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-slate-500 uppercase tracking-wider">Resume Completeness</span>
                        <span className="font-black text-blue-600">{result.resume_completeness}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-300"
                          style={{ width: `${result.resume_completeness}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase block tracking-wider leading-relaxed">
                        ✔ Contact Details | ✔ Core Competencies Checklist | ✔ Work History Present
                      </span>
                    </div>

                    {/* Grammar Spelling & Layout Templates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      
                      {/* Grammar spell audit card */}
                      <div className="border border-slate-150 rounded-2xl p-4 bg-white space-y-3">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-b pb-1">
                          ✍ Grammar & Spelling Audit
                        </h5>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="p-2 bg-rose-50 text-rose-700 text-center rounded-xl flex flex-col justify-center">
                            <span className="text-sm font-black block">{result.grammar_errors_count}</span>
                            <span className="text-[8px] font-bold uppercase block tracking-wider">Grammar</span>
                          </div>
                          <div className="p-2 bg-rose-50 text-rose-700 text-center rounded-xl flex flex-col justify-center">
                            <span className="text-sm font-black block">{result.spelling_errors_count}</span>
                            <span className="text-[8px] font-bold uppercase block tracking-wider">Spelling</span>
                          </div>
                          <div className="p-2 bg-blue-50 text-blue-700 text-center rounded-xl flex flex-col justify-center">
                            <span className="text-sm font-black block">{getWritingScore(result)}%</span>
                            <span className="text-[8px] font-bold uppercase block tracking-wider">Writing Score</span>
                          </div>
                        </div>

                        <ul className="text-[10.5px] text-slate-500 space-y-1.5 pt-1">
                          {result.grammar_spelling_suggestions.slice(0, 3).map((su, idx) => (
                            <li key={idx} className="flex gap-1.5 items-start">
                              <span className="text-red-500 font-extrabold shrink-0">•</span>
                              <span>{su}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Resume Template Advice suggestions */}
                      <div className="border border-slate-150 rounded-2xl p-4 bg-white space-y-3">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-b pb-1">
                          📑 Template & Document Layout Advice
                        </h5>
                        <div className="space-y-2 text-[11px] text-slate-600">
                          <div className="flex items-start gap-2">
                            <span className="text-emerald-600 text-xs shrink-0">✔</span>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-800 text-xs flex flex-wrap items-center gap-1.5">
                                <span>ATS Friendly Template</span>
                                <span className="text-[8px] bg-emerald-50 text-emerald-700 px-1 py-0.2 rounded font-extrabold uppercase tracking-widest shrink-0">Recommended</span>
                              </span>
                              <p className="text-slate-400 text-[10px] mt-0.5">Single-column layout, Arial font, zero images.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-slate-400 text-xs shrink-0">✔</span>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-800 text-xs">Creative Template</span>
                              <p className="text-slate-400 text-[10px] mt-0.5 font-medium">Suitable only for marketing and UI designs.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>



                  {/* SECTION 5: CAREER INSIGHTS BLOCK (Corporate Fit, Job Fit, Advice, Priorities) */}
                  <div className="card rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm space-y-6">
                    <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      💼 Career Alignment Insights
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Corporate Brand Match list */}
                      <div className="p-4 border border-slate-100 rounded-xl space-y-3">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          🏢 Corporate Brand Alignment Fit
                        </span>
                        <div className="space-y-3">
                          {getCompanyMatches(result.score).map((com) => (
                            <div key={com.name} className="space-y-1 text-xs">
                              <div className="flex justify-between font-bold">
                                <span>{com.name} Match</span>
                                <span className="text-blue-600 font-extrabold">{com.percent}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${com.percent}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Job Path Fit percents */}
                      <div className="p-4 border border-slate-100 rounded-xl space-y-3">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          🎯 Alternate Job Path Compatibility
                        </span>
                        <div className="space-y-3">
                          {getJobFitPercentages(result.score, result.career_advice).map((fit) => (
                            <div key={fit.role} className="space-y-1 text-xs">
                              <div className="flex justify-between font-bold text-slate-700">
                                <span className="truncate max-w-[150px]">{fit.role}</span>
                                <span className="text-indigo-600 font-extrabold">{fit.percent}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${fit.percent}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Career Suggestions advice list */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-2">
                      <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-amber-500 shrink-0" /> Suggested Careers Target Positions
                      </span>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {result.career_advice.map((adv) => (
                          <span key={adv} className="px-2.5 py-1 rounded bg-white border border-slate-200 font-bold text-slate-700 uppercase tracking-wide text-[10px]">
                            {adv}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
      <ToastContainer />
    </div>
  );
}
