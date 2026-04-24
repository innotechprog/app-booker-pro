import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Mic,
  MicOff,
  Sparkles,
  ArrowRight,
  RefreshCcw,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Camera,
  Square,
  StopCircle,
  Download,
  ListOrdered,
  Target,
} from "lucide-react";
import { smartApplyAPI } from "@/services/api";

type QuestionCategory = "general" | "behavioral" | "technical";

type InterviewQuestion = {
  id: string;
  category: QuestionCategory;
  question: string;
  tags: string[];
};

type InterviewFeedback = {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  improvements: string[];
  suggestedAnswer: string;
};

const DEEP_BLUE = "#1e3a5f";

const QUESTIONS: InterviewQuestion[] = [
  {
    id: "q-tell-me",
    category: "general",
    question: "Tell me about yourself.",
    tags: ["overview", "jobTitle", "communication"],
  },
  {
    id: "q-why-role",
    category: "general",
    question: "Why do you want this role?",
    tags: ["motivation", "role"],
  },
  {
    id: "q-strength",
    category: "general",
    question: "What are your strengths?",
    tags: ["skills", "evidence"],
  },
  {
    id: "q-weakness",
    category: "general",
    question: "What is a weakness you’re working on?",
    tags: ["growth", "honesty"],
  },
  {
    id: "q-5-years",
    category: "general",
    question: "Where do you see yourself in five years?",
    tags: ["goals", "growth"],
  },
  {
    id: "q-challenge",
    category: "behavioral",
    question: "Tell me about a challenge you faced at work and how you handled it.",
    tags: ["STAR", "problem-solving"],
  },
  {
    id: "q-failure",
    category: "behavioral",
    question: "Tell me about a time you made a mistake. What did you learn?",
    tags: ["accountability", "learning"],
  },
  {
    id: "q-team",
    category: "behavioral",
    question: "Describe a time you worked with a difficult stakeholder or teammate.",
    tags: ["collaboration", "communication"],
  },
  {
    id: "q-led",
    category: "behavioral",
    question: "Tell me about a time you led a project or initiative.",
    tags: ["leadership", "ownership"],
  },
  {
    id: "q-conflict",
    category: "behavioral",
    question: "How do you handle conflict or disagreement on a team?",
    tags: ["conflict", "process"],
  },
  {
    id: "q-technical-1",
    category: "technical",
    question: "Explain a complex concept from your field in simple terms.",
    tags: ["clarity", "explain"],
  },
  {
    id: "q-technical-2",
    category: "technical",
    question: "Walk me through a technical project you’re proud of. What was your approach?",
    tags: ["project", "approach"],
  },
  {
    id: "q-technical-3",
    category: "technical",
    question: "How do you keep your skills up to date in this area?",
    tags: ["learning", "maintenance"],
  },
];

const STOPWORDS = new Set([
  "the",
  "and",
  "or",
  "a",
  "an",
  "to",
  "of",
  "in",
  "on",
  "for",
  "with",
  "without",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "as",
  "at",
  "by",
  "from",
  "that",
  "this",
  "it",
  "you",
  "your",
  "we",
  "our",
  "they",
  "their",
  "i",
  "me",
  "my",
  "will",
  "can",
  "could",
  "should",
  "would",
  "may",
  "might",
  "must",
  "not",
  "but",
  "if",
  "then",
  "than",
  "so",
  "about",
  "into",
  "over",
  "under",
  "also",
  "such",
  "more",
  "most",
  "less",
  "very",
  "etc",
]);

function extractJobTitle(jobText: string, fallback: string | null | undefined): string | null {
  const trimmed = (jobText || "").trim();
  if (!trimmed) return fallback ?? null;

  const labeled = trimmed.match(
    /(?:^|\n)\s*(?:job\s*title|position|role|opening)\s*[:\-]\s*([^\n]+)/i,
  );
  if (labeled?.[1]) {
    const line = labeled[1].trim();
    if (line.length >= 2 && line.length <= 120) return line;
  }

  const firstLine = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find(Boolean) ?? "";
  if (!firstLine) return fallback ?? null;
  const candidate = firstLine.length > 80 ? firstLine.slice(0, 80) : firstLine;
  return candidate || (fallback ?? null);
}

/** Frequent meaningful tokens from the JD (when profile overlap is thin). */
function extractFreqKeywordsFromJob(jobText: string, max: number): string[] {
  const jobLower = (jobText || "").toLowerCase();
  const tokens = jobLower
    .replace(/[^a-z0-9+.\s-]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3)
    .filter((t) => !STOPWORDS.has(t))
    .filter((t) => /[a-z]/.test(t))
    .filter((t) => !/^\d+$/.test(t));

  const freq = new Map<string, number>();
  for (const t of tokens) freq.set(t, (freq.get(t) || 0) + 1);

  const ranked = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k);

  return ranked.filter((t) => !STOPWORDS.has(t)).slice(0, max);
}

/** Short phrases often used in postings (experience with X, proficient in Y, …). */
function extractJdRequirementPhrases(jobText: string): string[] {
  const out: string[] = [];
  const text = jobText.slice(0, 16000);
  const patterns = [
    /(?:experience|experienced)\s+(?:with|in)\s+([^.;\n]{3,120})/gi,
    /(?:proficient|skilled|fluent)\s+(?:in|with)\s+([^.;\n]{3,120})/gi,
    /(?:knowledge|familiarity)\s+of\s+([^.;\n]{3,120})/gi,
    /(?:must\s+have|nice\s+to\s+have|strong)\s*[:\s]+([^.;\n]{3,120})/gi,
  ];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const p = m[1]?.replace(/\s+/g, " ").trim();
      if (p && p.length >= 3) out.push(p);
    }
  }
  return Array.from(new Set(out)).slice(0, 10);
}

function mergeDedupeSkillStrings(primary: string[], secondary: string[], tertiary: string[], limit: number): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  const add = (raw: string) => {
    const s = raw.trim();
    if (!s) return;
    const k = s.toLowerCase();
    if (seen.has(k)) return;
    seen.add(k);
    result.push(s);
  };
  for (const x of primary) add(x);
  for (const x of secondary) add(x);
  for (const x of tertiary) add(x);
  return result.slice(0, limit);
}

function extractTargetSkillsFromJob(
  jobText: string,
  candidateKeySkills: string[],
): {
  targetSkills: string[];
  profileSkillsInJd: string[];
  jdPhrases: string[];
} {
  const jobLower = (jobText || "").toLowerCase();
  const candidateSkillsLower = (candidateKeySkills || []).map((s) => s.trim()).filter(Boolean);

  const profileSkillsInJd = Array.from(
    new Set(
      candidateSkillsLower.filter((s) => {
        const sl = s.toLowerCase();
        if (sl.length < 2) return false;
        return jobLower.includes(sl);
      }),
    ),
  );

  const jdPhrases = extractJdRequirementPhrases(jobText);
  const phraseSegments: string[] = [];
  for (const p of jdPhrases) {
    for (const seg of p.split(/[,;]/)) {
      const t = seg.trim();
      if (t.length >= 3 && t.length < 80) phraseSegments.push(t);
    }
  }

  const freqKeywords = extractFreqKeywordsFromJob(jobText, 14);
  const merged = mergeDedupeSkillStrings(profileSkillsInJd, phraseSegments, freqKeywords, 14);
  const targetSkills =
    merged.length > 0 ? merged : pickTop(candidateSkillsLower, 6);

  return { targetSkills: pickTop(targetSkills, 12), profileSkillsInJd, jdPhrases };
}

function generateInterviewQuestions(
  jobText: string,
  profile: { jobTitle?: string | null; overview?: string | null; keySkills: string[] },
  targetSkills: string[],
): InterviewQuestion[] {
  const jdLower = (jobText || "").toLowerCase();
  const top = pickTop(targetSkills || [], 4);
  const top0 = top[0] || "your core skills";
  const top1 = top[1] || top0;
  const jobTitle = extractJobTitle(jobText, profile.jobTitle) || "this role";

  const technicalMatch = /react|javascript|typescript|node|api|sql|aws|docker|frontend|backend|cloud|engineering|python|java|c\+\+|software|microservices|kubernetes/i.test(jdLower);
  const leadershipMatch = /lead|manage|mentor|stakeholder|leadership|collaborat/i.test(jdLower);
  const conflictMatch = /conflict|disagree|stakeholder/i.test(jdLower);
  const challengeMatch = /challenge|difficult|problem|debug|issue|failure/i.test(jdLower);
  const learningMatch = /learn|up\s*to\s*date|maintain|improve/i.test(jdLower);

  const generalIds = ["q-tell-me", "q-why-role", "q-strength"];
  const behavioralIds = [
    leadershipMatch ? "q-led" : "q-team",
    conflictMatch ? "q-conflict" : challengeMatch ? "q-challenge" : "q-team",
    "q-team",
  ];
  const technicalIds = technicalMatch
    ? ["q-technical-1", "q-technical-2", learningMatch ? "q-technical-3" : "q-technical-3"]
    : ["q-technical-1", "q-technical-2"];

  const orderedIds: string[] = [
    ...generalIds,
    ...Array.from(new Set(behavioralIds)).slice(0, 3),
    ...Array.from(new Set(technicalIds)).slice(0, technicalMatch ? 3 : 2),
  ];

  const templateById = new Map(QUESTIONS.map((q) => [q.id, q]));

  return orderedIds
    .map((id) => templateById.get(id))
    .filter(Boolean)
    .map((tpl) => {
      const questionTpl = tpl as InterviewQuestion;
      let question = questionTpl.question;
      if (questionTpl.id === "q-strength") {
        question = `What are your strengths as they relate to ${top0} for this role?`;
      } else if (questionTpl.id === "q-why-role") {
        question = `Why do you want this ${jobTitle} role, and how do your experiences support ${top0}?`;
      } else if (questionTpl.id === "q-tell-me") {
        question = `Tell me about yourself and share one example where you used ${top0} to deliver measurable impact.`;
      } else if (questionTpl.id === "q-weakness") {
        question = `What is a weakness you’re working on that could affect your work in ${top1}, and how are you improving it?`;
      } else if (questionTpl.id === "q-led") {
        question = `Tell me about a time you led a project or stakeholder effort related to ${top0}. What did you do, and what was the outcome?`;
      } else if (questionTpl.id === "q-conflict") {
        question = `Tell me about a time you resolved a conflict or disagreement while working in ${top0}.`;
      } else if (questionTpl.id === "q-challenge") {
        question = `Tell me about a challenge you faced while applying ${top0}. How did you handle it, step by step?`;
      } else if (questionTpl.id === "q-team") {
        question = `Describe a time you collaborated with a difficult teammate or stakeholder while delivering outcomes in ${top0}.`;
      } else if (questionTpl.id === "q-technical-1") {
        question = `Explain a complex concept from your field related to ${top0} in simple terms.`;
      } else if (questionTpl.id === "q-technical-2") {
        question = `Walk me through a technical project where you used ${top1}. What was your approach, and what trade-offs did you make?`;
      } else if (questionTpl.id === "q-technical-3") {
        question = `How do you keep your ${top0} skills up to date in this area?`;
      } else if (questionTpl.id === "q-5-years") {
        question = `Where do you see yourself in five years as a ${jobTitle} professional?`;
      }

      const extraTags = top.length ? [top0] : [];
      const tags = Array.from(new Set([...(questionTpl.tags || []), ...extraTags])).slice(0, 4);
      return {
        ...questionTpl,
        question,
        tags,
      };
    });
}

function normalizeAiCategory(value: unknown): QuestionCategory {
  const v = String(value || "").toLowerCase();
  if (v.includes("behavior")) return "behavioral";
  if (v.includes("technical")) return "technical";
  return "general";
}

function normalizeAiQuestions(raw: unknown): InterviewQuestion[] {
  const arr = Array.isArray(raw) ? raw : [];
  const out: InterviewQuestion[] = [];
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (typeof item === "string") {
      const q = item.trim();
      if (!q) continue;
      out.push({
        id: `ai-q-${i + 1}`,
        category: i % 3 === 0 ? "general" : i % 3 === 1 ? "behavioral" : "technical",
        question: q,
        tags: [],
      });
      continue;
    }
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const q = String(obj.question || obj.text || "").trim();
    if (!q) continue;
    const rawTags = Array.isArray(obj.tags) ? obj.tags : [];
    const tags = rawTags.map((t) => String(t).trim()).filter(Boolean).slice(0, 4);
    out.push({
      id: `ai-q-${i + 1}`,
      category: normalizeAiCategory(obj.category),
      question: q,
      tags,
    });
  }
  return out;
}

function getUserFacingErrorMessage(err: unknown, fallback: string): string {
  if (!err) return fallback;
  if (typeof err === "string") {
    const s = err.trim();
    return s || fallback;
  }
  if (err instanceof Error) {
    const s = String(err.message || "").trim();
    if (s && s !== "[object Object]") return s;
  }
  if (typeof err === "object") {
    const e = err as Record<string, unknown>;
    const candidates = [e.message, e.error, e.detail, e.reason];
    for (const c of candidates) {
      if (typeof c === "string" && c.trim() && c.trim() !== "[object Object]") return c.trim();
    }
  }
  return fallback;
}

function normalizeSkills(raw: unknown): string[] {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  const out: string[] = [];
  for (const item of arr) {
    if (!item) continue;
    if (typeof item === "string") {
      const s = item.trim();
      if (s) out.push(s);
      continue;
    }
    if (typeof item === "object" && "name" in item) {
      const s = String((item as { name?: unknown }).name ?? "").trim();
      if (s) out.push(s);
    }
  }
  return out;
}

function normalizeText(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s+.#/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pickTop<T>(arr: T[], n: number): T[] {
  return arr.slice(0, Math.max(0, n));
}

function scoreAnswer(answer: string, targetSkills: string[]) {
  const a = normalizeText(answer);
  const skills = pickTop(targetSkills, 10);
  const matchedSkills = skills.filter((s) => {
    const sn = normalizeText(s);
    if (!sn) return false;
    // Simple matching: exact substring OR token intersection
    if (a.includes(sn)) return true;
    const tokens = sn.split(" ").filter(Boolean);
    return tokens.some((t) => t.length > 2 && a.includes(t));
  });

  const missingSkills = skills.filter((s) => !matchedSkills.includes(s));
  const scoreBase = skills.length ? Math.round((matchedSkills.length / skills.length) * 100) : 0;

  const hasSpecifics = /\d+[%\w]*|(\bincreased\b|\bimproved\b|\bdecreased\b|\breduced\b|\bdelivered\b|\bshipped\b)/i.test(answer);
  const hasSTAR = /\b(situation|task|action|result)\b/i.test(answer) || /\bstar\b/i.test(answer);
  const hasStructureSignals = /^(first|second|third|finally|in summary)/im.test(answer) || /(\.|\n)\s*(first|second|third)/im.test(answer);

  const rubricBoost = [
    hasSpecifics ? 10 : 0,
    hasSTAR ? 10 : 0,
    hasStructureSignals ? 5 : 0,
  ].reduce((a, b) => a + b, 0);

  const score = Math.max(0, Math.min(100, scoreBase + rubricBoost));
  return { score, matchedSkills, missingSkills };
}

function buildImprovements(answer: string, targetSkills: string[], matchedSkills: string[]) {
  const improvements: string[] = [];
  const a = normalizeText(answer);

  if (answer.trim().length < 60) {
    improvements.push("Add a concrete example (what you did, with context, and the outcome).");
  }

  const hasSTAR = /\b(situation|task|action|result)\b/i.test(answer) || /\bstar\b/i.test(answer);
  if (!hasSTAR) {
    improvements.push("Use a STAR-style structure (Situation, Task, Action, Result).");
  }

  const hasSpecifics = /\d+[%\w]*|(\bincreased\b|\bimproved\b|\bdecreased\b|\breduced\b|\bdelivered\b|\bshipped\b)/i.test(answer);
  if (!hasSpecifics) {
    improvements.push("Include at least one measurable impact (numbers, % improvement, scope, or timeline).");
  }

  const topMissing = pickTop(targetSkills.filter((s) => !matchedSkills.includes(s)), 4);
  if (topMissing.length) {
    improvements.push(`We didn’t clearly hear: ${topMissing.join(", ")}. Mention how you used them in your example(s).`);
  }

  // Encourage conversational flow.
  if (!/thank|appreciate|so that|therefore|as a result/i.test(answer)) {
    improvements.push("Close your answer with a takeaway (what you learned or what the outcome enabled).");
  }

  return improvements.slice(0, 6);
}

function buildSuggestedAnswer(params: {
  question: string;
  overview: string;
  jobTitle: string;
  keySkills: string[];
  matchedSkills: string[];
}) {
  const { question, overview, jobTitle, keySkills, matchedSkills } = params;
  const topSkills = matchedSkills.length ? pickTop(matchedSkills, 3) : pickTop(keySkills, 3);
  const skillLine = topSkills.length ? `My core strengths include ${topSkills.join(", ")}.` : "";
  const overviewLine = overview?.trim()
    ? `In brief, ${overview.trim().replace(/\s+/g, " ").slice(0, 180)}`
    : "";

  if (/tell me about yourself/i.test(question)) {
    return [
      `I’m a ${jobTitle || "professional"} with a strong foundation in the skills I use every day.`,
      overviewLine ? overviewLine : `I focus on delivering real outcomes and improving how work gets done.`,
      skillLine || "I collaborate well, communicate clearly, and take ownership of my responsibilities.",
      "In interviews, I like to connect my experience to the role—so the team can move faster and deliver higher-quality results.",
      "If you’d like, I can walk you through one project where I used these strengths end-to-end.",
    ].filter(Boolean).join("\n\n");
  }

  if (/why do you want this role/i.test(question)) {
    return [
      `I’m excited about this role because it matches how I like to work: focusing on impact, learning quickly, and applying my skills to real problems.`,
      topSkills.length ? `Based on my background, I can contribute immediately through ${topSkills.join(", ")}.` : "",
      overviewLine ? `I’m especially interested in ${overviewLine.slice(0, 90)}…` : "",
      "I’d love to support your team by improving outcomes, collaborating with stakeholders, and continuously strengthening my approach.",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  // Generic STAR framework suggestion.
  const exampleSkill = topSkills.length ? topSkills[0] : "my key skills";
  return [
    "Sure — here’s an example using the STAR format:",
    "Situation: (brief context, when/where, and what was at stake).",
    "Task: (what you were responsible for and what success looked like).",
    "Action: I focused on the key levers — especially using my experience in " + exampleSkill + ", aligning with stakeholders, and executing iteratively.",
    "Result: I delivered measurable outcomes (timeline, quality, or performance) and made sure the learnings were documented for future work.",
    "Takeaway: I’ve kept improving this approach, and I’d bring the same structure to this role.",
  ].join("\n\n");
}

function buildFollowUpQuestion(params: {
  currentQuestion: string;
  answer: string;
  targetSkills: string[];
}): string | null {
  const answer = (params.answer || "").trim();
  if (answer.length < 20) return null;

  const sentence = answer
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .find((s) => s.length >= 18);

  const normalized = normalizeText(answer);
  const matchedSkill = params.targetSkills.find((s) => {
    const sn = normalizeText(s);
    return sn && normalized.includes(sn);
  });

  if (matchedSkill) {
    return `You mentioned ${matchedSkill}. Can you share one specific example, your exact actions, and the measurable result?`;
  }

  if (sentence) {
    const short = sentence.length > 100 ? `${sentence.slice(0, 100).trim()}...` : sentence;
    return `You said "${short}". What was your direct contribution, and how did you measure success?`;
  }

  return "Can you expand on that with a concrete example and the outcome?";
}

const SmartApplyInterviewPrepPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = localStorage.getItem("smart_apply_token");

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    jobTitle?: string | null;
    overview?: string | null;
    keySkills: string[];
  } | null>(null);

  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [targetSkills, setTargetSkills] = useState<string[]>([]);
  const [preparedQuestions, setPreparedQuestions] = useState<InterviewQuestion[]>(QUESTIONS);
  const [isPrepared, setIsPrepared] = useState(false);
  const [prepStep, setPrepStep] = useState<1 | 2 | 3 | 4>(1);
  const [jdJobTitle, setJdJobTitle] = useState<string>("");
  /** Skills from your profile that literally appear in the pasted JD. */
  const [profileSkillsInJd, setProfileSkillsInJd] = useState<string[]>([]);
  /** Short phrases pulled from typical JD wording (e.g. "experience with …"). */
  const [jdPhrases, setJdPhrases] = useState<string[]>([]);

  const [category, setCategory] = useState<QuestionCategory>("general");
  const [activeQuestionId, setActiveQuestionId] = useState<string>(QUESTIONS[0].id);
  const activeQuestion = useMemo(
    () =>
      preparedQuestions.find((q) => q.id === activeQuestionId) ||
      preparedQuestions[0] ||
      QUESTIONS[0],
    [activeQuestionId, preparedQuestions],
  );

  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [preparingQuestions, setPreparingQuestions] = useState(false);
  const [interviewRunning, setInterviewRunning] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);
  const [followUpAskedForCurrent, setFollowUpAskedForCurrent] = useState(false);
  const [hasRespondedToCurrentPrompt, setHasRespondedToCurrentPrompt] = useState(false);
  const [silenceWarningGiven, setSilenceWarningGiven] = useState(false);
  const [interviewWrapUpPending, setInterviewWrapUpPending] = useState(false);
  const [candidateWantsToAsk, setCandidateWantsToAsk] = useState(false);
  const [candidateQuestion, setCandidateQuestion] = useState("");
  const [candidateQuestionsAsked, setCandidateQuestionsAsked] = useState<string[]>([]);
  const [unansweredPrompts, setUnansweredPrompts] = useState<string[]>([]);
  const [answersByQuestionId, setAnswersByQuestionId] = useState<Record<string, string>>({});
  const [feedbackByQuestionId, setFeedbackByQuestionId] = useState<Record<string, InterviewFeedback>>({});

  // Speech recognition
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any | null>(null);
  /** User wants dictation until they click Stop (not auto-stop on pause). */
  const speechContinueRef = useRef(false);
  /** Text in the answer field when the current dictation session started. */
  const speechBaselineRef = useRef("");
  /** Transcript already committed before a browser `onend` restart (Chrome clears `results` between runs). */
  const speechPersistedRef = useRef("");
  /** Latest live hypothesis for the current recognition run (full `results` snapshot). */
  const speechLastLiveRef = useRef("");

  // Local webcam + recording (video interview preview)
  const [videoSupported, setVideoSupported] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const recordingUrlRef = useRef<string | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recorderChunksRef = useRef<BlobPart[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const lastSpokenPromptRef = useRef<string>("");
  const lastPersistedQuestionIdRef = useRef<string>(activeQuestionId);
  const followUpBaseAnswerRef = useRef("");

  useEffect(() => {
    if (!token) {
      navigate("/smart-apply/sign-in");
      return;
    }
    let cancelled = false;
    smartApplyAPI
      .getProfile()
      .then((res: { profile?: any }) => {
        if (cancelled) return;
        const p = res?.profile ?? {};
        const keySkills = normalizeSkills((p as any).keySkills);
        setProfile({
          jobTitle: (p as any).jobTitle ?? (p as any).job_title ?? null,
          overview: (p as any).overview ?? null,
          keySkills,
        });
      })
      .catch((err: any) => {
        if (cancelled) return;
        toast({ title: "Could not load profile", description: err?.message || "Try again.", variant: "destructive" });
        setProfile({ jobTitle: null, overview: null, keySkills: [] });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [navigate, toast, token]);

  useEffect(() => {
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setSpeechSupported(false);
      return;
    }

    setSpeechSupported(true);
    try {
      const recognition = new SpeechRecognitionCtor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        // Rebuild from the full results list each time so interim text doesn't "jump" or vanish.
        // (Using only `resultIndex..end` breaks when the engine revises earlier segments.)
        let live = "";
        for (let i = 0; i < event.results.length; i++) {
          live += event.results[i]?.[0]?.transcript ?? "";
        }
        speechLastLiveRef.current = live.replace(/\s+/g, " ").trim();
        const baseline = speechBaselineRef.current.trim();
        const combined = [baseline, speechPersistedRef.current, speechLastLiveRef.current]
          .filter(Boolean)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        setAnswer(combined);
      };

      recognition.onerror = (event: any) => {
        const code = event?.error ? String(event.error) : "";
        // Common while waiting for speech; keep session if user still wants dictation.
        if (code === "no-speech" && speechContinueRef.current) {
          return;
        }
        if (code === "aborted" && !speechContinueRef.current) {
          return;
        }
        const msg = code || "Speech recognition error";
        setSpeechError(msg);
        speechContinueRef.current = false;
        setIsListening(false);
      };

      recognition.onend = () => {
        if (!speechContinueRef.current) {
          setIsListening(false);
          return;
        }
        // Before restarting, persist what we had — the next `start()` clears `event.results`.
        speechPersistedRef.current = [speechPersistedRef.current, speechLastLiveRef.current]
          .filter(Boolean)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        speechLastLiveRef.current = "";
        // Browsers often end the session after a pause; restart until the user clicks Stop.
        window.setTimeout(() => {
          if (!speechContinueRef.current || !recognitionRef.current) return;
          try {
            recognitionRef.current.start();
          } catch {
            setIsListening(false);
            speechContinueRef.current = false;
          }
        }, 0);
      };

      recognitionRef.current = recognition;
    } catch {
      setSpeechSupported(false);
    }

    return () => {
      try {
        recognitionRef.current?.stop?.();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    const hasGUM = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
    const hasMediaRecorder = typeof window !== "undefined" && !!(window as any).MediaRecorder;
    setVideoSupported(Boolean(hasGUM && hasMediaRecorder));
    return () => {
      // Cleanup camera stream + stop timer on unmount.
      if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      if (recordingUrlRef.current) {
        URL.revokeObjectURL(recordingUrlRef.current);
        recordingUrlRef.current = null;
      }

      try {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      } catch {
        // ignore
      }
      if (mediaStreamRef.current) {
        for (const track of mediaStreamRef.current.getTracks()) track.stop();
        mediaStreamRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = videoPreviewRef.current;
    const stream = mediaStreamRef.current;
    if (!el || !stream || !isCameraOn) return;

    // Attach stream after video element is mounted/re-mounted.
    el.srcObject = stream;
    el.play().catch(() => {});
  }, [isCameraOn]);

  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        window.clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const visibleQuestions = useMemo(() => {
    return preparedQuestions.filter((q) => q.category === category);
  }, [category, preparedQuestions]);

  const combineAnswerParts = (baseAnswer: string, nextAnswer: string) => {
    return [baseAnswer.trim(), nextAnswer.trim()].filter(Boolean).join("\n\n");
  };

  const getAnswerForPersistence = (draftAnswer: string) => {
    if (!followUpQuestion) return draftAnswer;
    return combineAnswerParts(followUpBaseAnswerRef.current, draftAnswer);
  };

  useEffect(() => {
    // If the active question isn't in the selected category, switch to the first of that category.
    if (!visibleQuestions.some((q) => q.id === activeQuestionId)) {
      setActiveQuestionId(visibleQuestions[0]?.id ?? preparedQuestions[0]?.id ?? QUESTIONS[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const startListening = () => {
    if (isRecording) {
      setSpeechError("Stop recording first (video interview capture).");
      return;
    }
    setSpeechError(null);
    if (!recognitionRef.current) {
      setSpeechError("Speech recognition is not available in this browser.");
      return;
    }
    speechContinueRef.current = true;
    speechBaselineRef.current = answer;
    speechPersistedRef.current = "";
    speechLastLiveRef.current = "";
    try {
      recognitionRef.current.start();
      setIsListening(true);
      setFeedback(null);
    } catch (err: any) {
      speechContinueRef.current = false;
      setSpeechError(err instanceof Error ? err.message : "Could not start microphone.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    speechContinueRef.current = false;
    try {
      recognitionRef.current?.stop?.();
    } catch {
      // ignore
    } finally {
      setIsListening(false);
    }
  };

  const stopPromptAudio = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
  };

  const enableVideo = async () => {
    setRecordingError(null);

    if (!videoSupported) {
      setRecordingError("Video recording is not supported in this browser/device.");
      return;
    }

    if (mediaStreamRef.current) {
      // Already enabled.
      setIsCameraOn(true);
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = mediaStreamRef.current;
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      mediaStreamRef.current = stream;
      setIsCameraOn(true);

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        await videoPreviewRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      setRecordingError(err instanceof Error ? err.message : "Could not access camera/microphone.");
    }
  };

  const disableVideo = () => {
    setRecordingError(null);
    if (isRecording) {
      stopRecording();
    }

    if (mediaStreamRef.current) {
      for (const track of mediaStreamRef.current.getTracks()) track.stop();
      mediaStreamRef.current = null;
    }
    setIsCameraOn(false);

    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
  };

  const startRecording = async () => {
    setRecordingError(null);
    if (!videoSupported) {
      setRecordingError("Video recording is not supported in this browser/device.");
      return;
    }
    if (isRecording) return;

    // Speech recognition also needs microphone access; stop it first to avoid conflicts.
    stopListening();

    await enableVideo();
    const stream = mediaStreamRef.current;
    if (!stream) return;

    const MediaRecorderCtor = (window as any).MediaRecorder as typeof MediaRecorder | undefined;
    if (!MediaRecorderCtor) {
      setRecordingError("MediaRecorder is not available in this browser.");
      return;
    }

    try {
      const preferredTypes = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
      const chosenType = preferredTypes.find((t) => MediaRecorderCtor.isTypeSupported?.(t)) || "";

      recorderChunksRef.current = [];
      const options = chosenType ? { mimeType: chosenType } : undefined;

      const recorder = new MediaRecorderCtor(stream, options as any);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) recorderChunksRef.current.push(event.data);
      };

      recorder.onerror = (event: any) => {
        setRecordingError(event?.error ? String(event.error) : "Recording error.");
      };

      recorder.onstop = () => {
        setIsRecording(false);
        if (recordingTimerRef.current) {
          window.clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        setRecordingSeconds(0);

        const mime = recorder.mimeType || "video/webm";
        const blob = new Blob(recorderChunksRef.current, { type: mime });
        const url = URL.createObjectURL(blob);
        setRecordingUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          recordingUrlRef.current = url;
          return url;
        });
      };

      recorder.start(1000);
      setIsRecording(true);
      setRecordingSeconds(0);
      if (recordingTimerRef.current) window.clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err: any) {
      setRecordingError(err instanceof Error ? err.message : "Could not start recording.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    } catch {
      // ignore
    }
  };

  const downloadRecording = () => {
    if (!recordingUrl) return;
    const a = document.createElement("a");
    a.href = recordingUrl;
    a.download = "interview-recording.webm";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleNextQuestion = () => {
    if (isRecording) stopRecording();
    const idx = visibleQuestions.findIndex((q) => q.id === activeQuestionId);
    const next = visibleQuestions[idx + 1] || visibleQuestions[0] || preparedQuestions[0] || QUESTIONS[0];
    setFollowUpQuestion(null);
    setFollowUpAskedForCurrent(false);
    setSilenceWarningGiven(false);
    setActiveQuestionId(next.id); // answer/feedback restored by activeQuestionId effect
    stopListening();
  };

  const handlePrepareInterview = async () => {
    try {
      if (!profile) {
        toast({ title: "Profile not loaded yet", variant: "destructive" });
        return;
      }

      const jd = jobDescriptionText.trim();
      if (!jd) {
        toast({ title: "Paste a job description first", description: "This helps us tailor questions.", variant: "destructive" });
        return;
      }
      const jdWordCount = jd.split(/\s+/).filter(Boolean).length;
      if (jdWordCount < 12) {
        toast({
          title: "We couldn't understand that job description",
          description: "Please paste a fuller role description with responsibilities, required skills, and experience level.",
          variant: "destructive",
        });
        return;
      }

      const extracted = extractTargetSkillsFromJob(jd, profile.keySkills || []);
      const extractedSkills = Array.isArray(extracted?.targetSkills) ? extracted.targetSkills : [];
      setProfileSkillsInJd(extracted.profileSkillsInJd ?? []);
      setJdPhrases(extracted.jdPhrases ?? []);
      const jdTitle = extractJobTitle(jd, profile.jobTitle);
      setPreparingQuestions(true);
      let prepared: InterviewQuestion[] = [];
      try {
        const aiRes = await smartApplyAPI.generateInterviewQuestions({
          jobDescription: jd,
          jobTitle: profile.jobTitle || "",
          overview: profile.overview || "",
          keySkills: profile.keySkills || [],
          targetSkills: extractedSkills,
          count: 10,
        });
        prepared = normalizeAiQuestions(aiRes?.questions);
      } catch {
        // Fallback to local generation if AI endpoint is unavailable.
        prepared = [];
      } finally {
        setPreparingQuestions(false);
      }

      if (!prepared.length) {
        prepared = generateInterviewQuestions(
          jd,
          {
            jobTitle: profile.jobTitle,
            overview: profile.overview,
            keySkills: profile.keySkills || [],
          },
          extractedSkills,
        );
      }

      const safePrepared = prepared.length ? prepared : QUESTIONS;
      if (!safePrepared.length) {
        toast({
          title: "We couldn't understand that job description",
          description: "Please paste a clearer JD (role summary, requirements, and key skills) and try again.",
          variant: "destructive",
        });
        setPrepStep(1);
        return;
      }

      setTargetSkills(extractedSkills);
      setJdJobTitle(jdTitle || "");
      setPreparedQuestions(safePrepared);
      setIsPrepared(true);
      setPrepStep(2);
      setInterviewRunning(false);
      setFollowUpQuestion(null);
      setFollowUpAskedForCurrent(false);
      setInterviewWrapUpPending(false);
      setCandidateWantsToAsk(false);
      setCandidateQuestion("");
      setCandidateQuestionsAsked([]);
      setUnansweredPrompts([]);
      setAnswersByQuestionId({});
      setFeedbackByQuestionId({});
      followUpBaseAnswerRef.current = "";
      lastSpokenPromptRef.current = "";

      const first = safePrepared[0];
      setActiveQuestionId(first?.id ?? QUESTIONS[0].id);
      if (first?.category && !safePrepared.some((q) => q.category === category)) setCategory(first.category);

      setAnswer("");
      setFeedback(null);
      stopListening();

      toast({ title: "Interview prepared", description: "Questions tailored to your job description.", variant: "default" });
    } catch (err: any) {
      // Avoid blank screen: surface tailoring errors to the user.
      // eslint-disable-next-line no-console
      console.error("Prepare interview failed:", err);
      toast({
        title: "Could not prepare interview",
        description: getUserFacingErrorMessage(
          err,
          "We couldn't understand that job description. Please paste a clearer role summary, requirements, and key skills, then try again.",
        ),
        variant: "destructive",
      });
      setPrepStep(1);
    }
  };

  const handleResetInterview = () => {
    // Turn off camera + stop recording (if active) when resetting the flow.
    try {
      disableVideo();
    } catch {
      // ignore
    }
    if (recordingUrlRef.current) {
      URL.revokeObjectURL(recordingUrlRef.current);
      recordingUrlRef.current = null;
    }

    setIsPrepared(false);
    setPrepStep(1);
    setTargetSkills([]);
    setJdJobTitle("");
    setProfileSkillsInJd([]);
    setJdPhrases([]);
    setPreparedQuestions(QUESTIONS);
    setCategory("general");
    setActiveQuestionId(QUESTIONS[0].id);
    setInterviewRunning(false);
    setFollowUpQuestion(null);
    setFollowUpAskedForCurrent(false);
    setInterviewWrapUpPending(false);
    setCandidateWantsToAsk(false);
    setCandidateQuestion("");
    setCandidateQuestionsAsked([]);
    setUnansweredPrompts([]);
    setAnswersByQuestionId({});
    setFeedbackByQuestionId({});
    followUpBaseAnswerRef.current = "";
    lastSpokenPromptRef.current = "";
    setJobDescriptionText("");
    setAnswer("");
    setFeedback(null);
    setRecordingUrl(null);
    setRecordingError(null);
    setRecordingSeconds(0);
    stopListening();
    stopPromptAudio();
  };

  const handleEditJobDescription = () => {
    // Keep JD text, but clear the prepared tailoring so the user can re-run the flow.
    try {
      disableVideo();
    } catch {
      // ignore
    }
    if (recordingUrlRef.current) {
      URL.revokeObjectURL(recordingUrlRef.current);
      recordingUrlRef.current = null;
    }

    setIsPrepared(false);
    setPrepStep(1);
    setTargetSkills([]);
    setJdJobTitle("");
    setProfileSkillsInJd([]);
    setJdPhrases([]);
    setPreparedQuestions(QUESTIONS);
    setCategory("general");
    setActiveQuestionId(QUESTIONS[0].id);
    setInterviewRunning(false);
    setFollowUpQuestion(null);
    setFollowUpAskedForCurrent(false);
    setInterviewWrapUpPending(false);
    setCandidateWantsToAsk(false);
    setCandidateQuestion("");
    setCandidateQuestionsAsked([]);
    setUnansweredPrompts([]);
    setAnswersByQuestionId({});
    setFeedbackByQuestionId({});
    followUpBaseAnswerRef.current = "";
    lastSpokenPromptRef.current = "";
    setAnswer("");
    setFeedback(null);
    setRecordingUrl(null);
    setRecordingError(null);
    setRecordingSeconds(0);
    stopListening();
    stopPromptAudio();
  };

  const handleStartMockInterview = () => {
    if (!preparedQuestions.length) {
      setPreparedQuestions(QUESTIONS);
      setTargetSkills([]);
      setJdJobTitle("");
      setProfileSkillsInJd([]);
      setJdPhrases([]);
      setCategory("general");
      setActiveQuestionId(QUESTIONS[0].id);
    }
    setInterviewRunning(false);
    setFollowUpQuestion(null);
    setFollowUpAskedForCurrent(false);
    setInterviewWrapUpPending(false);
    setCandidateWantsToAsk(false);
    setCandidateQuestion("");
    setCandidateQuestionsAsked([]);
    setUnansweredPrompts([]);
    setAnswersByQuestionId({});
    setFeedbackByQuestionId({});
    followUpBaseAnswerRef.current = "";
    lastSpokenPromptRef.current = "";
    setPrepStep(3);
  };

  const handleGetFeedback = async () => {
    const answerText = getAnswerForPersistence(answer).trim();
    if (!answerText) {
      toast({ title: "Write or speak an answer first", variant: "destructive" });
      return;
    }
    const q = preparedQuestions.find((pq) => pq.id === activeQuestionId) || activeQuestion;
    if (!q) {
      toast({ title: "No active question", description: "Select a question first.", variant: "destructive" });
      return;
    }
    setFeedbackLoading(true);
    try {
      const perQuestion = saveQuestionFeedback({
        questionId: q.id,
        questionText: q.question,
        answerText,
      });
      setFeedback(perQuestion);
      setPrepStep(4);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) {
      toast({ title: "Text-to-speech not supported", variant: "destructive" });
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.02;
    utter.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  const moveToNextPreparedQuestion = () => {
    if (activeQuestion?.id) {
      const trimmed = getAnswerForPersistence(answer).trim();
      saveQuestionFeedback({
        questionId: activeQuestion.id,
        questionText: activeQuestion.question,
        answerText: trimmed,
        unanswered: !trimmed,
      });
    }
    const idx = preparedQuestions.findIndex((q) => q.id === activeQuestionId);
    const next = preparedQuestions[idx + 1];
    setFollowUpQuestion(null);
    setFollowUpAskedForCurrent(false);
    setHasRespondedToCurrentPrompt(false);
    setSilenceWarningGiven(false);
    followUpBaseAnswerRef.current = "";

    if (!next) {
      setInterviewRunning(false);
      setInterviewWrapUpPending(true);
      stopListening();
      toast({ title: "Final interview step", description: "Do you have any questions for the interviewer?", variant: "default" });
      return;
    }

    setActiveQuestionId(next.id); // answer/feedback restored by activeQuestionId effect
    setCategory(next.category);
  };

  const saveQuestionFeedback = (params: {
    questionId: string;
    questionText: string;
    answerText: string;
    unanswered?: boolean;
  }) => {
    const answerText = params.answerText || "";
    const skillsForFeedback = targetSkills.length ? targetSkills : profile?.keySkills || [];
    const { score, matchedSkills, missingSkills } = params.unanswered
      ? { score: 0, matchedSkills: [] as string[], missingSkills: skillsForFeedback.slice(0, 6) }
      : scoreAnswer(answerText, skillsForFeedback);

    const strengths: string[] =
      params.unanswered
        ? ["No response provided for this question."]
        : matchedSkills.length > 0
          ? matchedSkills.slice(0, 5).map((s) => `Mentions ${s}.`)
          : ["Your answer is relevant; add more specific evidence and examples."];

    const improvements = params.unanswered
      ? ["Answer this question using a short STAR structure (Situation, Task, Action, Result)."]
      : buildImprovements(answerText, skillsForFeedback, matchedSkills);

    const suggestedAnswer = buildSuggestedAnswer({
      question: params.questionText,
      overview: profile?.overview || "",
      jobTitle: (isPrepared && jdJobTitle ? jdJobTitle : profile?.jobTitle) || "",
      keySkills: skillsForFeedback,
      matchedSkills,
    });

    const perQuestionFeedback: InterviewFeedback = {
      score,
      matchedSkills: matchedSkills.slice(0, 8),
      missingSkills: missingSkills.slice(0, 6),
      strengths: strengths.slice(0, 4),
      improvements,
      suggestedAnswer,
    };

    setAnswersByQuestionId((prev) => ({ ...prev, [params.questionId]: answerText }));
    setFeedbackByQuestionId((prev) => ({ ...prev, [params.questionId]: perQuestionFeedback }));
    return perQuestionFeedback;
  };

  const handleSilenceTick = () => {
    if (!interviewRunning) return;
    const answered = answer.trim().length > 0 || hasRespondedToCurrentPrompt;
    if (!answered) {
      if (!silenceWarningGiven) {
        // First silence: warn the user and give another chance before skipping.
        setSilenceWarningGiven(true);
        const warning = "No answer detected. Please answer the question, or say skip to move on.";
        speakText(warning);
        toast({
          title: "No answer detected",
          description: 'Please answer the question or say "skip" to move on.',
          variant: "destructive",
        });
        resetSilenceTimer(1800);
        return;
      }
      // Second silence: mark as unanswered and advance.
      const preservedAnswer = getAnswerForPersistence("").trim();
      if (followUpQuestion && preservedAnswer) {
        setSilenceWarningGiven(false);
        setUnansweredPrompts((prev) => [currentPrompt, ...prev].slice(0, 10));
        setFollowUpQuestion(null);
        setFollowUpAskedForCurrent(false);
        setHasRespondedToCurrentPrompt(false);
        saveQuestionFeedback({
          questionId: activeQuestion.id,
          questionText: activeQuestion.question,
          answerText: preservedAnswer,
        });
        toast({
          title: "Follow-up skipped",
          description: "Keeping your main answer and moving to the next question.",
          variant: "default",
        });
        moveToNextPreparedQuestion();
        return;
      }
      setSilenceWarningGiven(false);
      saveQuestionFeedback({
        questionId: activeQuestion.id,
        questionText: activeQuestion.question,
        answerText: "",
        unanswered: true,
      });
      setUnansweredPrompts((prev) => [currentPrompt, ...prev].slice(0, 10));
      toast({
        title: "Moving to next question",
        description: "No answer provided.",
        variant: "default",
      });
      moveToNextPreparedQuestion();
      return;
    }

    if (!followUpAskedForCurrent) {
      const maybeFollowUp = buildFollowUpQuestion({
        currentQuestion: activeQuestion.question,
        answer,
        targetSkills,
      });
      if (maybeFollowUp) {
        followUpBaseAnswerRef.current = answer.trim();
        setFollowUpQuestion(maybeFollowUp);
        setFollowUpAskedForCurrent(true);
        setHasRespondedToCurrentPrompt(false);
        setAnswer("");
        setFeedback(null);
        return;
      }
    }

    moveToNextPreparedQuestion();
  };

  const resetSilenceTimer = (extraDelayMs = 0) => {
    if (silenceTimerRef.current) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (!interviewRunning) return;
    // Don't auto-skip a follow-up before the candidate starts replying to it.
    if (followUpQuestion && !hasRespondedToCurrentPrompt) return;
    silenceTimerRef.current = window.setTimeout(() => {
      handleSilenceTick();
    }, Math.max(0, extraDelayMs) + 6000);
  };

  const handleStartInterviewSession = () => {
    if (!preparedQuestions.length) {
      toast({ title: "No interview questions yet", description: "Prepare interview first.", variant: "destructive" });
      return;
    }
    const first = preparedQuestions[0];
    setActiveQuestionId(first.id);
    setCategory(first.category);
    setFollowUpQuestion(null);
    setFollowUpAskedForCurrent(false);
    setHasRespondedToCurrentPrompt(false);
    setSilenceWarningGiven(false);
    setInterviewRunning(true);
    setInterviewWrapUpPending(false);
    setCandidateWantsToAsk(false);
    setCandidateQuestion("");
    setCandidateQuestionsAsked([]);
    setUnansweredPrompts([]);
    setAnswersByQuestionId({});
    setFeedbackByQuestionId({});
    followUpBaseAnswerRef.current = "";
    lastSpokenPromptRef.current = "";
    if (!isListening && speechSupported) startListening();
  };

  const handleStopInterviewSession = () => {
    if (isRecording) stopRecording();
    setInterviewRunning(false);
    setSilenceWarningGiven(false);
    if (silenceTimerRef.current) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    stopListening();
    stopPromptAudio();
  };

  const handleConcludeInterview = () => {
    setInterviewWrapUpPending(false);
    setCandidateWantsToAsk(false);
    setCandidateQuestion("");
    setInterviewRunning(false);
    stopListening();
    stopPromptAudio();
    toast({ title: "Interview concluded", description: "Great effort. You can continue practicing or get feedback.", variant: "default" });
  };

  const handleSubmitCandidateQuestion = () => {
    const q = candidateQuestion.trim();
    if (!q) {
      toast({ title: "Write a question first", variant: "destructive" });
      return;
    }
    setCandidateQuestionsAsked((prev) => [q, ...prev].slice(0, 5));
    setCandidateQuestion("");
    toast({ title: "Question captured", description: "Nice closing question. Ask another or conclude the interview.", variant: "default" });
  };

  const currentPrompt = followUpQuestion || activeQuestion.question;
  const interviewRate = useMemo(() => {
    const list = Object.values(feedbackByQuestionId);
    if (!list.length) return 0;
    const total = list.reduce((sum, f) => sum + (Number.isFinite(f.score) ? f.score : 0), 0);
    return Math.round(total / list.length);
  }, [feedbackByQuestionId]);
  const perQuestionFeedbackList = useMemo(
    () =>
      preparedQuestions
        .filter((q) => !!feedbackByQuestionId[q.id])
        .map((q) => ({
          question: q,
          answer: answersByQuestionId[q.id] ?? "",
          feedback: feedbackByQuestionId[q.id],
        })),
    [preparedQuestions, feedbackByQuestionId, answersByQuestionId],
  );

  useEffect(() => {
    if (!interviewRunning) return;
    const promptKey = `${activeQuestionId}|${followUpQuestion || "__main__"}`;
    if (lastSpokenPromptRef.current === promptKey) return;
    // Don't re-read the main question if the user already has a saved answer for it.
    // Follow-up questions are always read (followUpQuestion is truthy in that case).
    if (!followUpQuestion && answersByQuestionId[activeQuestionId]?.trim()) return;
    lastSpokenPromptRef.current = promptKey;
    speakText(currentPrompt);
    // Give the candidate time to hear the asked prompt before the 6s silence rule starts.
    const approxAskMs = Math.max(1200, Math.min(8000, Math.round(currentPrompt.split(/\s+/).length * 260)));
    resetSilenceTimer(approxAskMs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewRunning, activeQuestionId, followUpQuestion, currentPrompt]);

  useEffect(() => {
    if (!interviewRunning) return;
    const trimmedAnswer = answer.trim();
    // Detect "skip" voice/text command → mark current question unanswered and advance.
    if (/\bskip\b/i.test(trimmedAnswer)) {
      const preservedAnswer = getAnswerForPersistence("").trim();
      if (activeQuestion?.id) {
        saveQuestionFeedback({
          questionId: activeQuestion.id,
          questionText: activeQuestion.question,
          answerText: preservedAnswer,
          unanswered: !preservedAnswer,
        });
      }
      setSilenceWarningGiven(false);
      setFollowUpQuestion(null);
      setFollowUpAskedForCurrent(false);
      setHasRespondedToCurrentPrompt(false);
      const idx = preparedQuestions.findIndex((q) => q.id === activeQuestionId);
      const next = preparedQuestions[idx + 1];
      if (!next) {
        setInterviewRunning(false);
        setInterviewWrapUpPending(true);
        stopListening();
        toast({ title: "Final interview step", description: "Do you have any questions for the interviewer?", variant: "default" });
      } else {
        setActiveQuestionId(next.id); // answer/feedback restored by activeQuestionId effect
        setCategory(next.category);
        toast({ title: "Question skipped", description: "Moving to the next question.", variant: "default" });
      }
      return;
    }
    // Keep the initial ask-delay timer intact until the candidate actually starts answering.
    if (trimmedAnswer.length === 0) {
      if (hasRespondedToCurrentPrompt) {
        setHasRespondedToCurrentPrompt(false);
      }
      return;
    }
    if (trimmedAnswer.length > 0 && !hasRespondedToCurrentPrompt) {
      setHasRespondedToCurrentPrompt(true);
      return;
    }
    resetSilenceTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer, interviewRunning, followUpQuestion, hasRespondedToCurrentPrompt]);

  // Always persist the live answer into the per-question map (not just during interview mode).
  useEffect(() => {
    // When question id changes, skip one persist cycle to avoid copying the old answer into the new question.
    if (lastPersistedQuestionIdRef.current !== activeQuestion.id) {
      lastPersistedQuestionIdRef.current = activeQuestion.id;
      return;
    }
    setAnswersByQuestionId((prev) => ({ ...prev, [activeQuestion.id]: getAnswerForPersistence(answer) }));
  }, [answer, activeQuestion.id]);

  // When the active question changes, restore its previously saved answer (or blank).
  useEffect(() => {
    followUpBaseAnswerRef.current = "";
    const saved = answersByQuestionId[activeQuestionId] ?? "";
    setAnswer(saved);
    // Always start a new question in awaiting-answer mode.
    setHasRespondedToCurrentPrompt(false);
    setSilenceWarningGiven(false);
    // Reset speech baseline so dictation doesn't prepend the loaded text twice.
    speechBaselineRef.current = saved;
    speechPersistedRef.current = "";
    speechLastLiveRef.current = "";
    setFeedback(feedbackByQuestionId[activeQuestionId] ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuestionId]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">Loading interview prep…</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title="Interview Preparation - Smart Apply" />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Interview Preparation</h1>
              <p className="text-gray-600 mt-1">
                Practice with common questions, speak your answers, and get structured feedback.
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <Button variant="outline" className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900" asChild>
                <Link to="/smart-apply/profile">Update profile</Link>
              </Button>
            </div>
          </div>

          <div className="-mx-1 flex items-center overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(
              [
                { step: 1, label: "Job description" },
                { step: 2, label: "Tailor questions" },
                { step: 3, label: "Mock interview" },
                { step: 4, label: "Feedback" },
              ] as { step: 1 | 2 | 3 | 4; label: string }[]
            ).map(({ step, label }, idx) => (
              <div key={step} className="flex shrink-0 items-center">
                {idx > 0 && (
                  <ChevronRight className="h-4 w-4 mx-1 shrink-0 text-gray-300" aria-hidden />
                )}
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1 text-sm font-medium ${
                    prepStep === step
                      ? "border-indigo-200 bg-indigo-50 text-indigo-800"
                      : step < prepStep
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 bg-white text-gray-400"
                  }`}
                >
                  {step < prepStep && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                  )}
                  {step}. {label}
                </span>
              </div>
            ))}
          </div>

          {prepStep === 1 && (
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardContent className="space-y-4 pt-6">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Job description</div>
                  <div className="font-semibold text-gray-900">Submit the JD to tailor your interview</div>
                  <div className="text-xs text-gray-600">
                    We use your Smart Apply profile and job description keywords to prepare questions and scoring.
                  </div>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
                  <Button
                    type="button"
                    onClick={handlePrepareInterview}
                    disabled={!profile || !jobDescriptionText.trim() || preparingQuestions}
                    className="w-full bg-indigo-600 text-white hover:bg-indigo-700 sm:w-auto"
                    style={{ backgroundColor: DEEP_BLUE }}
                  >
                    <Sparkles className={`h-4 w-4 mr-2 ${preparingQuestions ? "animate-spin" : ""}`} />
                    {preparingQuestions ? "Generating questions..." : "Prepare interview"}
                  </Button>
                  {jobDescriptionText.trim() && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 sm:w-auto"
                      onClick={handleResetInterview}
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </div>

              <Textarea
                value={jobDescriptionText}
                onChange={(e) => setJobDescriptionText(e.target.value)}
                placeholder="Paste the job description here (role responsibilities, requirements, and skills)."
                className="min-h-[120px] bg-white"
              />
            </CardContent>
          </Card>
          )}

          {prepStep === 2 && (
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader className="space-y-3 border-b border-gray-100 pb-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <Badge variant="outline" className="w-fit border-indigo-200 bg-indigo-50 text-indigo-800">
                      Step 2 of 4
                    </Badge>
                    <CardTitle className="text-xl text-gray-900">Review your tailored interview</CardTitle>
                    <CardDescription className="text-sm text-gray-600 max-w-2xl">
                      We used your job description and Smart Apply profile to pick focus keywords and shape your question set.
                      Check the preview below, then start the mock interview when you are ready.
                    </CardDescription>
                  </div>
                  <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 sm:w-auto"
                      onClick={handleEditJobDescription}
                    >
                      ← Edit job description
                    </Button>
                    <Button
                      type="button"
                      onClick={handleStartMockInterview}
                      className="w-full text-white hover:opacity-90 sm:w-auto"
                      style={{ backgroundColor: DEEP_BLUE }}
                      disabled={!jobDescriptionText.trim()}
                    >
                      <Sparkles className="h-4 w-4 mr-2" /> Start mock interview
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pt-6">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <Target className="h-4 w-4 text-indigo-600" />
                      What we matched
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Role focus</p>
                        {jdJobTitle ? (
                          <p className="mt-1 text-sm font-medium text-gray-900">{jdJobTitle}</p>
                        ) : (
                          <p className="mt-1 text-sm text-gray-500">No single line detected — we still tailored from the full JD.</p>
                        )}
                      </div>
                      {profileSkillsInJd.length > 0 && (
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Your profile skills found in this JD
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {profileSkillsInJd.map((s) => (
                              <Badge
                                key={s}
                                variant="secondary"
                                className="max-w-full break-all border border-emerald-200 bg-emerald-50 text-emerald-900"
                              >
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {jdPhrases.length > 0 && (
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Requirement-style phrases from the JD
                          </p>
                          <ul className="mt-2 space-y-1.5 text-sm text-gray-700">
                            {jdPhrases.slice(0, 8).map((p, i) => (
                              <li key={`${i}-${p.slice(0, 40)}`} className="border-l-2 border-indigo-200 pl-2 leading-snug">
                                {p}
                              </li>
                            ))}
                          </ul>
                          {jdPhrases.length > 8 && (
                            <p className="mt-1 text-xs text-gray-500">+{jdPhrases.length - 8} more phrases scanned.</p>
                          )}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Focus keywords (questions &amp; feedback)
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Merged from your profile matches, JD wording, and repeated terms — used to tailor questions and score answers.
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {targetSkills.length === 0 ? (
                            <span className="text-sm text-gray-500">
                              No strong keyword list — we still used the full JD text for questions.
                            </span>
                          ) : (
                            targetSkills.slice(0, 12).map((s) => (
                              <Badge key={s} variant="secondary" className="max-w-full break-all bg-white text-gray-800 border border-gray-200">
                                {s}
                              </Badge>
                            ))
                          )}
                        </div>
                        {targetSkills.length > 12 && (
                          <p className="mt-2 text-xs text-gray-500">+{targetSkills.length - 12} more used for feedback.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      What happens next
                    </div>
                    <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-600">
                      <li>Open the mock interview with your full question list and optional video preview.</li>
                      <li>Answer by typing or speaking; you can record your session locally.</li>
                      <li>Get structured feedback aligned to these keywords and your profile.</li>
                    </ol>
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <ListOrdered className="h-4 w-4 text-indigo-600" />
                    Question preview
                    <span className="ml-auto text-xs font-normal text-gray-500">
                      {preparedQuestions.length} question{preparedQuestions.length === 1 ? "" : "s"} prepared
                    </span>
                  </div>
                  <div className="max-h-[min(360px,50vh)] overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100 bg-white">
                    {preparedQuestions.slice(0, 10).map((q, index) => (
                      <div key={q.id} className="flex gap-3 p-3 sm:p-4">
                        <span
                          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600"
                          aria-hidden
                        >
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <Badge
                            variant="outline"
                            className={
                              q.category === "general"
                                ? "border-gray-200 bg-gray-50 text-gray-700"
                                : q.category === "behavioral"
                                  ? "border-indigo-200 bg-indigo-50 text-indigo-800"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
                            }
                          >
                            {q.category}
                          </Badge>
                          <p className="text-sm leading-snug text-gray-900">{q.question}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {preparedQuestions.length > 10 && (
                    <p className="mt-2 text-xs text-gray-500">
                      Showing 10 of {preparedQuestions.length}. The rest appear in step 3.
                    </p>
                  )}
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 sm:w-auto"
                    onClick={handleEditJobDescription}
                  >
                    Edit job description
                  </Button>
                  <Button
                    type="button"
                    className="w-full text-white hover:opacity-90 sm:w-auto"
                    style={{ backgroundColor: DEEP_BLUE }}
                    onClick={handleStartMockInterview}
                    disabled={!jobDescriptionText.trim()}
                  >
                    Continue to mock interview <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {prepStep === 3 && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Common questions */}
            <div className="lg:col-span-1">
              <Card className="border border-gray-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                    Common interview questions
                  </CardTitle>
                  <CardDescription>Pick one to start a mock interview.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {(["general", "behavioral", "technical"] as QuestionCategory[]).map((c) => (
                      <Button
                        key={c}
                        size="sm"
                        variant={category === c ? "default" : "outline"}
                        className={
                          category === c
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        }
                        onClick={() => setCategory(c)}
                      >
                        {c === "general" ? "General" : c === "behavioral" ? "Behavioral" : "Technical"}
                      </Button>
                    ))}
                  </div>

                  <div className="max-h-[420px] overflow-y-auto pr-1 space-y-2">
                    {visibleQuestions.map((q) => {
                      const active = q.id === activeQuestionId;
                      return (
                        <button
                          key={q.id}
                          type="button"
                          className={`w-full text-left rounded-lg border px-3 py-2 transition-colors ${
                            active
                              ? "border-indigo-300 bg-indigo-50"
                              : "border-gray-200 bg-white hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            setSilenceWarningGiven(false);
                            setFollowUpQuestion(null);
                            setActiveQuestionId(q.id); // answer/feedback restored by activeQuestionId effect
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 line-clamp-2">{q.question}</div>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {q.tags.slice(0, 2).map((t) => (
                                  <Badge key={t} variant="secondary" className="bg-gray-100 text-gray-600">
                                    {t}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <ChevronRight className={`h-4 w-4 mt-0.5 ${active ? "text-indigo-700" : "text-gray-400"}`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 w-full"
                      onClick={() => {
                        setAnswer("");
                        setFeedback(null);
                        setAnswersByQuestionId((prev) => { const n = { ...prev }; delete n[activeQuestionId]; return n; });
                        setFeedbackByQuestionId((prev) => { const n = { ...prev }; delete n[activeQuestionId]; return n; });
                      }}
                    >
                      Clear answer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Mock interview + feedback */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border border-gray-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center justify-between gap-2 flex-wrap">
                    <span>Mock interview</span>
                    <Badge className="bg-indigo-50 text-indigo-800 border-indigo-200" variant="outline">
                      {activeQuestion.category}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Answer the question below. Use speech or typing, then submit for feedback.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Camera className="h-4 w-4 text-indigo-600" />
                          <span className="font-semibold text-gray-900">Video interview (local)</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Enable camera + mic to preview and record. You can download the recording.
                        </div>
                      </div>
                      {isRecording ? (
                        <Badge className="bg-red-50 text-red-700 border-red-200" variant="outline">
                          Recording… {recordingSeconds}s
                        </Badge>
                      ) : (
                        <Badge className="bg-indigo-50 text-indigo-800 border-indigo-200" variant="outline">
                          Preview ready
                        </Badge>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                      <div className="md:col-span-1">
                        <div className="relative w-full aspect-video rounded-md bg-gray-900 overflow-hidden">
                          {isCameraOn ? (
                            <video
                              ref={videoPreviewRef}
                              className="absolute inset-0 w-full h-full object-cover"
                              autoPlay
                              playsInline
                              muted
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-gray-300">
                              <div>
                                <div className="font-medium">Camera preview</div>
                                <div className="text-xs opacity-80">Click “Enable video”</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        {!videoSupported ? (
                          <Badge variant="secondary" className="bg-amber-50 text-amber-800 border-amber-200">
                            Video recording not supported
                          </Badge>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                            {!isCameraOn ? (
                              <Button
                                type="button"
                                onClick={enableVideo}
                                disabled={!videoSupported}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                style={{ backgroundColor: DEEP_BLUE }}
                              >
                                <Camera className="h-4 w-4 mr-2" /> Enable video
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={disableVideo}
                                className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                              >
                                Turn off video
                              </Button>
                            )}

                            {!isRecording ? (
                              <Button
                                type="button"
                                onClick={startRecording}
                                disabled={!isCameraOn}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                style={{ backgroundColor: DEEP_BLUE }}
                              >
                                <Square className="h-4 w-4 mr-2" /> Start recording
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={stopRecording}
                                className="border-red-200 bg-white text-red-700 hover:bg-red-50 hover:text-red-800"
                              >
                                <StopCircle className="h-4 w-4 mr-2" /> Stop recording
                              </Button>
                            )}

                            <Button
                              type="button"
                              variant="outline"
                              onClick={downloadRecording}
                              disabled={!recordingUrl}
                              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            >
                              <Download className="h-4 w-4 mr-2" /> Download
                            </Button>
                          </div>
                        )}

                        {recordingError && (
                          <div className="flex items-center gap-2 text-sm text-red-600">
                            <AlertTriangle className="h-4 w-4" /> {recordingError}
                          </div>
                        )}

                        {recordingUrl && !isRecording && (
                          <video
                            src={recordingUrl}
                            controls
                            className="w-full rounded-md border border-gray-200 bg-black"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm text-gray-600 mb-1">Question</p>
                    {interviewWrapUpPending ? (
                      <div className="space-y-3">
                        <p className="text-gray-900 font-semibold">Before we conclude: do you have any questions for me?</p>
                        {!candidateWantsToAsk ? (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              className="bg-indigo-600 hover:bg-indigo-700 text-white"
                              style={{ backgroundColor: DEEP_BLUE }}
                              onClick={() => setCandidateWantsToAsk(true)}
                            >
                              Yes, I have a question
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                              onClick={handleConcludeInterview}
                            >
                              No, conclude interview
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Textarea
                              value={candidateQuestion}
                              onChange={(e) => setCandidateQuestion(e.target.value)}
                              placeholder="Ask your question to the interviewer..."
                              className="min-h-[90px] bg-white"
                            />
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                style={{ backgroundColor: DEEP_BLUE }}
                                onClick={handleSubmitCandidateQuestion}
                              >
                                Submit question
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                onClick={handleConcludeInterview}
                              >
                                Conclude interview
                              </Button>
                            </div>
                            {candidateQuestionsAsked.length > 0 && (
                              <div className="rounded-md border border-gray-200 bg-white p-3">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">Your asked questions</p>
                                <ul className="space-y-1 text-sm text-gray-800 list-disc pl-5">
                                  {candidateQuestionsAsked.map((q, i) => (
                                    <li key={`${i}-${q.slice(0, 40)}`}>{q}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-900 font-semibold">{currentPrompt}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {!interviewRunning ? (
                            <Button
                              type="button"
                              className="bg-indigo-600 hover:bg-indigo-700 text-white"
                              style={{ backgroundColor: DEEP_BLUE }}
                              onClick={handleStartInterviewSession}
                              disabled={isRecording}
                            >
                              <Sparkles className="h-4 w-4 mr-2" />
                              Start interview
                            </Button>
                          ) : (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                onClick={handleStopInterviewSession}
                              >
                                Stop interview
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                onClick={moveToNextPreparedQuestion}
                                disabled={isRecording}
                              >
                                Skip to next <ArrowRight className="h-4 w-4 ml-2" />
                              </Button>
                            </>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            onClick={() => speakText(currentPrompt)}
                          >
                            <Volume2 className="h-4 w-4 mr-2" />
                            Read prompt
                          </Button>
                        </div>
                        {interviewRunning && (
                          <p className="mt-2 text-xs text-gray-500">
                            Silence detected for 6 seconds triggers one follow-up question (if available), then moves to the next question.
                          </p>
                        )}
                        {unansweredPrompts.length > 0 && (
                          <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-amber-800">Unanswered prompts</p>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
                              {unansweredPrompts.slice(0, 3).map((p, i) => (
                                <li key={`${i}-${p.slice(0, 40)}`}>{p}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <Label>Answer (speech or text)</Label>
                      <div className="flex items-center gap-2">
                        {speechSupported ? (
                          <>
                            {isRecording ? (
                              <Badge className="bg-red-50 text-red-700 border-red-200" variant="outline">
                                Recording in progress
                              </Badge>
                            ) : isListening ? (
                              <Button
                                type="button"
                                variant="outline"
                                className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                onClick={stopListening}
                              >
                                <MicOff className="h-4 w-4 mr-2" />
                                Stop
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                onClick={startListening}
                              >
                                <Mic className="h-4 w-4 mr-2" />
                                Start speaking
                              </Button>
                            )}
                          </>
                        ) : (
                          <Badge variant="secondary" className="bg-amber-50 text-amber-800 border-amber-200">
                            Speech not supported
                          </Badge>
                        )}
                      </div>
                    </div>

                    {speechError && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertTriangle className="h-4 w-4" /> {speechError}
                      </div>
                    )}

                    <Textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type your answer here, or use Start speaking."
                      className="min-h-[160px] bg-white"
                    />

                    <div className="flex flex-wrap gap-3 items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Tip: Mention specific examples and outcomes.
                      </div>
                      <Button
                        type="button"
                        onClick={handleGetFeedback}
                        disabled={feedbackLoading || !getAnswerForPersistence(answer).trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        style={{ backgroundColor: DEEP_BLUE }}
                      >
                        {feedbackLoading ? (
                          <>
                            <Sparkles className="h-4 w-4 mr-2 animate-spin" /> Generating feedback…
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Get feedback (step 4)
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-xs text-gray-500">
                Tip: submit your answer to continue to step 4 and view detailed feedback.
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Note: feedback is generated locally using your profile and a structured rubric (no audio is uploaded).
          </div>
            </>
          )}

          {prepStep === 4 && (
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Feedback</CardTitle>
                <CardDescription>
                  {isPrepared
                    ? "Structured scoring and suggestions based on your job description + Smart Apply profile."
                    : "Structured scoring and suggestions based on your Smart Apply profile."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {perQuestionFeedbackList.length === 0 ? (
                  <div className="py-10 text-center text-gray-600">
                    No feedback yet. Go back to the mock interview and submit an answer.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-3 items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600">Interview rate</div>
                        <div className="text-3xl font-bold text-gray-900">{interviewRate}%</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Based on {perQuestionFeedbackList.length} answered or evaluated question
                          {perQuestionFeedbackList.length === 1 ? "" : "s"}.
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          onClick={() => setPrepStep(3)}
                        >
                          Back to mock interview
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          onClick={() => {
                            setAnswer("");
                            setFeedback(null);
                            setPrepStep(3);
                          }}
                        >
                          <RefreshCcw className="h-4 w-4 mr-2" />
                          Continue practicing
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {perQuestionFeedbackList.map(({ question, answer, feedback }) => (
                        <div key={question.id} className="rounded-lg border border-gray-200 bg-gray-50/60 p-4 space-y-3">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900">{question.question}</p>
                              <p className="text-xs text-gray-500 mt-1">Score: {feedback.score}%</p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                              onClick={() => {
                                setActiveQuestionId(question.id);
                                setCategory(question.category);
                                setFollowUpQuestion(null);
                                setFollowUpAskedForCurrent(false);
                                setHasRespondedToCurrentPrompt(false);
                                setInterviewWrapUpPending(false);
                                setAnswer(answer || "");
                                setFeedback(feedback);
                                setPrepStep(3);
                              }}
                            >
                              Retry this question
                            </Button>
                          </div>

                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Your answer</p>
                            <p className="mt-1 whitespace-pre-wrap rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-800">
                              {answer?.trim() ? answer : "You did not answer this question."}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div className="rounded-md border border-emerald-200 bg-emerald-50/60 p-3">
                              <div className="text-sm font-semibold text-emerald-800">Strengths</div>
                              <ul className="mt-2 space-y-1 text-sm text-emerald-900 list-disc list-inside">
                                {(feedback.strengths.length ? feedback.strengths : ["Add specific examples."]).map((s, i) => (
                                  <li key={i}>{s}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="rounded-md border border-amber-200 bg-amber-50/60 p-3 md:col-span-2">
                              <div className="text-sm font-semibold text-amber-800">How to improve</div>
                              <ul className="mt-2 space-y-1 text-sm text-amber-900 list-disc list-inside">
                                {feedback.improvements.map((s, i) => (
                                  <li key={i}>{s}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-semibold text-gray-900">Suggested answer (how you could answer)</div>
                            <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-800">
                              {feedback.suggestedAnswer}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default SmartApplyInterviewPrepPage;

