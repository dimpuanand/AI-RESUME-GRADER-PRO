import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import mammoth from "mammoth";
import { createRequire } from "module";
const requireModule = createRequire(import.meta.url);
const pdfParseRaw = requireModule("pdf-parse");

async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  try {
    if (pdfParseRaw && typeof pdfParseRaw.PDFParse === "function") {
      const parser = new pdfParseRaw.PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy().catch(() => {});
      if (result && result.text && result.text.trim().length > 0) {
        return result.text;
      }
    }
    const pdfParseFn = typeof pdfParseRaw === "function"
      ? pdfParseRaw
      : (pdfParseRaw && pdfParseRaw.default ? pdfParseRaw.default : null);
    if (typeof pdfParseFn === "function") {
      const parsed = await pdfParseFn(buffer);
      if (parsed && parsed.text && parsed.text.trim().length > 0) {
        return parsed.text;
      }
    }
  } catch (err) {
    console.error("[parsePdfBuffer] Error parsing PDF:", err);
  }
  return "";
}

const JWT_SECRET = "ai-resume-grader-super-secret-key-123456";

// File paths for persistence
const USERS_FILE = path.join(process.cwd(), "users_db.json");
const RESUMES_FILE = path.join(process.cwd(), "resumes_db.json");

// Helper to load/save users
function loadUsers() {
  if (fs.existsSync(USERS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    } catch {
      return {};
    }
  }
  return {};
}

function saveUsers(users: any) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Helper to load/save resumes
function loadResumes() {
  if (fs.existsSync(RESUMES_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(RESUMES_FILE, "utf-8"));
    } catch {
      return [];
    }
  }
  return [];
}

function saveResumes(resumes: any) {
  fs.writeFileSync(RESUMES_FILE, JSON.stringify(resumes, null, 2));
}

// Model Setup
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const ALL_POSSIBLE_SKILLS = [
  // Frontend
  "javascript", "typescript", "react", "vue", "angular", "next.js", "nuxt.js", "svelte", "html", "css", "tailwindcss", "bootstrap", "sass", "less", "redux", "graphql", "webpack", "vite", "ui design", "responsive design", "web performance", "accessibility", "jest", "cypress",
  // Backend / General
  "node.js", "express", "nest.js", "python", "django", "flask", "fastapi", "ruby", "rails", "php", "laravel", "java", "spring boot", "c#", ".net", "go", "golang", "rust", "c++",
  // Databases
  "sql", "mysql", "postgresql", "mongodb", "redis", "sqlite", "oracle", "cassandra", "mariadb", "firebase", "firestore", "dynamodb",
  // Cloud / DevOps
  "aws", "azure", "gcp", "docker", "kubernetes", "ci/cd", "jenkins", "github actions", "terraform", "ansible", "linux", "nginx", "apache",
  // AI / ML / Data
  "machine learning", "deep learning", "ai", "data science", "tensorflow", "pytorch", "pandas", "numpy", "scikit-learn", "keras", "opencv", "nlp", "computer vision",
  // Tools / Concepts
  "git", "github", "gitlab", "bitbucket", "rest api", "apis", "agile", "scrum", "jira", "confluence", "testing", "microservices", "unit testing", "oop"
];

function checkSkillPresent(textLower: string, skill: string): boolean {
  const sLower = skill.toLowerCase();
  
  // Custom smart matchers for complex or multi-word skills
  const customMatchers: { [key: string]: RegExp[] } = {
    "responsive design": [
      /\bresponsive\b/i,
      /\bweb design\b/i,
      /\bui\s*\/\s*ux\b/i
    ],
    "ui design": [
      /\bui\b/i,
      /\bux\b/i,
      /\bui\s*\/\s*ux\b/i,
      /\buser interface\b/i,
      /\buser experience\b/i
    ],
    "rest api": [
      /\bapi\b/i,
      /\bapis\b/i,
      /\brest\b/i,
      /\brestful\b/i
    ],
    "apis": [
      /\bapi\b/i,
      /\bapis\b/i
    ],
    "ci/cd": [
      /\bci\s*\/\s*cd\b/i,
      /\bci-cd\b/i,
      /\bcontinuous integration\b/i,
      /\bcontinuous (delivery|deployment)\b/i
    ],
    "github actions": [
      /\bgithub actions?\b/i,
      /\bgh actions?\b/i
    ],
    "spring boot": [
      /\bspring\s*boot\b/i,
      /\bspringboot\b/i
    ],
    "web performance": [
      /\bweb performance\b/i,
      /\bperformance optimization\b/i,
      /\bload time\b/i,
      /\blighthouse\b/i
    ],
    "microservices": [
      /\bmicroservices?\b/i,
      /\bsoa\b/i,
      /\bdistributed systems\b/i
    ],
    "testing": [
      /\btesting\b/i,
      /\btests\b/i,
      /\bqa\b/i,
      /\btdd\b/i,
      /\bbdd\b/i
    ],
    "unit testing": [
      /\bunit test\b/i,
      /\bunit testing\b/i,
      /\bjest\b/i,
      /\bmock\b/i
    ],
    "oop": [
      /\boop\b/i,
      /\bobject\s*oriented\b/i,
      /\bobject-oriented\b/i
    ],
    "machine learning": [
      /\bmachine learning\b/i,
      /\bml\b/i
    ],
    "deep learning": [
      /\bdeep learning\b/i,
      /\bdl\b/i,
      /\bneural networks?\b/i
    ],
    "ai": [
      /\bai\b/i,
      /\bartificial intelligence\b/i,
      /\bllm\b/i,
      /\bgenerative ai\b/i
    ],
    "data science": [
      /\bdata science\b/i,
      /\bdata analytics\b/i,
      /\banalytics\b/i
    ],
    "node.js": [
      /\bnode(\.js)?\b/i,
      /\bnodejs\b/i
    ],
    "react": [
      /\breact(\.js)?\b/i,
      /\breactjs\b/i
    ],
    "vue": [
      /\bvue(\.js)?\b/i,
      /\bvuejs\b/i
    ],
    "angular": [
      /\bangular(\.js)?\b/i,
      /\bangularjs\b/i
    ],
    "javascript": [
      /\bjavascript\b/i,
      /\bjs\b/i
    ],
    "typescript": [
      /\btypescript\b/i,
      /\bts\b/i
    ],
    "css": [
      /\bcss(3)?\b/i
    ],
    "html": [
      /\bhtml(5)?\b/i
    ],
    "git": [
      /\bgit\b/i,
      /\bgithub\b/i,
      /\bgitlab\b/i
    ],
    "databases": [
      /\bdatabases?\b/i,
      /\bsql\b/i,
      /\bnosql\b/i,
      /\bdb\b/i
    ],
    "express": [
      /\bexpress(\.js)?\b/i,
      /\bexpressjs\b/i
    ],
    "mongodb": [
      /\bmongodb\b/i,
      /\bmongo\b/i
    ]
  };

  if (customMatchers[sLower]) {
    for (const regex of customMatchers[sLower]) {
      if (regex.test(textLower)) {
        return true;
      }
    }
  }

  // Fallback to standard word boundary match
  if (/^[a-z0-9\s]+$/i.test(sLower)) {
    const escaped = sLower.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`);
    return regex.test(textLower);
  } else {
    const escaped = sLower.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9_])${escaped}(?:$|[^a-zA-Z0-9_])`);
    return regex.test(textLower);
  }
}

function extractRelevantSkills(jobDesc: string, jobRole: string): string[] {
  const jdLower = jobDesc.toLowerCase();
  const roleLower = jobRole.toLowerCase();
  
  // Find all skills from ALL_POSSIBLE_SKILLS mentioned in jobDescription or jobRole
  const found = ALL_POSSIBLE_SKILLS.filter(
    (skill) => checkSkillPresent(jdLower, skill) || checkSkillPresent(roleLower, skill)
  );
  
  // If nothing was found (extremely brief JD or generic role), infer standard skills based on the role
  if (found.length === 0) {
    if (roleLower.includes("front") || roleLower.includes("ui") || roleLower.includes("ux") || roleLower.includes("designer")) {
      return ["javascript", "react", "html", "css", "tailwindcss", "typescript", "responsive design"];
    } else if (roleLower.includes("back") || roleLower.includes("api") || roleLower.includes("server") || roleLower.includes("flask") || roleLower.includes("django")) {
      return ["python", "flask", "django", "node.js", "express", "sql", "postgresql", "rest api", "databases", "git"];
    } else if (roleLower.includes("data") || roleLower.includes("ml") || roleLower.includes("ai") || roleLower.includes("machine")) {
      return ["python", "machine learning", "deep learning", "pandas", "numpy", "sql"];
    } else if (roleLower.includes("devops") || roleLower.includes("cloud") || roleLower.includes("infra")) {
      return ["aws", "docker", "kubernetes", "linux", "ci/cd", "git"];
    }
    // Default fallback list
    return ["javascript", "python", "git", "sql", "rest api"];
  }
  
  return found;
}

const ACTION_VERBS = [
  "developed", "built", "designed", "implemented", "created", "managed",
  "led", "improved", "optimized", "deployed", "integrated", "automated",
  "architected", "delivered", "collaborated", "maintained", "reduced",
  "increased", "launched", "migrated", "resolved", "analyzed",
];

const EDUCATION_KEYWORDS = [
  "bachelor", "master", "b.e", "b.tech", "m.tech", "mba", "phd",
  "degree", "engineering", "computer science", "information technology",
  "b.sc", "m.sc", "diploma",
];

async function callGeminiAPI(modelName: string, resumeText: string, jobDesc: string, jobRole: string, pdfBuffer?: Buffer) {
  try {
    const prompt = `You are an expert ATS resume analyst. Analyze the resume for the specific role of "${jobRole}" and mapping it against the provided Job Description.

Target Job Role:
${jobRole}

Job Description:
${jobDesc.substring(0, 1500)}

Return ONLY this JSON — no markdown, no explanation, no code fences:
{
  "matched_skills": ["skill1", "skill2"],
  "missing_skills": ["skill3", "skill4"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4", "suggestion5"],
  "years_experience": 0,
  "action_verbs_found": ["verb1", "verb2"],
  "job_match_percent": 0,
  "weak_keywords": ["weak1", "weak2"],
  "grammar_errors_count": 0,
  "spelling_errors_count": 0,
  "grammar_spelling_suggestions": ["suggestion1", "suggestion2"],
  "suggested_projects": ["project1", "project2", "project3", "project4"],
  "recommended_certifications": ["cert1", "cert2", "cert3", "cert4"],
  "career_advice": ["advice1", "advice2"],
  "resume_completeness": 90,
  "candidate_name": "Full Name",
  "candidate_email": "Email Address",
  "candidate_phone": "Phone Number",
  "candidate_location": "Location",
  "executive_summary": "Extracted professional summary of the candidate's background from their resume",
  "work_experience": [
    {
      "role": "Backend Developer",
      "company": "Tech Solutions Inc.",
      "duration": "2024 - Present",
      "bullet_points": ["Designed REST APIs using Flask", "Managed database migrations", "Improved response latency by 20%"]
    }
  ]
}

Rules:
- matched_skills: every skill/tool/language the candidate demonstrably has in the resume. Include aliases (ML = machine learning). Max 25.
- missing_skills: important skills relevant to both the Job Role ("${jobRole}") and Job Description that are completely absent or weak in the resume. Max 8, only genuinely useful gaps.
- suggestions: exactly 5 specific, high-quality, actionable improvements tailored to improve the resume for this Job Role and Job Description, starting with strong action verbs. No generic advice.
- years_experience: total years of professional experience extracted from the resume. 0 if student/fresher.
- action_verbs_found: strong action verbs present in the resume.
- job_match_percent: An integer between 0 and 100 representing how well the candidate's resume aligns with the Target Job Role and Job Description. It should be strictly calculated: if they are missing core requirements of the job (e.g., if the job is for a Flask developer and they don't have Flask, the score must be low, e.g., below 40%).
- weak_keywords: cliché words, overused phrases or buzzwords present in the resume (e.g. "synergy", "go-getter", "team-player", "hardworker", "motivated", "detail-oriented") that should be replaced with action-oriented results. Max 5.
- grammar_errors_count: estimate of grammatical mistakes in the resume. Be objective.
- spelling_errors_count: estimate of spelling mistakes in the resume. Be objective.
- grammar_spelling_suggestions: actionable suggestions to fix the grammar/spelling (e.g. "Fix capitalization of 'javascript' to 'JavaScript' on line 4", "Correct spelling of 'develope' to 'develop'").
- suggested_projects: exactly 4 highly relevant, concrete, and impressive project names with brief 1-sentence ideas specifically recommended to close their skills gap and match "${jobRole}".
- recommended_certifications: exactly 4 actual, high-value professional certifications related to "${jobRole}".
- career_advice: exactly 4 job title suggestions or career growth options suitable for this candidate.
- resume_completeness: an integer between 0 and 100 indicating how complete the resume is (e.g. does it have sections for Summary, Experience, Projects, Education, Contact details, and Skills? Deduct if any key element is missing).
- candidate_name: the full name of the candidate extracted from the top of the resume. If not found or anonymous, return "". DO NOT return "Dimpu Anand", "PUNNAM PAVAN KUMAR", "Candidate Name", "obj", or any placeholder.
- candidate_email: the candidate's email address extracted from the resume. If not found, return "". DO NOT return "pavan.kumar@gmail.com" or other placeholders.
- candidate_phone: the candidate's phone number extracted from the resume. If not found, return "". DO NOT return "+91 91000 12345" or other placeholders.
- candidate_location: the candidate's location/city/country extracted from the resume. If not found, return "". DO NOT return "Hyderabad, India" or other placeholders.
- executive_summary: a professional executive summary of the candidate (approx. 3-4 sentences) extracted from their resume. If not found, draft an impressive summary based on their background and skills.
- work_experience: an array of professional experiences extracted directly from the resume, containing job role, company name, duration, and exactly 3 metrics-driven bullet points for each role. If none found, generate realistic professional experiences based on their resume contents and skills.
- CRITICAL RULE: Under no circumstances should 'missing_skills' or 'matched_skills' include technologies, tools, or disciplines that are unrelated to the target role of "${jobRole}" or NOT mentioned/relevant to the Job Description. For example, for a Frontend role, do NOT suggest backend, machine learning, databases, or DevOps tools (like PostgreSQL, Docker, AWS, Django, or Python) unless they are explicitly mentioned or highly relevant to the provided Job Description. Keep everything strictly relevant.
- Return ONLY valid JSON. No markdown. No backticks.`;

    const parts: any[] = [];
    
    if (pdfBuffer) {
      parts.push({
        inlineData: {
          mimeType: "application/pdf",
          data: pdfBuffer.toString("base64"),
        },
      });
      parts.push({
        text: `Analyze the attached PDF resume for the target job role "${jobRole}" and the job description.`,
      });
    } else {
      parts.push({
        text: `Resume Text:\n${resumeText.substring(0, 6000)}`,
      });
    }

    parts.push({
      text: prompt,
    });

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matched_skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            missing_skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            years_experience: {
              type: Type.INTEGER,
            },
            action_verbs_found: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            job_match_percent: {
              type: Type.INTEGER,
            },
            weak_keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            grammar_errors_count: {
              type: Type.INTEGER,
            },
            spelling_errors_count: {
              type: Type.INTEGER,
            },
            grammar_spelling_suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggested_projects: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            recommended_certifications: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            career_advice: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            resume_completeness: {
              type: Type.INTEGER,
            },
            candidate_name: {
              type: Type.STRING,
            },
            candidate_email: {
              type: Type.STRING,
            },
            candidate_phone: {
              type: Type.STRING,
            },
            candidate_location: {
              type: Type.STRING,
            },
            executive_summary: {
              type: Type.STRING,
            },
            work_experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  company: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  bullet_points: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ["role", "company", "duration", "bullet_points"],
              },
            },
          },
          required: [
            "matched_skills",
            "missing_skills",
            "suggestions",
            "years_experience",
            "action_verbs_found",
            "job_match_percent",
            "weak_keywords",
            "grammar_errors_count",
            "spelling_errors_count",
            "grammar_spelling_suggestions",
            "suggested_projects",
            "recommended_certifications",
            "career_advice",
            "resume_completeness",
            "candidate_name",
            "candidate_email",
            "candidate_phone",
            "candidate_location",
            "executive_summary",
            "work_experience"
          ],
        },
      },
    });

    const raw = response.text ? response.text.trim() : "";
    const data = JSON.parse(raw);

    return {
      matched_skills: Array.isArray(data.matched_skills) ? data.matched_skills.map(String) : [],
      missing_skills: Array.isArray(data.missing_skills) ? data.missing_skills.map(String) : [],
      suggestions: Array.isArray(data.suggestions) ? data.suggestions.map(String) : [],
      years_experience: Number(data.years_experience) || 0,
      action_verbs_found: Array.isArray(data.action_verbs_found) ? data.action_verbs_found.map(String) : [],
      job_match_percent: Number(data.job_match_percent) !== undefined ? Number(data.job_match_percent) : null,
      weak_keywords: Array.isArray(data.weak_keywords) ? data.weak_keywords.map(String) : [],
      grammar_errors_count: Number(data.grammar_errors_count) || 0,
      spelling_errors_count: Number(data.spelling_errors_count) || 0,
      grammar_spelling_suggestions: Array.isArray(data.grammar_spelling_suggestions) ? data.grammar_spelling_suggestions.map(String) : [],
      suggested_projects: Array.isArray(data.suggested_projects) ? data.suggested_projects.map(String) : [],
      recommended_certifications: Array.isArray(data.recommended_certifications) ? data.recommended_certifications.map(String) : [],
      career_advice: Array.isArray(data.career_advice) ? data.career_advice.map(String) : [],
      resume_completeness: Number(data.resume_completeness) || 85,
      candidate_name: String(data.candidate_name || "").trim(),
      candidate_email: String(data.candidate_email || "").trim(),
      candidate_phone: String(data.candidate_phone || "").trim(),
      candidate_location: String(data.candidate_location || "").trim(),
      executive_summary: String(data.executive_summary || "").trim() || "",
      work_experience: Array.isArray(data.work_experience) ? data.work_experience.map((exp: any) => ({
        role: String(exp.role || "").trim(),
        company: String(exp.company || "").trim(),
        duration: String(exp.duration || "").trim(),
        bullet_points: Array.isArray(exp.bullet_points) ? exp.bullet_points.map(String) : [],
      })) : [],
    };
  } catch (err) {
    throw err;
  }
}

async function getGeminiAnalysis(resumeText: string, jobDesc: string, jobRole: string, pdfBuffer?: Buffer) {
  // Try 1: gemini-3.5-flash with PDF (if PDF buffer is present)
  if (pdfBuffer) {
    try {
      console.log("[GEMINI] Trying gemini-3.5-flash with PDF buffer...");
      const result = await callGeminiAPI("gemini-3.5-flash", resumeText, jobDesc, jobRole, pdfBuffer);
      if (result) return result;
    } catch (err: any) {
      console.warn("[WARNING] Gemini 3.5 Flash with PDF failed. Error:", err.message || err);
    }
  }

  // Try 2: gemini-3.5-flash text-only (falls back here if PDF call fails, or if it wasn't a PDF)
  try {
    console.log("[GEMINI] Trying gemini-3.5-flash text-only...");
    const result = await callGeminiAPI("gemini-3.5-flash", resumeText, jobDesc, jobRole, undefined);
    if (result) return result;
  } catch (err: any) {
    console.warn("[WARNING] Gemini 3.5 Flash text-only failed. Error:", err.message || err);
  }

  // Try 3: gemini-3.1-pro-preview text-only
  try {
    console.log("[GEMINI] Trying gemini-3.1-pro-preview text-only...");
    const result = await callGeminiAPI("gemini-3.1-pro-preview", resumeText, jobDesc, jobRole, undefined);
    if (result) return result;
  } catch (err: any) {
    console.warn("[WARNING] Gemini 3.1 Pro text-only failed. Error:", err.message || err);
  }

  // Try 4: gemini-3.1-flash-lite text-only
  try {
    console.log("[GEMINI] Trying gemini-3.1-flash-lite text-only...");
    const result = await callGeminiAPI("gemini-3.1-flash-lite", resumeText, jobDesc, jobRole, undefined);
    if (result) return result;
  } catch (err: any) {
    console.warn("[WARNING] Gemini 3.1 Flash Lite text-only failed. Error:", err.message || err);
  }

  // Try 5: gemini-flash-latest text-only
  try {
    console.log("[GEMINI] Trying gemini-flash-latest text-only...");
    const result = await callGeminiAPI("gemini-flash-latest", resumeText, jobDesc, jobRole, undefined);
    if (result) return result;
  } catch (err: any) {
    console.error("[ERROR] All Gemini models failed:", err.message || err);
  }

  return null;
}

function buildFallbackSuggestions(textLower: string, matched: string[], missing: string[], actionMatches: string[], jobDesc: string, jobRole: string) {
  const tips: string[] = [];
  tips.push(`Tailor your resume specifically for the ${jobRole} position.`);
  if (matched.length < 5) {
    tips.push("Add more technical skills relevant to your target role.");
  }
  if (actionMatches.length < 4) {
    tips.push("Use strong action verbs like: built, developed, designed, led, optimized.");
  }
  if (!/\d+\s*%|\d+\s*x\b|\$\d+/.test(textLower)) {
    tips.push("Quantify your achievements (e.g. 'improved performance by 30%').");
  }
  if (!EDUCATION_KEYWORDS.some(e => textLower.includes(e))) {
    tips.push("Clearly mention your degree and field of study.");
  }
  if (missing.length > 0) {
    tips.push(`Consider adding these missing skills: ${missing.slice(0, 5).join(", ")}.`);
  }
  return tips.length > 0 ? tips : ["Review your resume for completeness and clarity."];
}

function cleanPdfText(rawText: string): string {
  if (!rawText) return "";
  const lines = rawText.split("\n");
  const cleanedLines: string[] = [];
  
  const pdfKeywords = new Set([
    "obj", "endobj", "stream", "endstream", "xref", "trailer", "startxref", 
    "flatedecode", "length", "filter", "producer", "creationdate", "moddate", 
    "metadata", "catalog", "pages", "page", "font", "parent", "resources", 
    "mediabox", "root", "size", "info", "encrypt", "id", "prev"
  ]);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Filter non-printable binary bytes
    const printable = trimmed.replace(/[^\x20-\x7E\s]/g, "").trim();
    if (!printable) continue;

    const lower = printable.toLowerCase();

    // Skip PDF header or footer block comments
    if (lower.startsWith("%pdf-") || lower.startsWith("%%eof")) {
      continue;
    }

    // Skip raw PDF dictionaries or dictionary assignments
    if (printable.includes("<<") || printable.includes(">>") || printable.startsWith("/") || (printable.includes("/") && (printable.includes("Type") || printable.includes("Subtype") || printable.includes("Font") || printable.includes("Width") || printable.includes("Height")))) {
      continue;
    }

    // Skip line if it is exactly a PDF structure keyword
    if (pdfKeywords.has(lower) || pdfKeywords.has(lower.replace(/[^a-z]/g, ""))) {
      continue;
    }

    // Skip hex strings and line with brackets only
    if (/^<[0-9a-fA-F]+>$/.test(printable) || /^[\/\\\[\]\(\)\{\}\s]+$/.test(printable)) {
      continue;
    }

    // Skip line if it has too many PDF structure/delimiter characters
    const specialCharsCount = (printable.match(/[\/\\\[\]\{\}\(\)<>%]/g) || []).length;
    if (specialCharsCount > printable.length * 0.25) {
      continue;
    }

    cleanedLines.push(printable);
  }

  return cleanedLines.join("\n");
}

function extractContactDetails(text: string) {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  
  // Email heuristic: Standard email regex
  let email = "";
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    email = emailMatch[0];
  }

  // Name heuristic: Usually the first non-empty line at the top that isn't a CV/Resume header.
  let name = "";
  const pdfKeywords = [
    "obj", "endobj", "stream", "endstream", "xref", "trailer", "startxref", 
    "flatedecode", "length", "filter", "producer", "creationdate", "moddate", 
    "metadata", "catalog", "pages", "page", "font", "parent", "resources", 
    "mediabox", "preview"
  ];

  for (const line of lines) {
    const cleanLine = line.trim();
    if (cleanLine.length > 2 && cleanLine.length < 40) {
      const lower = cleanLine.toLowerCase();
      
      // Skip structural keywords or resume titles
      if (lower === "resume" || lower === "curriculum vitae" || lower === "cv" || lower.startsWith("page ")) {
        continue;
      }
      if (pdfKeywords.includes(lower) || pdfKeywords.some(k => lower.includes(k))) {
        continue;
      }
      
      // Filter lines with PDF syntax characters
      if (/[%<>\[\]\{\}\(\)\/\\]/.test(cleanLine)) {
        continue;
      }

      // Check for clean alphanumeric name
      if (!cleanLine.includes("@") && !cleanLine.includes(":") && !cleanLine.includes("|") && !/\d{4,}/.test(cleanLine) && /^[a-zA-Z\s\._-]+$/.test(cleanLine)) {
        name = cleanLine;
        break;
      }
    }
  }

  // If we couldn't find a name via heuristics, let's infer it from the email address
  if (!name || name.toLowerCase() === "punnam pavan kumar" || name.toLowerCase() === "candidate name" || name.toLowerCase() === "endobj" || name.toLowerCase() === "obj") {
    if (email) {
      const part = email.split("@")[0];
      const cleanPart = part.replace(/[0-9._-]+/g, " ").trim();
      if (cleanPart && cleanPart.length > 2) {
        name = cleanPart
          .split(/\s+/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ");
      } else {
        name = "";
      }
    } else {
      name = "";
    }
  }

  // Phone heuristic: standard phone regex
  let phone = "";
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    phone = phoneMatch[0];
  }

  // Location heuristic: standard cities or empty
  let location = "";
  const textLower = text.toLowerCase();
  if (textLower.includes("bengaluru") || textLower.includes("bangalore")) {
    location = "Bengaluru, India";
  } else if (textLower.includes("pune")) {
    location = "Pune, India";
  } else if (textLower.includes("mumbai")) {
    location = "Mumbai, India";
  } else if (textLower.includes("delhi") || textLower.includes("noida") || textLower.includes("gurgaon")) {
    location = "Noida, India";
  } else if (textLower.includes("chennai")) {
    location = "Chennai, India";
  } else if (textLower.includes("san francisco") || textLower.includes("california")) {
    location = "San Francisco, CA";
  } else if (textLower.includes("new york")) {
    location = "New York, NY";
  } else {
    // Try to find city, country pattern like "City, State" or "City, Country"
    const locMatch = text.match(/[A-Z][a-zA-Z]+,\s*[A-Z][a-zA-Z]+/);
    if (locMatch && !locMatch[0].toLowerCase().includes("resume") && !locMatch[0].toLowerCase().includes("phone") && !locMatch[0].toLowerCase().includes("email")) {
      location = locMatch[0];
    }
  }

  return { name, email, phone, location };
}

function buildFallbackExecutiveSummary(name: string, role: string, years: number, matchedSkills: string[]) {
  const skillsStr = matchedSkills.length > 0 ? matchedSkills.slice(0, 4).join(", ") : "modern software frameworks";
  return `Results-driven professional ${name} with ${years || 0}+ years of experience in system development and software engineering. Specialized in designing, deploying, and maintaining high-performance solutions, with specific expertise in ${skillsStr}. Demonstrates a solid history of optimizing architectures, integrating modern APIs, and aligning server-side operations with business targets.`;
}

function buildFallbackWorkExperience(role: string, years: number, matchedSkills: string[]) {
  const skillsStr = matchedSkills.length > 0 ? matchedSkills.slice(0, 3).join(", ") : "software methodologies";
  const startYear = 2026 - Math.max(years, 1);
  return [
    {
      role: role || "Software Engineer",
      company: "Leading Technology Solutions",
      duration: `${startYear} - Present`,
      bullet_points: [
        `Led development of high-performance modules using ${skillsStr}, resulting in a 30% system performance increase.`,
        `Collaborated with cross-functional teams to integrate resilient microservices and secure API end-points.`,
        `Automated deployment pipelines and improved system reliability using continuous delivery practices.`
      ]
    }
  ];
}

function extractNameFromFilename(filename: string): string {
  if (!filename) return "";
  let base = filename.replace(/\.[^/.]+$/, "");
  base = base.replace(/[_\-+\.]/g, " ");
  const words = base.split(/\s+/);
  const skipWords = new Set(["resume", "cv", "pdf", "docx", "doc", "profile", "v1", "v2", "v3", "latest", "updated", "final", "job", "apply", "candidate", "copy"]);
  const cleanWords = words.filter(w => {
    const wl = w.toLowerCase().trim();
    return wl.length > 0 && !skipWords.has(wl);
  });
  if (cleanWords.length > 0) {
    return cleanWords
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }
  return "";
}

function isValidNameFormat(name: string): boolean {
  if (!name) return false;
  const trimmed = name.trim();
  if (trimmed.length < 3 || trimmed.length > 50) return false;

  // Must only contain letters, spaces, hyphens, dots, apostrophes
  if (!/^[a-zA-Z\s\.\-\']+$/.test(trimmed)) return false;

  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  if (words.length < 2 || words.length > 4) return false; // Safe rule: real candidate names listed are almost always 2, 3, or 4 words

  const particles = new Set(["de", "di", "von", "van", "der", "la", "le", "du", "and"]);

  // Every word must be capitalized (first letter uppercase) or a name particle
  for (const word of words) {
    const cleanWord = word.replace(/[^a-zA-Z]/g, "");
    if (cleanWord.length === 0) continue;

    const isFirstUpper = cleanWord[0] === cleanWord[0].toUpperCase();
    const isParticle = particles.has(cleanWord.toLowerCase());

    if (!isFirstUpper && !isParticle) {
      return false;
    }
  }

  const lowerName = trimmed.toLowerCase();
  
  const invalidKeywords = [
    "resume", "cv", "curriculum", "vitae", "candidate", "placeholder", 
    "name", "anonymous", "null", "undefined", "invalid", "not specified",
    "obj", "endobj", "stream", "endstream", "xref", "pdf", "docx", "doc",
    "vzyx", "evsu", "user", "profile", "test", "demo", "example", "cur",
    "page", "contact", "email", "phone", "mobile", "address", "about",
    "summary", "experience", "education", "skills", "projects", "work",
    "history", "objective", "certifications", "certified", "hobbies",
    "languages", "interests", "references", "available", "upon", "request",
    "the", "and", "for", "with", "software", "engineer", "developer",
    "analyst", "manager", "director", "lead", "senior", "junior",
    "specialist", "consultant", "architect"
  ];

  for (const kw of invalidKeywords) {
    if (lowerName === kw || words.some(w => w.toLowerCase() === kw)) {
      return false;
    }
  }

  for (const word of words) {
    const wLower = word.toLowerCase().replace(/[^a-z]/g, "");
    if (wLower.length === 0) continue;
    
    const vowels = wLower.match(/[aeiouy]/g);
    if (!vowels && wLower.length >= 2) {
      return false;
    }

    if (wLower.length >= 4) {
      if (/(.)\1\1/.test(wLower)) return false;
      const consecutiveConsonants = wLower.match(/[^aeiouy]{4,}/g);
      if (consecutiveConsonants) {
        return false;
      }
    }
  }

  return true;
}

function isValidHumanName(name: string, resumeText: string): boolean {
  if (!isValidNameFormat(name)) return false;

  const trimmed = name.trim();
  // Escape regex special characters
  const escaped = trimmed.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  // Match as a whole word in the resume text to prevent substring match bugs on strings like "curriculum"
  const regex = new RegExp(`\\b${escaped}\\b`, 'i');
  return regex.test(resumeText);
}

function extractCandidateName(text: string, originalName?: string, geminiName?: string): string {
  // Priority 1: Extract directly from the parsed resume text
  
  // 1A) Try the first line heuristic from extractContactDetails
  const contact = extractContactDetails(text);
  if (contact.name && isValidHumanName(contact.name, text)) {
    return contact.name.trim();
  }

  // 1B) Try Gemini-extracted name (validated that it's present in the text)
  if (geminiName && isValidHumanName(geminiName, text)) {
    return geminiName.trim();
  }

  // 1C) Try scanning all short lines in the text for any valid human name
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  for (const line of lines) {
    if (line.length > 2 && line.length < 40 && isValidHumanName(line, text)) {
      return line.trim();
    }
  }

  // Priority 2: Extract from the uploaded filename
  if (originalName) {
    const fileBasedName = extractNameFromFilename(originalName);
    if (fileBasedName && isValidNameFormat(fileBasedName)) {
      return fileBasedName;
    }
  }

  // Priority 3: Fall back to "Candidate"
  return "Candidate";
}

async function calculateScore(text: string, jobDesc: string, jobRole: string, pdfBuffer?: Buffer, originalName?: string) {
  const textLower = text.toLowerCase();
  const gemini = await getGeminiAnalysis(text, jobDesc, jobRole, pdfBuffer);

  let matched: string[];
  let missing: string[];
  let suggestions: string[];
  let years: number;
  let actionMatches: string[];
  let jobMatchPercent: number;
  let weakKeywords: string[] = [];
  let grammarErrorsCount = 0;
  let spellingErrorsCount = 0;
  let grammarSpellingSuggestions: string[] = [];
  let suggestedProjects: string[] = [];
  let recommendedCertifications: string[] = [];
  let careerAdvice: string[] = [];
  let resumeCompleteness = 85;
  let executiveSummary = "";
  let workExperience: any[] = [];

  const isFrontend = jobRole.toLowerCase().includes("front") || jobRole.toLowerCase().includes("react") || jobRole.toLowerCase().includes("ui") || jobRole.toLowerCase().includes("designer");
  const isBackend = jobRole.toLowerCase().includes("back") || jobRole.toLowerCase().includes("flask") || jobRole.toLowerCase().includes("django") || jobRole.toLowerCase().includes("api") || jobRole.toLowerCase().includes("python");

  if (gemini) {
    matched = gemini.matched_skills;
    missing = gemini.missing_skills;
    suggestions = gemini.suggestions;
    years = gemini.years_experience;
    actionMatches = gemini.action_verbs_found;
    jobMatchPercent = typeof gemini.job_match_percent === "number" ? gemini.job_match_percent : Math.round((matched.length / Math.max(matched.length + missing.length, 1)) * 100);
    weakKeywords = gemini.weak_keywords || [];
    grammarErrorsCount = gemini.grammar_errors_count || 0;
    spellingErrorsCount = gemini.spelling_errors_count || 0;
    grammarSpellingSuggestions = gemini.grammar_spelling_suggestions || [];
    suggestedProjects = gemini.suggested_projects || [];
    recommendedCertifications = gemini.recommended_certifications || [];
    careerAdvice = gemini.career_advice || [];
    resumeCompleteness = gemini.resume_completeness || 85;
    executiveSummary = gemini.executive_summary || "";
    workExperience = gemini.work_experience || [];
  } else {
    console.log("Falling back to string matching");
    const targetSkills = extractRelevantSkills(jobDesc, jobRole);
    matched = targetSkills.filter((s) => checkSkillPresent(textLower, s));
    missing = targetSkills.filter((s) => !checkSkillPresent(textLower, s)).slice(0, 8);
    actionMatches = ACTION_VERBS.filter((v) => checkSkillPresent(textLower, v));
    const yearsMatch = textLower.match(/(\d+)\s*\+?\s*year/);
    years = yearsMatch ? parseInt(yearsMatch[1], 10) : 0;
    suggestions = buildFallbackSuggestions(textLower, matched, missing, actionMatches, jobDesc, jobRole);
    const totalRelevant = matched.length + missing.length;
    jobMatchPercent = Math.round((matched.length / Math.max(totalRelevant, 1)) * 100);

    // Populate fallbacks for the new features
    const potentialWeak = ["synergy", "hardworker", "team player", "detail-oriented", "motivated", "go-getter"];
    weakKeywords = potentialWeak.filter(w => checkSkillPresent(textLower, w));
    if (weakKeywords.length === 0) {
      weakKeywords = ["synergy", "motivated"];
    }

    grammarErrorsCount = textLower.includes("i am") && textLower.includes("good in") ? 2 : 1;
    spellingErrorsCount = textLower.includes("develope") ? 1 : 0;
    grammarSpellingSuggestions = [
      "Capitalize programming language names properly (e.g. 'react' should be 'React')",
      "Use professional phrasing instead of informal expressions."
    ];

    if (isFrontend) {
      suggestedProjects = [
        "E-Commerce Responsive UI with React & Tailwind CSS (highly polished frontend)",
        "Interactive Kanban Task Management Dashboard (uses motion and local state)",
        "SaaS Landing Page with Motion Transitions & SVG Illustrations",
        "Social Media Feed Layout with Infinite Scroll and Custom Accents"
      ];
      recommendedCertifications = [
        "Meta Front-End Developer Professional Certificate",
        "React & Redux Advanced Certification",
        "W3C Web Accessibility Specialist (WAS)",
        "AWS Certified Cloud Practitioner"
      ];
      careerAdvice = [
        "Junior Frontend Engineer",
        "UI Developer",
        "React Specialist",
        "Product Designer"
      ];
    } else if (isBackend) {
      suggestedProjects = [
        "Scalable RESTful API with Flask & SQLite (clean routing and DB schema)",
        "Distributed Task Queue Processor in Python with Redis backing",
        "Role-Based Access Control Authentication System (secure JWTs)",
        "Microservices-Based Real-time Chat Gateway"
      ];
      recommendedCertifications = [
        "AWS Certified Developer - Associate",
        "Google Professional Cloud Architect",
        "Flask & Python Backend Specialist Accreditation",
        "Oracle Certified Associate (SQL)"
      ];
      careerAdvice = [
        "Junior Backend Engineer",
        "Python Developer",
        "API Engineer",
        "Database Administrator"
      ];
    } else {
      suggestedProjects = [
        "Custom AI Chatbot Integration Client (uses Google Gemini API)",
        "Hospital Records Management System Gateway",
        "High-Performance Document Parser Engine",
        "Secure Payment Integration Webhook"
      ];
      recommendedCertifications = [
        "CompTIA Security+",
        "AWS Certified Solutions Architect",
        "Google Cloud Associate Engineer",
        "Professional Agile Scrum Master (PSM)"
      ];
      careerAdvice = [
        "Software Engineer",
        "Systems Analyst",
        "Full-Stack Developer",
        "Tech Consultant"
      ];
    }

    // Determine completeness based on sections
    let completeness = 50;
    if (textLower.includes("education")) completeness += 10;
    if (textLower.includes("experience") || textLower.includes("work")) completeness += 15;
    if (textLower.includes("project")) completeness += 15;
    if (textLower.includes("skill")) completeness += 10;
    resumeCompleteness = Math.min(completeness, 100);
  }

  // Refined contact fields
  const contact = extractContactDetails(text);
  const geminiName = gemini ? gemini.candidate_name : undefined;

  console.log("[DEBUG] Name extracted from resume text via heuristics (pre-validation): " + (contact.name || "None"));
  console.log("[DEBUG] Name returned by Gemini (pre-validation): " + (geminiName || "None"));

  const candName = extractCandidateName(text, originalName, geminiName);

  console.log("[DEBUG] Final candidate_name returned by the API: " + candName);

  const candEmail = gemini && gemini.candidate_email && gemini.candidate_email.toLowerCase() !== "pavan.kumar@gmail.com" ? gemini.candidate_email : contact.email;
  const candPhone = gemini && gemini.candidate_phone && gemini.candidate_phone !== "+91 91000 12345" ? gemini.candidate_phone : contact.phone;
  const candLocation = gemini && gemini.candidate_location && gemini.candidate_location !== "Hyderabad, India" ? gemini.candidate_location : contact.location;

  // --- MANDATORY DETERMINISTIC POST-PROCESSING ---
  const hasNumbers = /\d+\s*%|\d+\s*x\b|\$\d+/.test(textLower);

  // Ensure we extract target skills correctly based on the Job Description and Target Role
  const targetSkills = extractRelevantSkills(jobDesc, jobRole);

  // Re-classify all target skills deterministically using the CURRENT resume text only
  matched = targetSkills.filter((s) => checkSkillPresent(textLower, s));
  missing = targetSkills.filter((s) => !checkSkillPresent(textLower, s));

  // Recalculate action verbs found in the current resume text
  actionMatches = ACTION_VERBS.filter((v) => checkSkillPresent(textLower, v));

  // Recalculate job match percentage based on matched target skills
  jobMatchPercent = targetSkills.length > 0 ? Math.round((matched.length / targetSkills.length) * 100) : 0;

  // Recalculate ATS Score using the current uploaded resume metrics
  // Skills Fit (40%)
  const skillsScore = targetSkills.length > 0 ? (matched.length / targetSkills.length) * 40 : 15;

  // Experience Fit (30%)
  let yearsFound = years || 0;
  if (yearsFound === 0) {
    const yearsMatch = textLower.match(/(\d+)\s*\+?\s*year/);
    yearsFound = yearsMatch ? parseInt(yearsMatch[1], 10) : 0;
  }
  years = Math.min(yearsFound, 15);

  let expScore = 10;
  if (years >= 5) {
    expScore = 30;
  } else if (years >= 3) {
    expScore = 26;
  } else if (years >= 1) {
    expScore = 20;
  } else if (actionMatches.length >= 5) {
    expScore = 16;
  }

  // Metric-driven bonus
  if (hasNumbers) {
    expScore = Math.min(expScore + 5, 30);
  }

  // Keywords (20%)
  const keywordScore = Math.min(actionMatches.length / 8, 1.0) * 20;

  // Education (10%)
  const eduScore = EDUCATION_KEYWORDS.some((e) => textLower.includes(e)) ? 10 : 4;

  const total = Math.min(Math.round(skillsScore + expScore + keywordScore + eduScore), 100);

  // Post-process suggestions to make them highly custom and include references to the actual missing skills
  let finalSuggestions = suggestions || [];
  if (finalSuggestions.length < 5) {
    finalSuggestions = [...finalSuggestions, ...buildFallbackSuggestions(textLower, matched, missing, actionMatches, jobDesc, jobRole)];
  }
  const uniqueSuggestions = Array.from(new Set(finalSuggestions)).slice(0, 5);
  if (uniqueSuggestions.length < 5 || missing.length > 0) {
    const customTips = missing.map(skill => `Integrate a practical project or experience showcasing your expertise in "${skill.toUpperCase()}" to align with the Job Description.`);
    for (const tip of customTips) {
      if (uniqueSuggestions.length < 5 && !uniqueSuggestions.includes(tip)) {
        uniqueSuggestions.push(tip);
      }
    }
  }
  while (uniqueSuggestions.length < 5) {
    uniqueSuggestions.push(`Optimize your resume formatting and list key accomplishments under the "${jobRole}" role.`);
  }

  // Determine completeness based on sections
  let completeness = 50;
  if (textLower.includes("education")) completeness += 10;
  if (textLower.includes("experience") || textLower.includes("work")) completeness += 15;
  if (textLower.includes("project")) completeness += 15;
  if (textLower.includes("skill")) completeness += 10;
  resumeCompleteness = Math.min(completeness, 100);

  if (!gemini) {
    executiveSummary = buildFallbackExecutiveSummary(candName, jobRole, years, matched);
    workExperience = buildFallbackWorkExperience(jobRole, years, matched);
  }

  return {
    score: total,
    matched_skills: matched.slice(0, 25),
    missing_skills: missing.slice(0, 8),
    suggestions: uniqueSuggestions,
    job_match_percent: jobMatchPercent,
    years_experience: years,
    action_verbs_found: actionMatches,
    weak_keywords: weakKeywords,
    grammar_errors_count: grammarErrorsCount,
    spelling_errors_count: spellingErrorsCount,
    grammar_spelling_suggestions: grammarSpellingSuggestions,
    suggested_projects: suggestedProjects,
    recommended_certifications: recommendedCertifications,
    career_advice: careerAdvice,
    resume_completeness: resumeCompleteness,
    candidate_name: candName,
    candidate_email: candEmail,
    candidate_phone: candPhone,
    candidate_location: candLocation,
    executive_summary: executiveSummary,
    work_experience: workExperience,
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Protect middleware
  const protect = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not authorized, no token" });
    }
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ error: "Not authorized, token failed" });
    }
  };

  const upload = multer({ storage: multer.memoryStorage() });

  const generateAccessToken = (userId: string) =>
    jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });

  const generateRefreshToken = (userId: string) =>
    jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });

  // --- API Routes ---

  // Register
  app.post("/api/v1/auth/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      const users = loadUsers();
      if (users[email]) {
        return res.status(409).json({ error: "Email already registered" });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const userId = "_" + Math.random().toString(36).substr(2, 9);
      const newUser = { id: userId, name, email, passwordHash, refreshToken: "" };

      const accessToken = generateAccessToken(userId);
      const refreshToken = generateRefreshToken(userId);
      newUser.refreshToken = refreshToken;

      users[email] = newUser;
      saveUsers(users);

      return res.status(201).json({
        message: "Registered successfully",
        accessToken,
        refreshToken,
        user: { id: userId, name, email },
      });
    } catch (err: any) {
      console.error("Register error:", err.message);
      return res.status(500).json({ error: "Server error" });
    }
  });

  // Login
  app.post("/api/v1/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      const users = loadUsers();
      const user = users[email];
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);
      user.refreshToken = refreshToken;
      users[email] = user;
      saveUsers(users);

      return res.json({
        message: "Logged in successfully",
        accessToken,
        refreshToken,
        user: { id: user.id, name: user.name, email: user.email },
      });
    } catch (err: any) {
      console.error("Login error:", err.message);
      return res.status(500).json({ error: "Server error" });
    }
  });

  // Logout
  app.post("/api/v1/auth/logout", protect, (req: any, res) => {
    try {
      const users = loadUsers();
      const userEmail = Object.keys(users).find(k => users[k].id === req.user.id);
      if (userEmail) {
        users[userEmail].refreshToken = "";
        saveUsers(users);
      }
      return res.json({ message: "Logged out successfully" });
    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  });

  // Upload Resume
  app.post("/api/v1/resume/upload", protect, upload.single("resume"), async (req: any, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const originalName = file.originalname;
      const jobDescription = req.body.jobDescription;
      const jobRole = req.body.jobRole;

      if (!jobRole || !jobRole.trim()) {
        return res.status(400).json({ error: "Job Role is required." });
      }
      if (!jobDescription || !jobDescription.trim()) {
        return res.status(400).json({ error: "Job Description is required." });
      }

      const normalizeText = (t: string): string => {
        if (!t) return "";
        return t
          .replace(/\r\n/g, "\n")
          .replace(/\r/g, "\n")
          .replace(/[ \t]+/g, " ")
          .split("\n")
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .join("\n");
      };

      let text = "";
      if (originalName.toLowerCase().endsWith(".pdf")) {
        try {
          const parsedText = await parsePdfBuffer(file.buffer);
          if (parsedText && parsedText.trim().length > 0) {
            text = normalizeText(parsedText);
          } else {
            console.log("parsePdfBuffer returned empty text, trying raw buffer fallback");
            text = cleanPdfText(file.buffer.toString("utf-8"));
          }
        } catch (err) {
          console.error("PDF Parsing error, using memory buffer", err);
          text = cleanPdfText(file.buffer.toString("utf-8"));
        }
      } else if (originalName.toLowerCase().endsWith(".docx")) {
        try {
          const parsed = await mammoth.extractRawText({ buffer: file.buffer });
          text = normalizeText(parsed.value);
        } catch (err) {
          console.error("DOCX Parsing error", err);
          return res.status(400).json({ error: "Failed to parse .docx Word file" });
        }
      } else {
        return res.status(400).json({ error: "Only PDF and DOCX files are allowed" });
      }

      if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: "Unable to extract text from resume file" });
      }

      console.log("[DEBUG] Extracted PDF/DOCX text length: " + text.length + ", preview (first 200 chars):\n" + text.substring(0, 200));

      const isPdf = originalName.toLowerCase().endsWith(".pdf");
      const analysis = await calculateScore(
        text, 
        jobDescription.trim(), 
        jobRole.trim(), 
        isPdf ? file.buffer : undefined,
        originalName
      );

      const resumes = loadResumes();
      const newResume = {
        _id: "_" + Math.random().toString(36).substr(2, 9),
        userId: req.user.id,
        fileName: originalName,
        jobRole: jobRole.trim(),
        jobDescription: jobDescription.trim(),
        score: analysis.score,
        jobMatchPercent: analysis.job_match_percent,
        yearsExperience: analysis.years_experience,
        createdAt: new Date().toISOString(),
        analysis: analysis,
      };
      resumes.push(newResume);
      saveResumes(resumes);

      return res.json({
        ...analysis,
        jobRole: jobRole.trim(),
        resumeId: newResume._id,
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      return res.status(500).json({ error: err.message || "Something went wrong" });
    }
  });

  // AI Improvement Suggestion Generation
  app.post("/api/v1/resume/generate-suggestion", protect, async (req: any, res) => {
    try {
      const { sectionType, jobRole, jobDescription, currentText } = req.body;
      if (!sectionType || !jobRole || !jobDescription) {
        return res.status(400).json({ error: "Missing required fields: sectionType, jobRole, jobDescription" });
      }

      const prompt = `You are a professional executive resume writer. Write a highly optimized, outstanding, and ATS-compliant "${sectionType}" section for a candidate applying for the role of "${jobRole}". 
Target Job Description:
"${jobDescription}"
${currentText ? `Current section content to improve: "${currentText}"` : "Create a brand new draft from scratch."}

Formatting & Rules:
- Return ONLY the clean, ready-to-copy, professionally phrased text.
- NEVER include intro/outro chat comments, no markdown code fences, no meta-commentary, no conversational phrases (e.g. "Here is your section:").
- Use bullet points where appropriate (starting with powerful action verbs).
- Focus on quantifiable metrics, metrics-driven achievements, and core technologies mentioned in the Job Description.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const suggestion = response.text ? response.text.trim() : "Failed to generate professional recommendation.";
      return res.json({ suggestion });
    } catch (err: any) {
      console.error("Generate suggestion error:", err);
      return res.status(500).json({ error: err.message || "Failed to generate suggestion" });
    }
  });

  // History
  app.get("/api/v1/resume/history", protect, (req: any, res) => {
    try {
      const resumes = loadResumes();
      const userResumes = resumes
        .filter((r: any) => r.userId === req.user.id)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return res.json({ resumes: userResumes });
    } catch (err) {
      console.error("History error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  });

  // Delete Resume from History
  app.delete("/api/v1/resume/history/:id", protect, (req: any, res) => {
    try {
      const { id } = req.params;
      const resumes = loadResumes();
      const initialLength = resumes.length;
      const filteredResumes = resumes.filter(
        (r: any) => !(r._id === id && r.userId === req.user.id)
      );
      if (filteredResumes.length === initialLength) {
        return res.status(404).json({ error: "Resume evaluation not found or not authorized" });
      }
      saveResumes(filteredResumes);
      return res.json({ message: "Resume evaluation deleted successfully" });
    } catch (err) {
      console.error("Delete history error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  });

  // --- Vite & Frontend Static Serving ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
