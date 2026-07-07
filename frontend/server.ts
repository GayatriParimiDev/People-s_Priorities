import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import multer from "multer";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Transcription endpoint using Gemini
app.post('/api/transcribe', upload.single('audio'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file received" });
    }

    const base64Audio = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype || "audio/webm";

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ error: "Gemini API client not configured" });
    }

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
      contents: [
        {
          parts: [
            {
              text: "Transcribe this audio exactly as spoken. The speaker may be using Hindi, English, or a regional Indian language, or a mix. Return ONLY the transcript text, then on a new line write 'LANGUAGE: ' followed by the detected language name. No other commentary.",
            },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Audio,
              },
            },
          ],
        },
      ],
    });

    const text = response.text || "";
    const [transcriptPart, languagePart] = text.split("LANGUAGE:");

    res.json({
      transcript: transcriptPart?.trim() || "",
      detectedLanguage: languagePart?.trim() || "unknown",
    });
  } catch (err: any) {
    console.error("Transcription error in dev server:", err);
    res.status(500).json({ error: "Transcription failed" });
  }
});

// Proxy requests to the real backend running on port 5000 (Vite proxy doesn't work in middlewareMode)
app.use('/api', async (req, res, next) => {
  const path = req.path;
  const backendPaths = [
    '/auth',
    '/suggestions',
    '/ai',
    '/data-integration',
    '/ranking',
    '/proposals',
    '/funds',
    '/scheme-match',
    '/reports',
    '/ledger',
    '/user'
  ];
  const shouldForward = backendPaths.some(p => path.startsWith(p));
  if (!shouldForward) {
    return next();
  }

  try {
    const targetUrl = `http://localhost:5000/api${req.originalUrl.substring(4)}`;
    
    const headers: Record<string, string> = {};
    for (const [key, val] of Object.entries(req.headers)) {
      if (val !== undefined && key !== 'host' && key !== 'content-length') {
        headers[key] = Array.isArray(val) ? val.join(', ') : String(val);
      }
    }

    const fetchOptions: RequestInit = {
      method: req.method,
      headers: headers,
      body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined
    };

    const backendRes = await fetch(targetUrl, fetchOptions);
    const contentType = backendRes.headers.get('content-type');

    res.status(backendRes.status);
    
    backendRes.headers.forEach((val, key) => {
      res.setHeader(key, val);
    });

    if (contentType && contentType.includes('application/json')) {
      const json = await backendRes.json();
      res.json(json);
    } else {
      const text = await backendRes.text();
      res.send(text);
    }
  } catch (err: any) {
    console.error('Error forwarding request to backend:', err.message);
    res.status(500).json({ error: 'Gateway Error: Failed to reach backend API' });
  }
});

// Lazy-loaded Gemini AI client to prevent startup crashes when API key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// In-memory data store for state persistence
interface LedgerItem {
  id: string;
  submissionDate: string;
  priorityLevel: "CRITICAL" | "ELEVATED" | "STANDARD" | "RESOLVED";
  theme: string;
  title: string;
  status: "UNDER REVIEW" | "SCHEDULED" | "ARCHIVED" | "CLOSED" | "IN PROGRESS";
  description: string;
  latitude: number;
  longitude: number;
  signatures: number;
  verificationStatus: string;
}

interface ThemeStat {
  id: string;
  name: string;
  count: number;
}

// Initialize with mockup defaults
let ledger: LedgerItem[] = [
  {
    id: "LGR-7892",
    submissionDate: "2024-10-27 14:32:00 UTC",
    priorityLevel: "CRITICAL",
    theme: "Arterial Road Repair",
    title: "Arterial Road Repair",
    status: "UNDER REVIEW",
    description: "Major pothole density and pavement crack propagation identified along District 74-B main transport sector. Heavy congestion and transport delays reported.",
    latitude: 51.5135,
    longitude: -0.1372,
    signatures: 4208,
    verificationStatus: "Audited",
  },
  {
    id: "LGR-7891",
    submissionDate: "2024-10-26 09:15:22 UTC",
    priorityLevel: "ELEVATED",
    theme: "Education Infrastructure",
    title: "Education Funding Allocation",
    status: "SCHEDULED",
    description: "Request for comprehensive structural remediation and digital infrastructure installation for District Secondary Facility.",
    latitude: 51.5112,
    longitude: -0.1345,
    signatures: 1250,
    verificationStatus: "Audited",
  },
  {
    id: "LGR-7890",
    submissionDate: "2024-10-25 18:45:10 UTC",
    priorityLevel: "STANDARD",
    theme: "Public Transport Expansion",
    title: "Public Transit Route Expansion",
    status: "ARCHIVED",
    description: "Proposed expansion of low-emission bus routes linking outer housing hubs with central commercial areas.",
    latitude: 51.5158,
    longitude: -0.1312,
    signatures: 840,
    verificationStatus: "Verified",
  },
  {
    id: "LGR-7889",
    submissionDate: "2024-10-24 11:20:05 UTC",
    priorityLevel: "RESOLVED",
    theme: "Youth Employment Center",
    title: "Community Center Zoning",
    status: "CLOSED",
    description: "Request for a dedicated community trade/vocational training room for adult reskilling and local apprenticeship coordination.",
    latitude: 51.5098,
    longitude: -0.1398,
    signatures: 3120,
    verificationStatus: "Resolved",
  },
];

let themes: ThemeStat[] = [
  { id: "01", name: "Clean Water Access", count: 428 },
  { id: "02", name: "Solar Lighting Infrastructure", count: 315 },
  { id: "03", name: "Arterial Road Repair", count: 280 },
  { id: "04", name: "Youth Employment Center", count: 156 },
];

let districtConfig = {
  districtId: "74-B",
  representative: "Councilor J. Doe",
  mfaEnabled: true,
  auditLoggingEnabled: true,
  language: "English (US)",
  languages: ["English", "Spanish", "Mandarin"],
};

// Endorsement State for Proposal Evaluation Engine
let proposalEndorsements = {
  alphaCount: 1204,
  betaCount: 560,
  alphaPercent: 68.4,
  betaPercent: 31.6,
};

// --- IN-MEMORY AUTHENTICATION DATABASE ---
interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "MP" | "ADMINISTRATOR" | "CITIZEN";
  districtId?: string;
  office?: string;
  avatarUrl?: string;
}

const users: UserRecord[] = [
  {
    id: "usr-1",
    name: "Councilor J. Doe",
    email: "mp@assembly.gov",
    passwordHash: "password123",
    role: "MP",
    districtId: "74-B",
    avatarUrl: "",
  },
  {
    id: "usr-2",
    name: "Administrator Smith",
    email: "admin@assembly.gov",
    passwordHash: "password123",
    role: "ADMINISTRATOR",
    office: "Infrastructural Oversight",
    avatarUrl: "",
  },
  {
    id: "usr-3",
    name: "Jane Smith (Citizen)",
    email: "citizen@assembly.gov",
    passwordHash: "password123",
    role: "CITIZEN",
    avatarUrl: "",
  },
];

const sessions: Record<string, string> = {}; // token -> userId

function getCurrentUser(req: any): UserRecord | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const userId = sessions[token];
    if (userId) {
      return users.find(u => u.id === userId) || null;
    }
  }
  return null;
}

// API Endpoints
// Commented out to let Vite proxy auth requests to the real backend Express server (port 5000)
/*
app.get("/api/auth/me", (req, res) => {
  const user = getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized access" });
  }
  const { passwordHash, ...safeUser } = user;
  res.json({ user: safeUser });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  
  const token = "sess_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
  sessions[token] = user.id;

  const { passwordHash, ...safeUser } = user;
  res.json({ user: safeUser, token });
});

app.post("/api/auth/signup", (req, res) => {
  const { email, password, name, role, districtId, office } = req.body;
  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: "Required fields: email, password, name, role" });
  }

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const newUser: UserRecord = {
    id: "usr_" + Math.random().toString(36).substring(2),
    name,
    email: email.toLowerCase(),
    passwordHash: password,
    role: role as "MP" | "ADMINISTRATOR",
    districtId: role === "MP" ? (districtId || "74-B") : undefined,
    office: role === "ADMINISTRATOR" ? (office || "General Oversight") : undefined,
    avatarUrl: "",
  };

  users.push(newUser);

  const token = "sess_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
  sessions[token] = newUser.id;

  const { passwordHash, ...safeUser } = newUser;
  res.json({ user: safeUser, token });
});

app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    delete sessions[token];
  }
  res.json({ success: true });
});

app.post("/api/auth/profile/update", (req, res) => {
  const user = getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized access" });
  }

  const { name, email, districtId, office, avatarUrl } = req.body;

  if (name !== undefined) user.name = name;
  if (email !== undefined) {
    const other = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== user.id);
    if (other) {
      return res.status(409).json({ error: "This email address is already taken" });
    }
    user.email = email.toLowerCase();
  }
  if (districtId !== undefined && user.role === "MP") user.districtId = districtId;
  if (office !== undefined && user.role === "ADMINISTRATOR") user.office = office;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

  // Sync back to districtConfig for general display compatibility
  if (user.role === "MP") {
    districtConfig.representative = user.name;
    if (user.districtId) {
      districtConfig.districtId = user.districtId;
    }
  }

  const { passwordHash, ...safeUser } = user;
  res.json({ user: safeUser });
});
*/

// API Endpoints
app.get("/api/ledger", (req, res) => {
  res.json({
    ledger,
    themes,
    districtConfig,
    proposalEndorsements,
    totalDemands: ledger.reduce((sum, item) => sum + 1, 1488), // Scale starting count plus dynamic additions
  });
});

app.get("/api/dashboard", (req, res) => {
  const resolvedCount = ledger.filter(item => item.status === "CLOSED" || item.priorityLevel === "RESOLVED").length;
  res.json({
    totalDemands: ledger.reduce((sum, item) => sum + 1, 1488),
    criticalResolutions: 380 + resolvedCount,
    pendingAllocation: "8.4M",
    themes,
    activeMarkers: ledger.length
  });
});

app.get("/api/user/dashboard", (req, res) => {
  const resolvedCount = ledger.filter(item => item.status === "CLOSED" || item.priorityLevel === "RESOLVED").length;
  res.json({
    user: {
      profile: {
        id: "usr-citizen-42",
        name: "Jane Smith",
        email: "jane.smith@sohoassembly.org",
        avatarUrl: "",
        joinedDate: "2025-03-10T08:30:00Z"
      },
      constituency: {
        districtId: "74-B",
        name: "Soho North Division",
        representative: districtConfig.representative || "Councilor J. Doe",
        governanceLevel: "Municipal District Assembly"
      },
      participationStats: {
        engagementScore: 88,
        badges: [
          {
            id: "bdg-01",
            name: "First Responder",
            description: "Earned by submitting the first verified district feedback log.",
            earnedAt: "2025-03-12T14:22:00Z"
          },
          {
            id: "bdg-02",
            name: "Audit Endorser",
            description: "Signed more than 10 critical public legislative proposals.",
            earnedAt: "2025-05-18T10:05:00Z"
          }
        ]
      }
    },
    metrics: {
      totalSuggestionsSubmitted: 14,
      suggestionsUnderReview: 6,
      suggestionsAccepted: 5,
      suggestionsImplemented: 3
    },
    submissions: [
      {
        id: "SUB-8291",
        title: "Solar Lighting along Ward 3",
        description: "Request for low-emission solar street lighting along Soho alleyways to resolve safety concerns.",
        theme: "Solar Lighting Infrastructure",
        status: "IN PROGRESS",
        priorityLevel: "ELEVATED",
        submissionDate: "2026-06-15T09:00:00Z",
        signaturesCount: 248,
        location: {
          latitude: 51.5112,
          longitude: -0.1345
        },
        statusTimeline: [
          {
            status: "SUBMITTED",
            timestamp: "2026-06-15T09:00:00Z",
            notes: "Civic ledger record established. Block hash verified."
          },
          {
            status: "UNDER REVIEW",
            timestamp: "2026-06-16T14:22:00Z",
            notes: "Designated committee review complete. Structural feasibility approved."
          },
          {
            status: "IN PROGRESS",
            timestamp: "2026-06-20T11:00:00Z",
            notes: "Budget allocations finalized under municipal code. Installation crew scheduled."
          }
        ]
      },
      {
        id: "SUB-7812",
        title: "Bateman St Pavement Rehabilitation",
        description: "Severe pothole propagation and pavement cracking restricting traffic along main arterial transport corridor.",
        theme: "Arterial Road Repair",
        status: "CLOSED",
        priorityLevel: "CRITICAL",
        submissionDate: "2026-05-10T10:12:00Z",
        signaturesCount: 512,
        location: {
          latitude: 51.5135,
          longitude: -0.1372
        },
        statusTimeline: [
          {
            status: "SUBMITTED",
            timestamp: "2026-05-10T10:12:00Z",
            notes: "Report logged into decentralized ledger."
          },
          {
            status: "UNDER REVIEW",
            timestamp: "2026-05-11T09:00:00Z",
            notes: "Oversight team dispatched to inspect road defects."
          },
          {
            status: "RESOLVED",
            timestamp: "2026-05-14T16:45:00Z",
            notes: "Pavement remediation complete. Road audit closed."
          },
          {
            status: "CLOSED",
            timestamp: "2026-05-15T08:00:00Z",
            notes: "Constituency validation complete. Closed with positive citizen feedback."
          }
        ]
      }
    ],
    aiInsights: {
      sentimentSummary: {
        overall: "Optimistic",
        confidence: 0.89,
        summaryText: "Citizen logs exhibit progressive focus on sustainable lighting and transport upgrades, showing high community engagement alignment."
      },
      categoryDistribution: [
        { category: "Solar Lighting Infrastructure", percentage: 35 },
        { category: "Arterial Road Repair", percentage: 25 },
        { category: "Clean Water Access", percentage: 20 },
        { category: "Youth Employment Center", percentage: 10 },
        { category: "Education Infrastructure", percentage: 10 }
      ],
      priorityScoreHistory: [
        { month: "Jan", score: 45 },
        { month: "Feb", score: 52 },
        { month: "Mar", score: 58 },
        { month: "Apr", score: 64 },
        { month: "May", score: 75 },
        { month: "Jun", score: 82 }
      ]
    },
    constituencyUpdates: [
      {
        id: "up-101",
        title: "Public Hearing: District Solar Lighting Schemes",
        content: "Councilor J. Doe is hosting a public session on Solar Lighting schemes on July 12th in Assembly Hall.",
        date: "2026-07-05T12:00:00Z",
        relevance: "Matches active proposal SUB-8291"
      },
      {
        id: "up-102",
        title: "Soho Road Audits Completed",
        content: "All pavement works along Bateman St are now verified completed. Thank you to all citizen reporters.",
        date: "2026-05-15T09:00:00Z",
        relevance: "Matches resolved proposal SUB-7812"
      }
    ],
    notifications: [
      {
        id: "ntf-901",
        type: "STATUS_CHANGE",
        message: "Proposal 'Solar Lighting along Ward 3' has entered construction phase.",
        read: false,
        createdAt: "2026-06-20T11:05:00Z"
      },
      {
        id: "ntf-902",
        type: "BADGE_EARNED",
        message: "Congratulations! You have earned the 'Audit Endorser' badge.",
        read: true,
        createdAt: "2025-05-18T10:06:00Z"
      }
    ]
  });
});

app.post("/api/ledger/endorse", (req, res) => {
  const { proposal } = req.body;
  if (proposal === "alpha") {
    proposalEndorsements.alphaCount += 1;
  } else if (proposal === "beta") {
    proposalEndorsements.betaCount += 1;
  }
  
  const total = proposalEndorsements.alphaCount + proposalEndorsements.betaCount;
  proposalEndorsements.alphaPercent = Math.round((proposalEndorsements.alphaCount / total) * 1000) / 10;
  proposalEndorsements.betaPercent = Math.round((proposalEndorsements.betaCount / total) * 1000) / 10;
  
  res.json({ endorsements: proposalEndorsements });
});

app.post("/api/ledger/submit", async (req, res) => {
  const { text, type, imagePrompt } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: "Submission content is required" });
  }

  const ai = getGeminiClient();
  let analysisResult = {
    theme: "Arterial Road Repair",
    title: "Constituency Request",
    priorityLevel: "STANDARD",
    description: text,
    latitude: 51.512 + (Math.random() - 0.5) * 0.01,
    longitude: -0.136 + (Math.random() - 0.5) * 0.01,
  };

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
        contents: `Analyze the following citizen constituency demand submission and extract structure details.
Input Type: ${type}
Submission Text/Description: "${text}"
${imagePrompt ? `Associated Image/Photo Prompt description: "${imagePrompt}"` : ""}

Generate a JSON object matching exactly this schema:
{
  "theme": "Clean Water Access" | "Solar Lighting Infrastructure" | "Arterial Road Repair" | "Youth Employment Center" | "Education Infrastructure" | "Public Transport Expansion",
  "title": "A short concise title for this issue",
  "priorityLevel": "CRITICAL" | "ELEVATED" | "STANDARD" | "RESOLVED",
  "description": "A refined, professional, and slightly enhanced summary of the demand"
}

Keep themes closely aligned with existing ones or select the best fit. Keep description clear.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              theme: { type: Type.STRING },
              title: { type: Type.STRING },
              priorityLevel: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["theme", "title", "priorityLevel", "description"],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        analysisResult = {
          ...analysisResult,
          ...parsed,
        };
      }
    } catch (err) {
      console.error("Gemini classification failed, falling back to local simulation:", err);
    }
  } else {
    // Local simple keyword classification fallback
    const lower = text.toLowerCase();
    if (lower.includes("water") || lower.includes("pipe") || lower.includes("leak") || lower.includes("drain")) {
      analysisResult.theme = "Clean Water Access";
      analysisResult.title = "Water Utility Pipeline Repair";
      analysisResult.priorityLevel = "ELEVATED";
    } else if (lower.includes("light") || lower.includes("lamp") || lower.includes("dark") || lower.includes("solar")) {
      analysisResult.theme = "Solar Lighting Infrastructure";
      analysisResult.title = "Solar Street Light Installation";
      analysisResult.priorityLevel = "STANDARD";
    } else if (lower.includes("road") || lower.includes("pothole") || lower.includes("pavement") || lower.includes("drive")) {
      analysisResult.theme = "Arterial Road Repair";
      analysisResult.title = "Pavement Remediation Request";
      analysisResult.priorityLevel = "CRITICAL";
    } else if (lower.includes("youth") || lower.includes("job") || lower.includes("work") || lower.includes("center") || lower.includes("vocational")) {
      analysisResult.theme = "Youth Employment Center";
      analysisResult.title = "Youth Skill Development Hub";
      analysisResult.priorityLevel = "STANDARD";
    } else if (lower.includes("school") || lower.includes("class") || lower.includes("education") || lower.includes("college")) {
      analysisResult.theme = "Education Infrastructure";
      analysisResult.title = "School Classroom Facility Upgrade";
      analysisResult.priorityLevel = "ELEVATED";
    }
    
    // Add custom short summary as title
    if (text.length < 50) {
      analysisResult.title = text;
    }
  }

  // Assign fresh ID and meta values
  const newId = `LGR-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateStr = new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC";

  const newItem: LedgerItem = {
    id: newId,
    submissionDate: dateStr,
    priorityLevel: analysisResult.priorityLevel as any,
    theme: analysisResult.theme,
    title: analysisResult.title,
    status: "UNDER REVIEW",
    description: analysisResult.description,
    latitude: analysisResult.latitude,
    longitude: analysisResult.longitude,
    signatures: 1,
    verificationStatus: "Verified",
  };

  // Prepend to ledger
  ledger = [newItem, ...ledger];

  // Update theme counts
  const matchedTheme = themes.find(t => t.name === newItem.theme);
  if (matchedTheme) {
    matchedTheme.count += 1;
  } else {
    themes.push({
      id: String(themes.length + 1).padStart(2, "0"),
      name: newItem.theme,
      count: 1,
    });
  }

  res.json({ item: newItem, themes });
});

app.post("/api/config", (req, res) => {
  const { districtId, representative, mfaEnabled, auditLoggingEnabled, language, languages } = req.body;
  
  if (districtId !== undefined) districtConfig.districtId = districtId;
  if (representative !== undefined) districtConfig.representative = representative;
  if (mfaEnabled !== undefined) districtConfig.mfaEnabled = mfaEnabled;
  if (auditLoggingEnabled !== undefined) districtConfig.auditLoggingEnabled = auditLoggingEnabled;
  if (language !== undefined) districtConfig.language = language;
  if (languages !== undefined) districtConfig.languages = languages;

  res.json(districtConfig);
});

// Serve compiled frontend files or mount Vite middleware in development
async function startServer() {
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
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();
