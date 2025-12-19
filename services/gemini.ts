
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MedicalRecordData } from "@/types";

// Correct: Initialize ai client at the top level using process.env.API_KEY
const ai = new GoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || "" });

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
    const response: GenerateContentResponse = await ai.models.generateContent({
      // Correct: Use gemini-3-pro-preview for complex reasoning and multimodal tasks
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image.split(',')[1] || base64Image,
            },
          },
          { text: prompt }
        ],
      },
      config: {
        // Correct: System instruction placed in config
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            patient_name: { type: Type.STRING },
            date: { type: Type.STRING, description: 'Format: YYYY-MM-DD' },
            diagnosis: { type: Type.ARRAY, items: { type: Type.STRING } },
            medications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  dosage: { type: Type.STRING }
                },
                propertyOrdering: ["name", "dosage"]
              }
            },
            vitals: {
              type: Type.OBJECT,
              properties: {
                systolic: { type: Type.NUMBER, description: 'mmHg' },
                diastolic: { type: Type.NUMBER, description: 'mmHg' },
                heart_rate: { type: Type.NUMBER, description: 'bpm' },
                temperature: { type: Type.NUMBER, description: 'Celsius' },
                glucose: { type: Type.NUMBER, description: 'mg/dL' }
              },
              propertyOrdering: ["systolic", "diastolic", "heart_rate", "temperature", "glucose"]
            },
            warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
            document_type: { 
              type: Type.STRING, 
              description: 'The type of medical document: Prescription, Lab Report, Imaging, Summary, or Other'
            }
          },
          required: ["patient_name", "date", "diagnosis", "medications", "vitals", "warnings", "document_type"],
          propertyOrdering: ["patient_name", "date", "diagnosis", "medications", "vitals", "warnings", "document_type"]
        }
      }
    });

    // Correct: Directly access .text property from GenerateContentResponse
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw new Error("Could not process document. Ensure high lighting and clarity.");
  }
};
