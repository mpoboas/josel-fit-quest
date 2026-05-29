import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily to avoid crashing on startup if the key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      throw new Error("GEMINI_API_KEY is not configured or contains placeholder value.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// FitQuest AI Smart Coach Endpoints
app.post("/api/coach/analyze", async (req, res) => {
  try {
    const { playerType, userDrives, goals, workoutHistory, level, rank } = req.body;

    const prompt = `
      You are the FitQuest Smart AI Coach, an expert fitness trainer specializing in gamified motivation.
      Use the provided user profile to generate a highly personalized fitness strategy, including tailored routines, specific challenge recommendations, and high-impact motivational feedback using Octalysis Framework principles.

      USER PROFILE:
      - Level: ${level || 1}
      - Rank: ${rank || "Bronze"}
      - Dominant Player Type: ${playerType || "Balanced Explorer"}
      - Dominant Octalysis Core Drives: ${JSON.stringify(userDrives || {})}
      - User Goals: ${JSON.stringify(goals || [])}
      - Core Workout History (last few sessions): ${JSON.stringify(workoutHistory || [])}

      Please generate a JSON object with the following exact keys:
      1. "insight": A warm, encouraging 2-3 sentence overview analyzing their performance or profile, addressing them specifically by their player type (e.g., Achiever, Socialiser). Do not write raw JSON markdown wrappers inside values, write standard text.
      2. "recommendations": An array of 3 actionable, specific, customized recommendations (e.g. "Try adding OHP to your Chest/Shoulders split with 4x10-12 reps to bypass your plateaus").
      3. "customChallenge": A specific gamified challenge tailored for their persona (e.g., if they are a 'Socialiser', suggest a group challenge; if 'Achiever', suggest a personal record challenge). Include keys: "title" (string), "description" (string), "rewardXp" (number, select between 300-600), "target" (string).
      
      Respond STRICTLY with valid JSON. Do not include markdown blocks like \`\`\`json or backticks. Just the raw JSON content.
    `;

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text ? response.text.trim() : "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("AI Coach recommendation error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate AI Coach suggestions.",
      fallback: {
        insight: "Your AI Coach is fully charged but awaiting a valid Gemini API key. Configure it in the Secrets panel to unlock tailored workouts and deep drives assessment predictions!",
        recommendations: [
          "Increase weekly consistency to trigger Silver rank-up.",
          "Balance heavy compound chest splits with a mandatory cardio session once a week.",
          "Hit an active 7-day streak to claim a premium Streak Shield item!"
        ],
        customChallenge: {
          title: "API Offline Sprint",
          description: "Initialize Gemini Coach by establishing your api keys in settings.",
          rewardXp: 500,
          target: "Config secrets"
        }
      }
    });
  }
});

// Configure Vite or Serve static assets
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite HMR middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Serve index.html for all non-API GET requests in developments
    app.get("*", async (req, res, next) => {
      // Exclude API requests
      if (req.path.startsWith("/api/")) {
        return next();
      }
      try {
        const htmlPath = path.resolve(process.cwd(), "index.html");
        let html = fs.readFileSync(htmlPath, "utf-8");
        // Apply Vite HTML transforms
        html = await vite.transformIndexHtml(req.originalUrl, html);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e) {
        next(e);
      }
    });
  } else {
    console.log("Starting server in production mode, serving built assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FitQuest server running on http://localhost:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Failed to boot Express+Vite server:", err);
});
