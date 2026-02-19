import { MedicalRecordData } from "@/types";
import { extractFromImage } from './ocr';

/**
 * Principal AI Scribe Service
 * Primary: attempt backend Gemini (if available)
 * Fallback: use local OCR extraction (Tesseract.js) to avoid external billing
 */
export const processRecordAI = async (base64Image: string): Promise<MedicalRecordData> => {
  // Try calling the backend route if available
  try {
    const resp = await fetch('/api/extract-medical', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Image })
    });

    if (resp.ok) {
      const data = await resp.json();
      return data as MedicalRecordData;
    }
  } catch (err) {
    // ignore and fall back to OCR
    console.warn('Backend Gemini unavailable, falling back to local OCR', err);
  }

  // Fallback to local OCR (free, no billing)
  try {
    const ocrResult = await extractFromImage(base64Image);
    return ocrResult;
  } catch (err) {
    console.error('Gemini Extraction Error:', err);
    throw new Error('Could not process document. Ensure high lighting and clarity.');
  }
};
