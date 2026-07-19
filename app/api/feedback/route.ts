import { NextRequest, NextResponse } from "next/server";
import { generateFeedback } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const { question, reponse } = (await req.json()) as {
      question: string;
      reponse: string;
    };

    if (!question || !reponse || reponse.trim().length < 5) {
      return NextResponse.json(
        { error: "Réponse trop courte pour générer un retour utile." },
        { status: 400 }
      );
    }

    const feedback = await generateFeedback(question, reponse);
    return NextResponse.json({ feedback });
  } catch (err) {
    console.error("Erreur génération feedback:", err);
    return NextResponse.json(
      { error: "Erreur lors de la génération du retour." },
      { status: 500 }
    );
  }
}
