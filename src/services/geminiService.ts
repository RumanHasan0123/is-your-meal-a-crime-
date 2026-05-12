import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export interface RoastVerdict {
  weirdness_score: number;
  verdict_title: string;
  roast_comment: string;
  crimes: string[];
}

export async function analyzeMeal(imageBase64: string, mimeType: string): Promise<RoastVerdict> {
  const prompt = `ACT AS: A brutally honest celebrity chef (think Gordon Ramsay but even more exhausted by mediocrity).
TASK: Analyze the food image provided.
RULES:
1. Calculate 'weirdness_score' (0-100) based on how fundamentally wrong the dish is.
2. Create a biting, sarcastic roast in 'roast_comment'.
3. List the 3 most 'criminal' ingredients or culinary failures found in 'crimes'.
4. If the image is not food, call out the user for being an idiot in the 'roast_comment' and set 'weirdness_score' to 100.
5. Create a punchy 'verdict_title' like "GUILTY AS CHARGED" or "CULINARY ABOMINATION".

OUTPUT FORMAT (STRICT JSON):
{
  "weirdness_score": number,
  "verdict_title": "string",
  "roast_comment": "string",
  "crimes": ["string", "string", "string"]
}
NO PREAMBLE. NO MARKDOWN. ONLY JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64.split(',')[1] || imageBase64,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weirdness_score: { type: Type.NUMBER },
            verdict_title: { type: Type.STRING },
            roast_comment: { type: Type.STRING },
            crimes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["weirdness_score", "verdict_title", "roast_comment", "crimes"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as RoastVerdict;
  } catch (error) {
    console.error("Error analyzing meal:", error);
    throw error;
  }
}
