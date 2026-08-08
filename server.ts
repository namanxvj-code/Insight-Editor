import express from "express";
import path from "path";

import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini Client Utility with Telemetry Header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not defined in environment variables. Auto-fill feature will fall back to local templates.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// API Endpoint for Profile Auto-fill
app.post("/api/import-profile", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ 
        error: "Gemini API client not configured",
        fallback: true 
      });
    }

    const cleanUsername = username.replace(/^@/, "").trim().toLowerCase();

    // Instruct Gemini to generate a highly detailed and cohesive mockup payload
    const systemInstruction = `You are an expert Instagram content planner and social media manager. 
Your job is to generate a highly detailed, extremely realistic, and visually cohesive Instagram profile mockup dataset based on a given username. 
Determine a logical theme (e.g., food, fitness, technology, travel, fashion, professional, photography, art, comedy, gaming) based on the username.
Make all fields look completely authentic. Ensure that all numbers (followers, likes, impressions, etc.) are internally consistent (e.g., reach is usually larger than likes, impressions larger than reach, engagement rate is realistic, view counts are realistic for video posts).

Provide high-quality Unsplash image URLs for the profile picture, highlights covers, and post media.
To ensure the images load beautifully, select high-quality, high-resolution aesthetic photos from Unsplash. Use this URL format:
https://images.unsplash.com/photo-[id]?w=800&auto=format&fit=crop&q=80
Where [id] is a valid aesthetic Unsplash photo ID from categories like:
- Portrait/Face: photo-1534528741775-53994a69daeb, photo-1507003211169-0a1dd7228f2d, photo-1506794778202-cad84cf45f1d, photo-1494790108377-be9c29b29330, photo-1539571696357-5a69c17a67c6
- Travel/Adventure: photo-1476514525535-07fb3b4ae5f1, photo-1507525428034-b723cf961d3e, photo-1469854523086-cc02fe5d8800
- Food: photo-1565299624946-b28f40a0ae38, photo-1482049016688-2d3e1b311543, photo-1504674900247-0877df9cc836
- Fitness: photo-1517838277536-f5f99be501cd, photo-1517838277536-f5f99be501cd, photo-1571019613454-1cb2f99b2d8b
- Technology/Desk: photo-1498050108023-c5249f4df085, photo-1488590528505-98d2b5aba04b, photo-1531297484001-80022131f5a1
- Nature/Landscape: photo-1472214222541-d510753a8707, photo-1447752875215-b2761acb3c5d, photo-1501854140801-50d01698950b

You must generate between 6 and 9 posts. Exactly 3 to 4 highlights, and 3 to 5 realistic comments per post.
Maintain strict JSON structure matching the schema.`;

    const prompt = `Generate a full, highly realistic, and visually stunning Instagram profile mockup dataset for the username: "${cleanUsername}". 
Give them a creative, fitting bio, theme-matched Unsplash photos, and realistic comments and professional insights.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        username: { type: Type.STRING },
        displayName: { type: Type.STRING },
        profilePic: { type: Type.STRING, description: "A high-quality Unsplash image URL for a portrait or fitting logo" },
        bio: { type: Type.STRING, description: "Instagram bio with relevant emojis, line breaks represented by \\n, and taglines" },
        website: { type: Type.STRING, description: "A realistic website link without http://, e.g., linktr.ee/username" },
        category: { type: Type.STRING, description: "Category name like 'Digital Creator', 'Artist', 'Chef', 'Public Figure', etc." },
        isVerified: { type: Type.BOOLEAN },
        isPrivate: { type: Type.BOOLEAN },
        followersCount: { type: Type.INTEGER, description: "Total followers as a plain number (e.g., 85400)" },
        followingCount: { type: Type.INTEGER, description: "Total following as a plain number (e.g., 412)" },
        highlights: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING, description: "Short title, e.g., 'Q&A', 'Travels', 'Recipes'" },
              cover: { type: Type.STRING, description: "Unsplash image URL for highlight circle cover" }
            },
            required: ["id", "title", "cover"]
          }
        },
        posts: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, description: "Must be one of 'image', 'video', 'carousel'" },
              mediaUrl: { type: Type.STRING, description: "Unsplash image URL matching the profile's theme" },
              caption: { type: Type.STRING, description: "Authentic caption with a few hashtags" },
              likes: { type: Type.INTEGER },
              shares: { type: Type.INTEGER },
              saves: { type: Type.INTEGER },
              views: { type: Type.INTEGER, description: "If type is video, views should be 3x to 5x of likes. If image, set to 0." },
              uploadDate: { type: Type.STRING, description: "Relative date, e.g., '2 hours ago', '3 days ago', 'October 12, 2025'" },
              location: { type: Type.STRING, description: "A matching real-world location or blank" },
              taggedUsers: { type: Type.ARRAY, items: { type: Type.STRING } },
              comments: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    username: { type: Type.STRING },
                    profilePic: { type: Type.STRING, description: "Unsplash profile pic URL for the commenter" },
                    text: { type: Type.STRING, description: "A highly realistic positive or neutral comment" },
                    likes: { type: Type.INTEGER },
                    timestamp: { type: Type.STRING, description: "e.g., '2h', '1d', '3w'" },
                    isLikedByOwner: { type: Type.BOOLEAN }
                  },
                  required: ["id", "username", "profilePic", "text", "likes", "timestamp"]
                }
              },
              insights: {
                type: Type.OBJECT,
                properties: {
                  reach: { type: Type.INTEGER, description: "Must be larger than likes + comments, e.g., 5x to 10x likes" },
                  impressions: { type: Type.INTEGER, description: "Slightly larger than reach, e.g., 1.1x to 1.3x reach" },
                  accountsEngaged: { type: Type.INTEGER, description: "Total accounts that liked, commented, saved, or shared" },
                  profileVisits: { type: Type.INTEGER },
                  follows: { type: Type.INTEGER },
                  websiteTaps: { type: Type.INTEGER },
                  shares: { type: Type.INTEGER },
                  saves: { type: Type.INTEGER },
                  watchTime: { type: Type.STRING, description: "For video only, e.g., '14h 25m'. Empty or '0s' for image." },
                  avgWatchTime: { type: Type.STRING, description: "For video only, e.g., '0:18'. Empty or '0s' for image." }
                },
                required: ["reach", "impressions", "accountsEngaged", "profileVisits", "follows", "websiteTaps", "shares", "saves", "watchTime", "avgWatchTime"]
              }
            },
            required: ["id", "type", "mediaUrl", "caption", "likes", "shares", "saves", "views", "uploadDate", "location", "taggedUsers", "comments", "insights"]
          }
        }
      },
      required: [
        "username", "displayName", "profilePic", "bio", "website", "category",
        "isVerified", "isPrivate", "followersCount", "followingCount", "highlights", "posts"
      ]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 1.0,
      }
    });

    const parsedProfile = JSON.parse(response.text || "{}");
    
    // Supplement with unique IDs if not generated or malformed
    parsedProfile.id = `import_${Date.now()}`;
    parsedProfile.projectName = `Imported @${parsedProfile.username}`;
    parsedProfile.activeTab = "posts";
    parsedProfile.taggedPosts = []; // Start empty so users can add them

    // Standardize IDs for highlights and posts
    if (parsedProfile.highlights) {
      parsedProfile.highlights = parsedProfile.highlights.map((h: any, i: number) => ({
        ...h,
        id: h.id || `highlight_${Date.now()}_${i}`
      }));
    }
    if (parsedProfile.posts) {
      parsedProfile.posts = parsedProfile.posts.map((p: any, i: number) => ({
        ...p,
        id: p.id || `post_${Date.now()}_${i}`,
        comments: (p.comments || []).map((c: any, ci: number) => ({
          ...c,
          id: c.id || `comment_${Date.now()}_${i}_${ci}`
        }))
      }));
    }

    res.json(parsedProfile);
  } catch (error: any) {
    console.error("Error importing profile via Gemini:", error);
    res.status(500).json({ 
      error: "Failed to auto-fill profile details using AI. Please try again or fill manually.",
      details: error.message
    });
  }
});

// Serve frontend assets and SPA Fallback
const startServer = async () => {
 if (process.env.NODE_ENV !== "production") {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
};

startServer();
