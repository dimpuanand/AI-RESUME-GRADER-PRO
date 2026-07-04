import React, { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, AlertCircle, PlayCircle, Award, BookOpen, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RoadmapProps {
  matchedSkills: string[];
  missingSkills: string[];
  jobRole: string;
}

export default function InteractiveRoadmap({ matchedSkills, missingSkills, jobRole }: RoadmapProps) {
  // Store expanded state for each of the 4 steps
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({
    1: true,
    2: false,
    3: false,
    4: false,
  });

  // Checklist of steps completed
  const [completedSteps, setCompletedSteps] = useState<{ [key: number]: boolean }>({
    1: true, // step 1 is generally completed on scan
    2: false,
    3: false,
    4: false,
  });

  const toggleExpand = (stepId: number) => {
    setExpanded((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const toggleCompleted = (stepId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent collapsing/expanding when checking
    setCompletedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  // Calculate dynamic progress
  const totalSteps = 4;
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);

  // Generate priority stars for gaps
  const getPriorityStars = (idx: number) => {
    const stars = 5 - Math.min(idx, 2); // 5, 4, 3 stars
    return "★".repeat(stars) + "☆".repeat(5 - stars);
  };

  return (
    <div className="card rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300" id="interactive-roadmap-card">
      {/* Header section with Learning Progress gauge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/20">
              <BookOpen className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              AI Roadmap
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Target Bridge: {jobRole || "Software Developer"}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-md">
            This step-by-step personalized curriculum bridges your candidate profile gaps and aligns you for successful placement interviews.
          </p>
        </div>

        {/* Learning progress indicator */}
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl min-w-[160px] text-center">
          <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
            Learning Progress
          </span>
          <span className="text-2xl font-black text-blue-600">
            {progressPercent}%
          </span>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Accordion Steps List */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
        
        {/* STEP 1: CURRENT SKILLS */}
        <div className="relative">
          {/* Step Bubble indicator */}
          <button
            onClick={(e) => toggleCompleted(1, e)}
            className={`absolute left-[-21px] top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
              completedSteps[1]
                ? "bg-green-500 border-green-500 text-white"
                : "bg-white border-slate-300 text-slate-300 hover:border-blue-500"
            }`}
            title="Mark Step as Completed"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>

          {/* Collapsible Header Card */}
          <div
            onClick={() => toggleExpand(1)}
            className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
              expanded[1]
                ? "bg-slate-50/50 border-slate-200 shadow-sm"
                : "bg-white border-slate-150 hover:bg-slate-50/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-0.5">
                  Step 1
                </span>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>Current Skill Inventory</span>
                  {completedSteps[1] && (
                    <span className="text-[9px] font-extrabold bg-green-50 border border-green-200 text-green-700 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      Verified
                    </span>
                  )}
                </h3>
              </div>
              <span>
                {expanded[1] ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </span>
            </div>

            <AnimatePresence initial={false}>
              {expanded[1] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 border-t border-slate-100 mt-3 text-xs">
                    <p className="text-slate-600 mb-3 leading-relaxed">
                      We've mapped your current resume skills against the target role. You've already established a solid foundation in these {matchedSkills.length} competencies:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {matchedSkills.map((s) => (
                        <span key={s} className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-green-50 border border-green-200/60 text-green-700 flex items-center gap-1">
                          <span>✔</span>
                          <span>{s}</span>
                        </span>
                      ))}
                      {matchedSkills.length === 0 && (
                        <span className="text-slate-400 italic">No exact matches parsed yet. Upload standard resumes matching Flask.</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* STEP CONNECTOR ARROW */}
        <div className="flex justify-center text-slate-300 text-sm select-none py-1 pointer-events-none">↓</div>

        {/* STEP 2: SKILL GAP ANALYSIS */}
        <div className="relative">
          <button
            onClick={(e) => toggleCompleted(2, e)}
            className={`absolute left-[-21px] top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
              completedSteps[2]
                ? "bg-green-500 border-green-500 text-white"
                : "bg-white border-slate-300 text-slate-300 hover:border-blue-500"
            }`}
            title="Mark Step as Completed"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>

          <div
            onClick={() => toggleExpand(2)}
            className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
              expanded[2]
                ? "bg-slate-50/50 border-slate-200 shadow-sm"
                : "bg-white border-slate-150 hover:bg-slate-50/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-0.5">
                  Step 2
                </span>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>Skill Gap Analysis</span>
                  {completedSteps[2] && (
                    <span className="text-[9px] font-extrabold bg-green-50 border border-green-200 text-green-700 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      Learned
                    </span>
                  )}
                </h3>
              </div>
              <span>
                {expanded[2] ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </span>
            </div>

            <AnimatePresence initial={false}>
              {expanded[2] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 border-t border-slate-100 mt-3 text-xs">
                    <p className="text-slate-600 mb-3 leading-relaxed">
                      The following critical skills are missing or weak in your profile. Prioritize mastering these immediately to align with the target Job Description:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {missingSkills.map((s, idx) => (
                        <div key={s} className="p-3 bg-red-50/40 border border-red-100/80 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-red-500">
                              <AlertCircle className="w-4 h-4" />
                            </span>
                            <span className="font-bold text-slate-800 uppercase tracking-wide text-xs">{s}</span>
                          </div>
                          <span className="text-amber-500 font-mono font-extrabold text-[11px] tracking-wide" title="Priority Stars">
                            {getPriorityStars(idx)}
                          </span>
                        </div>
                      ))}
                      {missingSkills.length === 0 && (
                        <span className="text-green-600 font-bold italic">Perfect alignment! No skill gaps detected.</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* STEP CONNECTOR ARROW */}
        <div className="flex justify-center text-slate-300 text-sm select-none py-1 pointer-events-none">↓</div>

        {/* STEP 3: RECOMMENDED LEARNING */}
        <div className="relative">
          <button
            onClick={(e) => toggleCompleted(3, e)}
            className={`absolute left-[-21px] top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
              completedSteps[3]
                ? "bg-green-500 border-green-500 text-white"
                : "bg-white border-slate-300 text-slate-300 hover:border-blue-500"
            }`}
            title="Mark Step as Completed"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>

          <div
            onClick={() => toggleExpand(3)}
            className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
              expanded[3]
                ? "bg-slate-50/50 border-slate-200 shadow-sm"
                : "bg-white border-slate-150 hover:bg-slate-50/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-0.5">
                  Step 3
                </span>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>Recommended Learning Path</span>
                  {completedSteps[3] && (
                    <span className="text-[9px] font-extrabold bg-green-50 border border-green-200 text-green-700 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      Enrolled
                    </span>
                  )}
                </h3>
              </div>
              <span>
                {expanded[3] ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </span>
            </div>

            <AnimatePresence initial={false}>
              {expanded[3] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 border-t border-slate-100 mt-3 text-xs space-y-3">
                    <p className="text-slate-600 leading-relaxed">
                      Follow these structured curricula to acquire missing concepts and build practical proof-of-work:
                    </p>
                    
                    {missingSkills.map((s, idx) => (
                      <div key={s} className="p-3 bg-white border border-slate-150 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm hover:border-blue-300 transition-all">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-extrabold text-blue-500 uppercase">Track {idx + 1}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            <span className="text-[11px] font-bold text-slate-700 uppercase">Master {s}</span>
                          </div>
                          <p className="text-slate-500 text-[11.5px] leading-relaxed">
                            Complete the official certification courses, followed by creating a production repository on GitHub utilizing <strong>{s}</strong>.
                          </p>
                        </div>
                        <a
                          href={`https://www.google.com/search?q=best+courses+to+learn+${encodeURIComponent(s)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md font-bold text-[10.5px] hover:bg-blue-100 transition-all whitespace-nowrap self-start md:self-center"
                        >
                          <PlayCircle className="w-3.5 h-3.5" /> Start Learning
                        </a>
                      </div>
                    ))}

                    {missingSkills.length === 0 && (
                      <div className="p-3 bg-green-50/50 border border-green-150 text-green-700 rounded-lg">
                        ✨ Outstanding! You already have all the skills requested in this Job Description. Jump directly to Step 4.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* STEP CONNECTOR ARROW */}
        <div className="flex justify-center text-slate-300 text-sm select-none py-1 pointer-events-none">↓</div>

        {/* STEP 4: INTERVIEW READY */}
        <div className="relative">
          <button
            onClick={(e) => toggleCompleted(4, e)}
            className={`absolute left-[-21px] top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
              completedSteps[4]
                ? "bg-green-500 border-green-500 text-white"
                : "bg-white border-slate-300 text-slate-300 hover:border-blue-500"
            }`}
            title="Mark Step as Completed"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>

          <div
            onClick={() => toggleExpand(4)}
            className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
              expanded[4]
                ? "bg-slate-50/50 border-slate-200 shadow-sm"
                : "bg-white border-slate-150 hover:bg-slate-50/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-0.5">
                  Step 4
                </span>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>Interview Ready Validation</span>
                  {completedSteps[4] && (
                    <span className="text-[9px] font-extrabold bg-green-50 border border-green-200 text-green-700 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      Done
                    </span>
                  )}
                </h3>
              </div>
              <span>
                {expanded[4] ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </span>
            </div>

            <AnimatePresence initial={false}>
              {expanded[4] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 border-t border-slate-100 mt-3 text-xs space-y-3 text-slate-600 leading-relaxed">
                    <p>
                      Before sending your resume to executive recruiters, make sure you execute the final professional alignment checklist:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <input type="checkbox" defaultChecked className="mt-0.5 rounded text-blue-600" />
                        <span>Ensure your PDF document utilizes Inter typography and contains zero spelling/grammar errors.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <input type="checkbox" defaultChecked className="mt-0.5 rounded text-blue-600" />
                        <span>Highlight quantified metrics for Flask web-service endpoints (e.g. "implemented RESTful routes serving 450,000 requests daily with 99.9% uptime").</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <input type="checkbox" defaultChecked className="mt-0.5 rounded text-blue-600" />
                        <span>Practice standard backend system architecture questions (e.g. DB connection pooling, rate limiters, caching strategies).</span>
                      </div>
                    </div>
                    <div className="pt-3 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert("🎉 Ready to apply! Standard ATS score is strong. Let's showcase your project review!");
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold text-xs shadow hover:opacity-90 transition-all"
                      >
                        Launch Mock Interview Mockup
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
