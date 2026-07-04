import { jsPDF } from "jspdf";
import { ResumeAnalysis } from "../types";

/**
 * Generates a beautiful professional PDF report of the ATS analysis
 */
export function generatePDFReport(result: ResumeAnalysis, candidateName: string, jobRole: string) {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // --- Theme Colors ---
  const primaryColor = [15, 23, 42]; // Slate 900
  const secondaryColor = [37, 99, 235]; // Blue 600
  const successColor = [22, 163, 74]; // Green 600
  const dangerColor = [220, 38, 38]; // Red 600
  const lightBg = [248, 250, 252]; // Slate 50
  const borderLine = [226, 232, 240]; // Slate 200

  // Helper for setting color
  const setFill = (rgb: number[]) => doc.setFillColor(rgb[0], rgb[1], rgb[2]);
  const setText = (rgb: number[]) => doc.setTextColor(rgb[0], rgb[1], rgb[2]);

  // --- Header Block ---
  setFill(primaryColor);
  doc.rect(0, 0, 210, 45, "F");

  // Title text in white
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("ATS RESUME EVALUATION REPORT", 15, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("POWERED BY INTUITIVE GEN-AI RADAR", 15, 28);
  doc.text(`DATE GENERATED: ${dateStr.toUpperCase()}`, 15, 36);

  // --- Candidate & Role Info Panel ---
  setText(primaryColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("CANDIDATE INFORMATION", 15, 58);
  doc.line(15, 60, 195, 60);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Name:`, 15, 67);
  doc.setFont("helvetica", "bold");
  doc.text(`${candidateName}`, 40, 67);

  doc.setFont("helvetica", "normal");
  doc.text(`Target Position:`, 15, 73);
  doc.setFont("helvetica", "bold");
  doc.text(`${jobRole}`, 40, 73);

  doc.setFont("helvetica", "normal");
  doc.text(`Experience:`, 115, 67);
  doc.setFont("helvetica", "bold");
  doc.text(`${result.years_experience || 0} Years`, 140, 67);

  doc.setFont("helvetica", "normal");
  doc.text(`Completeness:`, 115, 73);
  doc.setFont("helvetica", "bold");
  doc.text(`${result.resume_completeness}%`, 140, 73);

  // --- ATS Core Score Banner ---
  setFill(lightBg);
  doc.rect(15, 82, 180, 26, "F");
  doc.setDrawColor(borderLine[0], borderLine[1], borderLine[2]);
  doc.rect(15, 82, 180, 26, "S");

  // Draw circular score display simulation
  let ratingLabel = "Excellent";
  let scoreColor = successColor;
  if (result.score >= 90) {
    ratingLabel = "EXCELLENT";
    scoreColor = successColor;
  } else if (result.score >= 75) {
    ratingLabel = "GOOD MATCH";
    scoreColor = [59, 130, 246]; // Blue 500
  } else if (result.score >= 60) {
    ratingLabel = "AVERAGE";
    scoreColor = [217, 119, 6]; // Amber 600
  } else {
    ratingLabel = "NEEDS IMPROVEMENT";
    scoreColor = dangerColor;
  }

  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.text(`${result.score}`, 28, 101);

  doc.setFontSize(11);
  doc.text("/100", 54, 93);

  setText(primaryColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`${ratingLabel}`, 80, 93);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text("The score is computed using semantic analysis, keyword matching ratio,", 80, 99);
  doc.text("action keyword density, experience level correlation, and structural presence.", 80, 104);

  // --- Section: Skills Match & Gaps ---
  // Matched Skills Box (Left half)
  setFill([240, 253, 244]); // Light green
  doc.rect(15, 117, 86, 65, "F");
  doc.rect(15, 117, 86, 65, "S");

  doc.setTextColor(successColor[0], successColor[1], successColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("MATCHED SKILLS (STRENGTHS)", 20, 124);
  doc.line(20, 126, 95, 126);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  let yMatch = 132;
  const matchSlice = result.matched_skills.slice(0, 10);
  if (matchSlice.length === 0) {
    doc.text("• No specific skills detected.", 22, yMatch);
  } else {
    matchSlice.forEach((skill) => {
      if (yMatch < 178) {
        doc.text(`[YES]  ${skill}`, 22, yMatch);
        yMatch += 5.5;
      }
    });
    if (result.matched_skills.length > 10) {
      doc.text(`+ ${result.matched_skills.length - 10} more skills matched...`, 22, yMatch);
    }
  }

  // Missing Skills Box (Right half)
  setFill([254, 242, 242]); // Light red
  doc.rect(109, 117, 86, 65, "F");
  doc.rect(109, 117, 86, 65, "S");

  doc.setTextColor(dangerColor[0], dangerColor[1], dangerColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("MISSING SKILLS (GAPS)", 114, 124);
  doc.line(114, 126, 189, 126);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  let yMiss = 132;
  const missingSlice = result.missing_skills.slice(0, 10);
  if (missingSlice.length === 0) {
    doc.text("• Perfect! No critical skill gaps found.", 116, yMiss);
  } else {
    missingSlice.forEach((skill) => {
      if (yMiss < 178) {
        doc.text(`[GAP]  ${skill}`, 116, yMiss);
        yMiss += 5.5;
      }
    });
    if (result.missing_skills.length > 10) {
      doc.text(`+ ${result.missing_skills.length - 10} more gaps detected...`, 116, yMiss);
    }
  }

  // --- Section: AI Recommendations ---
  setText(primaryColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("STRATEGIC RECOMMENDATIONS FOR IMPROVEMENT", 15, 194);
  doc.line(15, 196, 195, 196);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(40, 40, 40);
  let ySug = 203;
  result.suggestions.forEach((sug, idx) => {
    // Strip bold markers if any
    const cleanSug = sug.replace(/\*\*/g, "");
    const splitSug = doc.splitTextToSize(`${idx + 1}. ${cleanSug}`, 180);
    splitSug.forEach((line: string) => {
      if (ySug < 280) {
        doc.text(line, 15, ySug);
        ySug += 5;
      }
    });
    ySug += 2.5; // space between suggestions
  });

  // Footer on page 1
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Confidential ATS Score Report • Intuitive AI Resume Grader Ecosystem", 15, 287);
  doc.text("Page 1 of 1", 185, 287);

  // Trigger download
  const safeName = candidateName.replace(/\s+/g, "_").toLowerCase();
  doc.save(`${safeName}_ats_report.pdf`);
}

/**
 * Downloads a spreadsheet-compatible CSV file of resume skills
 */
export function downloadCSV(matched: string[], missing: string[], jobRole: string) {
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += `"Evaluation Category","Skill Name","Status"\r\n`;

  matched.forEach((skill) => {
    csvContent += `"Matched Skill","${skill.replace(/"/g, '""')}","Acquired"\r\n`;
  });

  missing.forEach((skill) => {
    csvContent += `"Missing Skill","${skill.replace(/"/g, '""')}","Target Gap"\r\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  const safeRole = jobRole.replace(/\s+/g, "_").toLowerCase();
  link.setAttribute("download", `resume_skills_${safeRole}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Downloads a plaintext-formatted text document mimicking an elegant markdown format
 */
export function downloadDOCX(result: ResumeAnalysis, candidateName: string, jobRole: string) {
  const content = `
========================================================================
             ATS RESUME EVALUATION REPORT (MARKDOWN FORMAT)
========================================================================
Candidate Name : ${candidateName}
Target Role    : ${jobRole}
Date Evaluated : ${new Date().toLocaleDateString()}
ATS Score      : ${result.score} / 100
Strength Level : ${result.score >= 90 ? "Excellent" : result.score >= 75 ? "Good" : result.score >= 60 ? "Average" : "Needs Improvement"}
Completeness   : ${result.resume_completeness}%
Experience     : ${result.years_experience || 0} Years

------------------------------------------------------------------------
1. SCORE BREAKDOWN
------------------------------------------------------------------------
* Skills Fit  : ${Math.round(Math.min(result.matched_skills.length / 10, 1) * 40)} / 40
* Experience  : ${result.years_experience >= 5 ? 30 : result.years_experience >= 3 ? 26 : result.years_experience >= 1 ? 20 : 10} / 30
* Keyword Fill: ${Math.round(Math.min(result.action_verbs_found.length / 10, 1) * 20)} / 20
* Education   : 10 / 10

------------------------------------------------------------------------
2. MATCHED SKILLS (STRENGTHS)
------------------------------------------------------------------------
${result.matched_skills.map((s) => `[X] ${s}`).join("\n")}

------------------------------------------------------------------------
3. MISSING SKILLS (CRITICAL GAP IDENTIFIERS)
------------------------------------------------------------------------
${result.missing_skills.map((s) => `[ ] ${s}`).join("\n")}

------------------------------------------------------------------------
4. SYSTEM IMPROVEMENT ROADMAP / SUGGESTIONS
------------------------------------------------------------------------
${result.suggestions.map((s, i) => `${i + 1}. ${s.replace(/\*\*/g, "")}`).join("\n\n")}

------------------------------------------------------------------------
5. SUGGESTED TARGET PROJECTS TO EXPAND PORTFOLIO
------------------------------------------------------------------------
${result.suggested_projects.map((p) => `• ${p}`).join("\n")}

------------------------------------------------------------------------
6. REQUISITE INDUSTRY CERTIFICATIONS
------------------------------------------------------------------------
${result.recommended_certifications.map((c) => `✔ ${c}`).join("\n")}

------------------------------------------------------------------------
7. CAREER PATH RECOMMENDATIONS
------------------------------------------------------------------------
${result.career_advice.map((a) => `➔ ${a}`).join("\n")}

------------------------------------------------------------------------
                     Report compiled by AI Studio
========================================================================
`.trim();

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const safeRole = jobRole.replace(/\s+/g, "_").toLowerCase();
  link.download = `${candidateName.replace(/\s+/g, "_").toLowerCase()}_resume_eval_${safeRole}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
