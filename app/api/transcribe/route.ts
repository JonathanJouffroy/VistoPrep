import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/groq";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("audio");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Aucun fichier audio reçu." },
        { status: 400 }
      );
    }

    const transcription = await transcribeAudio(file);
    return NextResponse.json({ transcription });
  } catch (err) {
    console.error("Erreur transcription:", err);
    return NextResponse.json(
      { error: "Erreur lors de la transcription audio." },
      { status: 500 }
    );
  }
}
