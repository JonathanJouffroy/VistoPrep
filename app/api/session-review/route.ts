import { NextRequest, NextResponse } from "next/server";
import { generateSessionReview } from "@/lib/groq";
import { SessionType } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { type, items } = (await req.json()) as {
      type: SessionType;
      items: { question: string; reponse: string }[];
    };

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Aucune réponse à analyser." },
        { status: 400 }
      );
    }

    const review = await generateSessionReview(type, items);
    return NextResponse.json({ review });
  } catch (err) {
    console.error("Erreur génération avis global:", err);
    return NextResponse.json(
      { error: "Erreur lors de la génération de l'avis global." },
      { status: 500 }
    );
  }
}
