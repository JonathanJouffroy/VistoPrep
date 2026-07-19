import { NextRequest, NextResponse } from "next/server";
import { generateCVAnalysis } from "@/lib/groq";
import { SessionType } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const type = formData.get("type") as SessionType | null;
    const contexte = (formData.get("contexte") as string | null) ?? "";
    const cvTexteColle = (formData.get("cvTexte") as string | null) ?? "";
    const file = formData.get("file");

    let cvTexte = cvTexteColle.trim();

    if (!cvTexte && file instanceof File) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const isPdf =
        file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

      if (isPdf) {
        // Import direct du sous-module pour éviter le mode debug de
        // pdf-parse, qui tente sinon de lire un fichier de test au chargement.
        const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
        const parsed = await pdfParse(buffer);
        cvTexte = parsed.text.trim();
      } else {
        cvTexte = buffer.toString("utf-8").trim();
      }
    }

    if (!type) {
      return NextResponse.json({ error: "Type de session manquant." }, { status: 400 });
    }

    if (!cvTexte || cvTexte.length < 30) {
      return NextResponse.json(
        {
          error:
            "Le CV n'a pas pu être lu ou semble vide. Essaie un autre fichier, ou colle le texte directement.",
        },
        { status: 400 }
      );
    }

    const analysis = await generateCVAnalysis(type, contexte, cvTexte);
    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("Erreur analyse CV:", err);
    return NextResponse.json(
      { error: "Erreur lors de l'analyse du CV." },
      { status: 500 }
    );
  }
}
