"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAiCareerPrediction = void 0;
const axios_1 = __importDefault(require("axios"));
const kuccps_1 = require("./kuccps");
function safeJsonParse(text) {
    try {
        return JSON.parse(text);
    }
    catch {
        return null;
    }
}
async function runAiCareerPrediction(studentProfile) {
    const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();
    const system = `
You are CareerSasa, a career guidance engine for Kenyan high school graduates.
Use the student's KCSE results, interests/hobbies, social media usage, birth order, family background notes, and Briggs-style personality snapshot.
Return exactly 3 career pathways. Output MUST be valid JSON only (no markdown).
Each pathway must include: pathway_name, why_fit, suggested_programmes, next_steps.
  `.trim();
    const user = `
STUDENT_PROFILE_JSON:
${JSON.stringify(studentProfile)}

Rules:
- Tailor to Kenya context and KUCCPS-style programmes
- Use internal/external factors: abilities (KCSE), interests, personality, family/socioeconomic context
- Avoid making up exact KUCCPS cutoffs; use "Confirm on KUCCPS" unless provided

Output schema:
{
  "student_summary": { "strengths": ["..."], "growth_areas": ["..."] },
  "top_3_career_pathways": [
    {
      "rank": 1,
      "pathway_name": "...",
      "why_fit": ["..."],
      "suggested_programmes": [
        { "programme": "...", "kuccps_notes": "..." }
      ],
      "next_steps": ["..."]
    }
  ]
}
  `.trim();
    if (provider === "openai") {
        const key = process.env.OPENAI_API_KEY;
        const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
        if (!key)
            throw new Error("OPENAI_API_KEY missing");
        const resp = await axios_1.default.post("https://api.openai.com/v1/chat/completions", {
            model,
            messages: [
                { role: "system", content: system },
                { role: "user", content: user }
            ],
            temperature: 0.4
        }, { headers: { Authorization: `Bearer ${key}` } });
        const text = resp.data?.choices?.[0]?.message?.content || "";
        const parsed = safeJsonParse(text);
        if (!parsed)
            throw new Error("AI returned non-JSON output");
        for (const p of parsed.top_3_career_pathways || []) {
            for (const s of p.suggested_programmes || []) {
                if (!s.kuccps_notes || s.kuccps_notes.trim().length < 5) {
                    s.kuccps_notes = (0, kuccps_1.findProgrammeNotes)(s.programme);
                }
            }
        }
        return parsed;
    }
    throw new Error("Unsupported AI_PROVIDER");
}
exports.runAiCareerPrediction = runAiCareerPrediction;
