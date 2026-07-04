import React, { useState } from "react";
import { ZoomIn, ZoomOut, Eye, FileText, ChevronLeft, ChevronRight, Download, Maximize, Printer } from "lucide-react";

interface PreviewProps {
  fileName: string;
  matchedSkills: string[];
  missingSkills: string[];
  weakKeywords: string[];
  yearsExperience: number;
  candidateName?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  candidateLocation?: string;
  executiveSummary?: string;
  workExperience?: Array<{
    role: string;
    company: string;
    duration: string;
    bullet_points: string[];
  }>;
}

export default function ResumePreview({
  fileName,
  matchedSkills,
  missingSkills,
  weakKeywords,
  yearsExperience,
  candidateName = "",
  candidateEmail = "",
  candidatePhone = "",
  candidateLocation = "",
  executiveSummary = "",
  workExperience = [],
}: PreviewProps) {
  const [zoom, setZoom] = useState<number>(100);
  const [page, setPage] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const zoomIn = () => setZoom((z) => Math.min(z + 10, 140));
  const zoomOut = () => setZoom((z) => Math.max(z - 10, 70));

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDownloadMock = () => {
    alert(`⬇️ Downloading PDF version of parsed resume: '${fileName}'`);
  };

  return (
    <div
      className={`card flex flex-col h-full rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 ${
        isFullscreen ? "fixed inset-4 z-50 bg-slate-900 border-none p-4" : "bg-white"
      }`}
      id="resume-preview-card"
    >
      {/* ADOBE ACROBAT HEADER PANEL BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800 text-slate-100 px-4 py-3 rounded-t-2xl">
        {/* File and logo context */}
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-red-500 animate-pulse" />
          <div>
            <h4 className="text-xs font-bold text-white truncate max-w-[160px] md:max-w-[200px]" title={fileName}>
              {fileName}
            </h4>
            <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest block">
              Adobe PDF Viewer Mock
            </span>
          </div>
        </div>

        {/* Toolbar parameters */}
        <div className="flex items-center gap-3">
          {/* Zoom Panel */}
          <div className="flex items-center bg-slate-700 rounded-md p-1 gap-1">
            <button
              className="p-1 rounded hover:bg-slate-600 text-slate-300 transition-all"
              onClick={zoomOut}
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold text-white w-10 text-center select-none">
              {zoom}%
            </span>
            <button
              className="p-1 rounded hover:bg-slate-600 text-slate-300 transition-all"
              onClick={zoomIn}
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-600" />

          {/* Tools & Download */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleDownloadMock}
              className="p-1.5 rounded hover:bg-slate-700 text-slate-300 transition-all"
              title="Download Resume PDF"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => alert("📤 Printing document parameters...")}
              className="p-1.5 rounded hover:bg-slate-700 text-slate-300 transition-all"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded hover:bg-slate-700 text-slate-300 transition-all"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Viewer"}
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CENTRAL PDF BOARD SHEET - GREY INNER CANVAS VIEW */}
      <div className="flex-1 overflow-auto bg-slate-600/90 dark:bg-slate-950 p-6 flex justify-center items-start min-h-[400px]">
        <div
          className="bg-white text-slate-800 shadow-2xl border border-slate-300 rounded p-8 text-left transition-all duration-150 origin-top font-sans shadow-black/25"
          style={{
            width: "100%",
            maxWidth: "640px",
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
            lineHeight: 1.6,
          }}
        >
          {/* Resume Body */}
          <div className="space-y-4 font-sans text-xs">
            {/* Centered Profile Header */}
            <div className="text-center border-b border-slate-200 pb-3">
              <h1 className="text-lg font-extrabold text-slate-900 uppercase tracking-wide">
                {candidateName}
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">
                Email: {candidateEmail} | Phone: {candidatePhone} | {candidateLocation}
              </p>
            </div>

            {/* Profile summary */}
            <div>
              <h3 className="text-[10.5px] font-extrabold text-blue-700 uppercase tracking-wider border-b border-slate-100 pb-0.5 mb-1.5">
                Executive Profile Summary
              </h3>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {executiveSummary || `Result-driven professional offering ${yearsExperience}+ years of hands-on experience designing, deploying, and maintaining high-performance systems and software solutions.`}
              </p>
            </div>

            {/* Technical skills list parsed */}
            <div>
              <h3 className="text-[10.5px] font-extrabold text-blue-700 uppercase tracking-wider border-b border-slate-100 pb-0.5 mb-1.5">
                Technical Expertise Matrix
              </h3>
              <div className="flex flex-wrap gap-1">
                {matchedSkills.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200"
                  >
                    {s} [✔]
                  </span>
                ))}
                {missingSkills.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"
                  >
                    {s} [✖]
                  </span>
                ))}
              </div>
            </div>

            {/* Weak clichés audit */}
            {weakKeywords.length > 0 && (
              <div>
                <h3 className="text-[10.5px] font-extrabold text-blue-700 uppercase tracking-wider border-b border-slate-100 pb-0.5 mb-1.5">
                  Action Verb Audit & overused Buzzwords
                </h3>
                <div className="flex flex-wrap gap-1">
                  {weakKeywords.map((w) => (
                    <span
                      key={w}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200"
                    >
                      {w} [Yellow Light]
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience details block */}
            {workExperience && workExperience.length > 0 && (
              <div>
                <h3 className="text-[10.5px] font-extrabold text-blue-700 uppercase tracking-wider border-b border-slate-100 pb-0.5 mb-1.5">
                  Professional Work Experience
                </h3>
                <div className="space-y-3">
                  {workExperience.map((exp, index) => (
                    <div key={index} className="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                      <div className="flex justify-between font-bold text-slate-800 text-[11px]">
                        <span>{exp.role}</span>
                        <span>{exp.duration}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 italic">{exp.company}</p>
                      <ul className="list-disc pl-4 text-slate-600 text-[11px] space-y-0.5 mt-1">
                        {exp.bullet_points.map((bullet, bIdx) => (
                          <li key={bIdx}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ADOBE READER BOTTOM NAVIGATION AND PAGE COUNTER */}
      <div className="bg-slate-800 text-slate-300 px-4 py-2.5 rounded-b-2xl flex items-center justify-between text-xs select-none">
        <span>Adobe PDF Engine Active</span>
        <div className="flex items-center gap-2">
          <button
            className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-40"
            onClick={() => page > 1 && setPage(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span>Page {page} of {yearsExperience >= 3 ? "2" : "1"}</span>
          <button
            className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-40"
            onClick={() => page < (yearsExperience >= 3 ? 2 : 1) && setPage(page + 1)}
            disabled={page === (yearsExperience >= 3 ? 2 : 1)}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
