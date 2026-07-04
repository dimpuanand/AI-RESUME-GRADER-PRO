# AI Resume Grader

AI Resume Grader is a highly optimized, full-stack web application that parses and analyzes resumes against target job descriptions using Google Gemini AI.

## 🚀 Key Improvements & Updates

We have upgraded the old, complex three-server setup (`client`, `server`, and `ai`) into a **modern, unified full-stack architecture**. 
- **Unified Server**: The entire application now runs under a single Node.js environment. No more running separate client, server, and Flask servers simultaneously!
- **Accurate Resume Parsing**: Fixed contact details and parsing heuristics. The application now extracts the **actual candidate name**, email, phone, and location directly from the parsed resume (e.g., *Dimpu Anand*), instead of displaying a hardcoded profile placeholder.
- **Dynamic Work Experience & Summary**: The resume preview panel now dynamically displays the candidate's real executive summary and work experience bullet points parsed from the document using Gemini.
- **Improved Skill Match Scoring**: Upgraded the matching engine using robust token boundaries and regex to avoid false positives and calculate exact ATS compatibility percentages.

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + Lucide Icons + Framer Motion (for smooth micro-animations)
- **Backend**: Node.js + Express (TypeScript)
- **AI Integration**: Official `@google/genai` TypeScript SDK (server-side, keeping your API key 100% secure from the browser)
- **AI Model**: Google Gemini 2.5/1.5 Flash

---

## 💻 Local Development

Running the unified app locally is incredibly straightforward.

### 1. Configure Environment Variables
Create a `.env` file in the root directory and add your Google Gemini API Key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
The server will start on [http://localhost:3000](http://localhost:3000), serving both the Express backend API routes and the hot-reloaded React frontend automatically.

### 4. Build for Production
```bash
npm run build
npm start
```
This compiles the backend TypeScript server into a unified production CJS bundle (`dist/server.cjs`) and static client assets in `dist/`, optimized for immediate server deployment.

