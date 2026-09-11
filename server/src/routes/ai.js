import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

export const aiRouter = Router();

aiRouter.post("/chat", async (req, res) => {
  const { message } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is missing");
  } else {
    console.log("GEMINI_API_KEY is configured");
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      console.log("No GEMINI_API_KEY provided. Using simulated response for development.");
      const mockResponse = `Namaskaram! 🌱 [SIMULATED RESPONSE]\n\nI see you asked about: "${message}". \n\nSince my AI brain (Gemini API Key) is not connected yet, here is some general advice: Make sure to check your soil moisture regularly, use organic compost where possible, and monitor your crop leaves for any early signs of yellowing or pests. \n\n(Please add a real GEMINI_API_KEY to server/.env for dynamic answers).`;
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      return res.json({ reply: mockResponse });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const systemInstruction = `You are Thatha AI, a friendly and knowledgeable agricultural assistant for AgroGon. Help farmers with crop selection, soil preparation, irrigation, fertilizers, pests, diseases, weather-related farming decisions, market information, and general agricultural questions. Give practical, easy-to-understand advice. When information is uncertain, clearly say so. Do not invent sensor readings, weather data, market prices, or diagnoses. The farmer's name is ${req.farmer?.name || 'Farmer'}.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: message,
        config: {
            systemInstruction: systemInstruction,
        }
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error("Thatha AI Error:", error);
    
    // Distinguish between different Gemini API errors
    const status = error?.status;
    const errMsg = error?.message || "";

    if (status === 401 || status === 403 || errMsg.includes("API key not valid")) {
       return res.status(500).json({ error: "Invalid Gemini API key configured." });
    }
    if (status === 429 || errMsg.includes("quota")) {
       return res.status(429).json({ error: "Gemini API quota exceeded or rate limited." });
    }
    if (status === 400 || errMsg.includes("malformed")) {
       return res.status(400).json({ error: "Malformed request to Gemini API." });
    }
    if (status >= 500 || errMsg.includes("fetch failed")) {
       return res.status(502).json({ error: "Gemini API network error." });
    }

    res.status(500).json({ error: "Failed to generate AI response" });
  }
});
