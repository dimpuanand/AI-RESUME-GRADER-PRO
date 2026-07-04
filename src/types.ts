export interface ResumeAnalysis {
  score: number;
  matched_skills: string[];
  missing_skills: string[];
  suggestions: string[];
  years_experience: number;
  action_verbs_found: string[];
  job_match_percent?: number | null;
  weak_keywords: string[];
  grammar_errors_count: number;
  spelling_errors_count: number;
  grammar_spelling_suggestions: string[];
  suggested_projects: string[];
  recommended_certifications: string[];
  career_advice: string[];
  resume_completeness: number;
  candidate_name?: string;
  candidate_email?: string;
  candidate_phone?: string;
  candidate_location?: string;
  executive_summary?: string;
  work_experience?: Array<{
    role: string;
    company: string;
    duration: string;
    bullet_points: string[];
  }>;
}

export interface JobMatchResult {
  percent: number;
  matchedKeywords: string[];
}

export interface SavedResume {
  _id: string;
  fileName: string;
  jobRole?: string;
  jobDescription?: string;
  score: number;
  jobMatchPercent: number | null;
  yearsExperience: number | null;
  createdAt: string;
  analysis?: ResumeAnalysis; // nested for viewing previous versions
}

export interface CompanyMatch {
  name: string;
  percent: number;
  tips: string[];
}
