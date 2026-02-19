import Tesseract from 'tesseract.js';
import { MedicalRecordData, Medication } from '@/types';

const parseVitals = (text: string) => {
  const vitals: any = {};
  const bpMatch = text.match(/(\d{2,3})\s*[\/:]\s*(\d{2,3})/);
  if (bpMatch) {
    vitals.systolic = parseInt(bpMatch[1], 10);
    vitals.diastolic = parseInt(bpMatch[2], 10);
  }
  const hrMatch = text.match(/(heart rate|hr|bpm)[:\s]*?(\d{2,3})/i) || text.match(/(\b\d{2,3}\b)\s*bpm/i);
  if (hrMatch) vitals.heart_rate = parseInt(hrMatch[2] || hrMatch[1], 10);
  const tempMatch = text.match(/temperature[:\s]*?(\d{2}\.\d|\d{2})/i) || text.match(/(\d{2}\.\d)\s*°?C/i);
  if (tempMatch) vitals.temperature = parseFloat(tempMatch[1]);
  const gluMatch = text.match(/glucose[:\s]*?(\d{2,3})/i) || text.match(/(\d{2,3})\s*mg\/?dL/i);
  if (gluMatch) vitals.glucose = parseInt(gluMatch[1], 10);
  return vitals;
};

const parseMedications = (text: string): Medication[] => {
  const meds: Medication[] = [];
  // look for lines with mg, tablet, tabs, ml
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/([A-Za-z\-\s]{3,50})[,\-\s]+(\d+\s*(mg|mcg|ml|tablet|tab|tabs)?)/i);
    if (m) {
      meds.push({ name: m[1].trim(), dosage: m[2].trim() });
    }
  }
  return meds;
};

export const extractFromImage = async (base64Image: string): Promise<MedicalRecordData> => {
  // Browser-friendly: ensure we pass a Blob (not an <img>) to Tesseract
  const dataUrl = base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`;

  const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8 = new Uint8Array(n);
    while (n--) u8[n] = bstr.charCodeAt(n);
    return new Blob([u8], { type: mime });
  };

  const blob = dataURLtoBlob(dataUrl);
  const mime = blob.type || 'image/jpeg';
  let fileOrBlob: Blob | File = blob;
  try {
    fileOrBlob = new File([blob], 'scan.jpg', { type: mime });
  } catch (e) {
    // Some environments may not support the File constructor (older browsers/tests).
    // In that case we fall back to passing the Blob directly.
    fileOrBlob = blob;
  }

  const res = await Tesseract.recognize(fileOrBlob as any, 'eng', { logger: () => undefined });
  const text = res?.data?.text || '';

  // Simple parsing heuristics
  let patient_name = 'Unknown Patient';
  const nameMatch = text.match(/Name[:\s]*([A-Za-z\s]{3,60})/i);
  if (nameMatch) patient_name = nameMatch[1].trim();
  else {
    const firstLine = text.split(/\r?\n/).find(l => l.trim().length > 3);
    if (firstLine) patient_name = firstLine.trim().slice(0, 60);
  }

  let date = new Date().toISOString().split('T')[0];
  const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})|(\d{2}\/\d{2}\/\d{4})|(\d{2}-\d{2}-\d{4})/);
  if (dateMatch) date = dateMatch[0];

  const diagnosis: string[] = [];
  const diagMatch = text.match(/diagnosis[:\s]*([A-Za-z0-9,\s]+)/i);
  if (diagMatch) diagnosis.push(...diagMatch[1].split(',').map(s => s.trim()).filter(Boolean));

  const medications = parseMedications(text);
  const vitals = parseVitals(text);

  const warnings: string[] = [];
  if (text.match(/illegible|unclear|illegible handwriting/i)) warnings.push('Handwriting Needs Review');

  return {
    patient_name,
    date,
    diagnosis: diagnosis.length ? diagnosis : ['Not specified'],
    medications,
    allergies: [],
    vitals,
    warnings,
    document_type: 'Other'
  } as unknown as MedicalRecordData;
};

export default extractFromImage;
