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

  let y = 15;

  const drawHeaderBlock = () => {
    setFill(primaryColor);
    doc.rect(0, 0, 210, 42, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("ATS RESUME EVALUATION REPORT", 15, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("POWERED BY INTUITIVE GEN-AI SAAS RADAR", 15, 25);
    doc.text(`DATE GENERATED: ${dateStr.toUpperCase()}`, 15, 32);
  };

  const ensureSpace = (heightNeeded: number) => {
    if (y + heightNeeded > 275) {
      doc.addPage();
      // Draw a subtle header on sub pages
      setFill([15, 23, 42]);
      doc.rect(0, 0, 210, 15, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(`ATS RESUME EVALUATION REPORT - ${candidateName.toUpperCase()}`, 15, 10);
      y = 25;
    }
  };

  // Page 1 First Header
  drawHeaderBlock();
  y = 52;

  // --- Candidate & Role Info Panel ---
  setText(primaryColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("CANDIDATE INFORMATION", 15, y);
  doc.setDrawColor(borderLine[0], borderLine[1], borderLine[2]);
  doc.line(15, y + 2, 195, y + 2);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Name:", 15, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${candidateName}`, 45, y);

  doc.setFont("helvetica", "normal");
  doc.text("Experience:", 115, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${result.years_experience || 0} Years`, 140, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.text("Target Position:", 15, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${jobRole}`, 45, y);

  doc.setFont("helvetica", "normal");
  doc.text("Completeness:", 115, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${result.resume_completeness}%`, 140, y);
  y += 12;

  // --- ATS Core Score Banner ---
  ensureSpace(28);
  setFill(lightBg);
  doc.rect(15, y, 180, 25, "F");
  doc.setDrawColor(borderLine[0], borderLine[1], borderLine[2]);
  doc.rect(15, y, 180, 25, "S");

  let ratingLabel = "EXCELLENT";
  let scoreColor = successColor;
  if (result.score >= 90) {
    ratingLabel = "EXCELLENT MATCH";
    scoreColor = successColor;
  } else if (result.score >= 75) {
    ratingLabel = "GOOD MATCH";
    scoreColor = [37, 99, 235]; // Blue 600
  } else if (result.score >= 60) {
    ratingLabel = "BORDERLINE MATCH";
    scoreColor = [217, 119, 6]; // Amber 600
  } else {
    ratingLabel = "WEAK MATCH";
    scoreColor = dangerColor;
  }

  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(32);
  doc.text(`${result.score}`, 25, y + 17);

  doc.setFontSize(10);
  doc.text("/100", 48, y + 10);

  setText(primaryColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`${ratingLabel}`, 75, y + 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Calculated dynamically based on real-time parser compliance metrics.", 75, y + 14);
  doc.text("Evaluating skills density, keyword relevance, work history and spell check audits.", 75, y + 19);
  y += 33;

  // --- Side-by-Side Skills & Gaps ---
  ensureSpace(50);
  // Left: Acquired Skills
  setFill([240, 253, 244]); // Light green
  doc.rect(15, y, 86, 44, "F");
  doc.setDrawColor(22, 163, 74);
  doc.rect(15, y, 86, 44, "S");

  doc.setTextColor(22, 163, 74);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("ACQUIRED SKILLS (STRENGTHS)", 20, y + 6);
  doc.line(20, y + 8, 95, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);
  let yMatch = y + 13;
  const matchSlice = result.matched_skills.slice(0, 5);
  if (matchSlice.length === 0) {
    doc.text("• No specific skills detected.", 22, yMatch);
  } else {
    matchSlice.forEach((skill) => {
      doc.text(`[YES]  ${skill}`, 22, yMatch);
      yMatch += 5;
    });
    if (result.matched_skills.length > 5) {
      doc.text(`+ ${result.matched_skills.length - 5} more skills matched...`, 22, yMatch);
    }
  }

  // Right: Critical Skill Gaps
  setFill([254, 242, 242]); // Light red
  doc.rect(109, y, 86, 44, "F");
  doc.setDrawColor(220, 38, 38);
  doc.rect(109, y, 86, 44, "S");

  doc.setTextColor(220, 38, 38);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("CRITICAL SKILL GAPS", 114, y + 6);
  doc.line(114, y + 8, 189, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);
  let yMiss = y + 13;
  const missingSlice = result.missing_skills.slice(0, 5);
  if (missingSlice.length === 0) {
    doc.text("• Perfect! No critical skill gaps found.", 116, yMiss);
  } else {
    missingSlice.forEach((skill) => {
      doc.text(`[GAP]  ${skill}`, 116, yMiss);
      yMiss += 5;
    });
    if (result.missing_skills.length > 5) {
      doc.text(`+ ${result.missing_skills.length - 5} more gaps detected...`, 116, yMiss);
    }
  }
  y += 52;

  // --- AI Recommendations ---
  ensureSpace(40);
  setText(primaryColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("AI STRATEGIC RECOMMENDATIONS", 15, y);
  doc.setDrawColor(borderLine[0], borderLine[1], borderLine[2]);
  doc.line(15, y + 2, 195, y + 2);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(40, 40, 40);
  result.suggestions.forEach((sug, idx) => {
    const cleanSug = sug.replace(/\*/g, "");
    const splitSug = doc.splitTextToSize(`${idx + 1}. ${cleanSug}`, 180);
    ensureSpace(splitSug.length * 4.5 + 2);
    splitSug.forEach((line: string) => {
      doc.text(line, 15, y);
      y += 4.5;
    });
    y += 1.5;
  });
  y += 4;

  // --- Portfolio Projects ---
  if (result.suggested_projects && result.suggested_projects.length > 0) {
    ensureSpace(30);
    setText(primaryColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("SUGGESTED PORTFOLIO PROJECTS TO BUILD", 15, y);
    doc.line(15, y + 2, 195, y + 2);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(40, 40, 40);
    result.suggested_projects.forEach((proj) => {
      const splitProj = doc.splitTextToSize(`• ${proj}`, 180);
      ensureSpace(splitProj.length * 4.5 + 1);
      splitProj.forEach((line: string) => {
        doc.text(line, 15, y);
        y += 4.5;
      });
      y += 1;
    });
    y += 4;
  }

  // --- Recommended Certifications & Career Advice ---
  if (result.recommended_certifications && result.recommended_certifications.length > 0) {
    ensureSpace(30);
    setText(primaryColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("RECOMMENDED INDUSTRY CERTIFICATIONS", 15, y);
    doc.line(15, y + 2, 195, y + 2);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    result.recommended_certifications.forEach((cert) => {
      ensureSpace(5);
      doc.text(`✔  ${cert}`, 15, y);
      y += 5;
    });
    y += 4;
  }

  // Dynamic Page Numbering & Footer stamping on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.setDrawColor(borderLine[0], borderLine[1], borderLine[2]);
    doc.line(15, 282, 195, 282); // Clean line at the bottom
    doc.text("Confidential ATS Score Report • Premium AI Resume Grader Ecosystem", 15, 287);
    doc.text(`Page ${i} of ${pageCount}`, 178, 287);
  }

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
