import express from 'express';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Lazy loader for Gemini
let aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

router.post('/', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file received' });
    }

    const base64Audio = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype || 'audio/webm';

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ error: 'Gemini API client not configured' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
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
    const parts = text.split("LANGUAGE:");
    const transcriptPart = parts[0] || "";
    const languagePart = parts[1] || "unknown";

    res.json({
      transcript: transcriptPart.trim(),
      detectedLanguage: languagePart.trim(),
    });
  } catch (err) {
    console.error('Transcription error:', err);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

export default router;
