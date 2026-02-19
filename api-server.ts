import express from 'express';
// API server intentionally does not perform OCR or call Gemini to avoid external billing.
// Client-side code performs OCR locally using Tesseract when needed.
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// local OCR-based extraction (no external billing required)

// Masked key check for debugging (prints first 6 chars if present)
console.log('GEMINI_API_KEY present:', process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.slice(0,6)}...` : 'MISSING');

app.post('/api/extract-medical', async (req, res) => {
  try {
    const { base64Image } = req.body;

    if (!base64Image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // For local development this server acts as a no-op proxy. Client performs OCR locally.
    return res.status(501).json({ error: 'Server-side extraction disabled. Use client-side OCR.' });
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    res.status(500).json({ error: "Could not process document. Ensure high lighting and clarity." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
});
