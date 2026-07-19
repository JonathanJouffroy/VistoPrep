import { NextRequest, NextResponse } from "next/server";
import { generateQuestions } from "@/lib/groq";
import { SessionType } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { type, contexte } = (await req.json()) as {
      type: SessionType;
      contexte: string;
    };

    if (!contexte || contexte.trim().length < 10) {
      return NextResponse.json(
        { error: "Le contexte fourni est trop court pour générer des questions pertinentes." },
        { status: 400 }
      );
    }

    const questions = await generateQuestions(type, contexte);

    if (questions.length === 0) {
      return NextResponse.json(
        { error: "La génération n'a renvoyé aucune question. Réessaie avec un contexte plus détaillé." },
        { status: 502 }
      );
    }

    return NextResponse.json({ questions });
  } catch (err) {
    console.error("Erreur génération questions:", err);
    return NextResponse.json(
      { error: "Erreur lors de la génération des questions." },
      { status: 500 }
    );
  }
}
