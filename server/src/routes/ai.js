import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import { db } from "../db.js";

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
      console.log("No GEMINI_API_KEY provided. Using offline smart fallback engine.");
      
      const msg = message.toLowerCase();
      let reply = "";

      if (msg.includes("hi") || msg.includes("hello") || msg.includes("namaste") || msg.includes("namaskaram")) {
        reply = `Namaskaram ${req.farmer?.name || ''}! 🌱 I am Thatha AI (running in offline fallback mode). How can I help you with your farm today?`;
      } else if (msg.includes("fertilizer") || msg.includes("npk") || msg.includes("urea")) {
        reply = "For fertilizers, it is always best to test your soil first. Generally, Urea is good for Nitrogen, DAP for Phosphorus, and MOP for Potassium. You can use the Fertilizer Calculator in the sidebar to get exact quantities based on your crop and land area!";
      } else if (msg.includes("disease") || msg.includes("pest") || msg.includes("yellow") || msg.includes("spots")) {
        reply = "It sounds like your crop might be facing a pest or disease issue. If leaves are turning yellow, it could be a Nitrogen deficiency or a viral infection. You can upload a photo of the affected leaf in the 'Disease Detector' tool for a detailed analysis.";
      } else if (msg.includes("soil") || msg.includes("ph")) {
        reply = "A good soil pH for most crops is between 6.0 and 7.0. If your soil is too acidic (low pH), you can add agricultural lime. If it's too alkaline (high pH), you can add sulfur or organic compost. You can generate a full Soil Report in the Soil Fertility section.";
      } else if (msg.includes("weather") || msg.includes("rain") || msg.includes("water") || msg.includes("irrigation")) {
        reply = "Checking the local weather is crucial for irrigation planning. It's best to water your crops early in the morning or late in the evening to reduce evaporation. Check the Weather Dashboard to see if rain is expected in the next few days.";
      } else if (msg.includes("crop") || msg.includes("recommend") || msg.includes("grow")) {
        reply = "Choosing the right crop depends heavily on your soil type and current season. Cash crops like Tomato or Cotton need good irrigation, while crops like Millets are drought-resistant. Use our 'Crop Recommendation' tool to find the best match for your soil.";
      } else {
        reply = `I see you are asking about: "${message}".\n\n*(Note: I am currently running in offline fallback mode because no GEMINI_API_KEY is configured. Please provide an API key for dynamic AI responses, or ask me specific keywords like 'fertilizer', 'disease', 'soil', 'weather', or 'crop' for offline tips!)*`;
      }

      // Simulate network delay to feel like a real AI
      await new Promise(resolve => setTimeout(resolve, 800));
      return res.json({ reply });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Fetch contextual data for the farmer
    const latestSoil = db.prepare("SELECT * FROM soil_tests WHERE farmer_id = ? ORDER BY created_at DESC LIMIT 1").get(req.farmer.id);
    const latestScan = db.prepare("SELECT * FROM disease_scans WHERE farmer_id = ? AND status = 'complete' ORDER BY created_at DESC LIMIT 1").get(req.farmer.id);
    const latestCropRec = db.prepare("SELECT * FROM crop_recommendations WHERE farmer_id = ? ORDER BY created_at DESC LIMIT 1").get(req.farmer.id);
    const latestFertilizer = db.prepare("SELECT * FROM fertilizer_plans WHERE farmer_id = ? ORDER BY created_at DESC LIMIT 1").get(req.farmer.id);
    const latestPesticide = db.prepare("SELECT * FROM pesticide_calculations WHERE farmer_id = ? ORDER BY created_at DESC LIMIT 1").get(req.farmer.id);
    const pendingTasks = db.prepare("SELECT * FROM crop_calendar_events WHERE farmer_id = ? AND status = 'pending' ORDER BY event_date ASC LIMIT 3").all(req.farmer.id);
    
    let contextStr = "";
    if (latestSoil) {
        contextStr += `\nLatest Soil Test: Crop=${latestSoil.crop}, pH=${latestSoil.ph}, N=${latestSoil.nitrogen}, P=${latestSoil.phosphorus}, K=${latestSoil.potassium}, Score=${latestSoil.fertility_score}/100.`;
    }
    if (latestScan) {
        contextStr += `\nLatest Disease Scan: Crop=${latestScan.crop}, Possible Disease=${latestScan.possible_disease}, Severity=${latestScan.severity}, Confidence=${latestScan.confidence}%.`;
    }
    if (latestCropRec) {
        let recData = {};
        try { recData = JSON.parse(latestCropRec.recommendation_json || "{}"); } catch(e){}
        contextStr += `\nRecent AI Crop Recommendation: Top Matches=${recData.recommendations?.slice(0,2)?.map(r => r.crop).join(', ') || 'None'}.`;
    }
    if (latestFertilizer) {
        let recData = {};
        try { recData = JSON.parse(latestFertilizer.recommendation_json || "{}"); } catch(e){}
        contextStr += `\nRecent Fertilizer Calc: Crop=${latestFertilizer.crop}, Area=${latestFertilizer.area_acres} acres, Total NPK Req=N:${latestFertilizer.n_req} P:${latestFertilizer.p_req} K:${latestFertilizer.k_req}.`;
    }
    if (latestPesticide) {
        contextStr += `\nRecent Pesticide Calc: Crop=${latestPesticide.crop}, Pest=${latestPesticide.pest}, Product=${latestPesticide.product}, Tanks=${latestPesticide.num_tanks}, Product/Tank=${latestPesticide.product_per_tank}.`;
    }
    if (pendingTasks && pendingTasks.length > 0) {
        const tasksStr = pendingTasks.map(t => `${t.title} (${t.event_date})`).join(", ");
        contextStr += `\nUpcoming Farm Tasks: ${tasksStr}.`;
    }

    const systemInstruction = `You are Thatha AI, a friendly and knowledgeable agricultural assistant for AgroGon. Help farmers with crop selection, soil preparation, irrigation, fertilizers, pesticide calibration, nutrient deficiencies, pests, diseases, weather-related farming decisions, market information, and general agricultural questions. Give practical, easy-to-understand advice. When information is uncertain, clearly say so. Do not invent sensor readings, weather data, market prices, or diagnoses. Use the farmer's specific farm data (soil test scores, crop, land area, upcoming tasks, recent calculations) when answering questions like "What fertilizer should I use?" or "What should I do today?". The farmer's name is ${req.farmer?.name || 'Farmer'}. Context Data: ${contextStr}`;

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
