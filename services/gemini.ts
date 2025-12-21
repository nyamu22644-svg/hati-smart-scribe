import { GoogleGenerativeAI } from "@google/generative-ai";
import { MedicalRecordData } from "@/types";

// Initialize Google Generative AI client
const ai = new GoogleGenerativeAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });

/**
 * Principal AI Scribe Service
 * Extracts structured data from medical documents with handwriting illegibility detection.
 */
export const processRecordAI = async (base64Image: string): Promise<MedicalRecordData> => {
  const systemInstruction = `
    ACT AS A SENIOR MEDICAL SCRIBE. 
    Analyze the provided medical document image (could be handwritten). 
    Return a valid JSON object ONLY. 
    
    CRITICAL RULES:
    1. If handwriting is ILLEGIBLE, use "Handwriting Needs Review" as a diagnosis.
    2. CHECK INTERACTIONS: If multiple meds are found (e.g., Warfarin + Ibuprofen), add a warning.
    3. VITALS: Only include if explicitly stated in the document.
  `;

  const prompt = "Please analyze this medical document and extract structured patient data, diagnoses, medications, and vitals according to the defined schema.";

  try {
    // Get the generative model with proper configuration
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const response = await model.generateContent({
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image.split(',')[1] || base64Image,
              },
            },
            { text: `${systemInstruction}\n\n${prompt}` }
          ],
        },
      ],
    });

    // Extract the text response
    const jsonStr = response.response.text().trim();
    
    // Parse and validate the response
    const parsedData = JSON.parse(jsonStr);
    
    // Ensure all required fields exist with defaults
    return {
      patient_name: parsedData.patient_name || 'Unknown Patient',
      date: parsedData.date || new Date().toISOString().split('T')[0],
      diagnosis: Array.isArray(parsedData.diagnosis) ? parsedData.diagnosis : ['Not specified'],
      medications: Array.isArray(parsedData.medications) ? parsedData.medications : [],
      allergies: Array.isArray(parsedData.allergies) ? parsedData.allergies : [],
      vitals: {
        systolic: parsedData.vitals?.systolic || 0,
        diastolic: parsedData.vitals?.diastolic || 0,
        heartRate: parsedData.vitals?.heart_rate || parsedData.vitals?.heartRate || 0,
        temperature: parsedData.vitals?.temperature || 0,
        glucose: parsedData.vitals?.glucose || 0
      },
      warnings: Array.isArray(parsedData.warnings) ? parsedData.warnings : []
    };
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw new Error("Could not process document. Ensure high lighting and clarity.");
  }
};
