import { NextRequest, NextResponse } from 'next/server';
import { MedicalRecordData } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { base64Image } = body;

    if (!base64Image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Server-side extraction disabled to avoid external billing. Use client-side OCR.
    return NextResponse.json({ error: 'Server-side extraction disabled. Use client-side OCR.' }, { status: 501 });
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    return NextResponse.json(
      { error: "Could not process document. Ensure high lighting and clarity." },
      { status: 500 }
    );
  }
}
