# VistoPrep

Assistant de préparation aux entretiens et oraux à enjeu (entretien d'embauche,
soutenance, oral d'école). L'utilisateur fournit le contexte, l'app génère des
questions probables, il s'entraîne à répondre à l'écrit ou à l'oral, et reçoit
un retour structuré (clarté, structure, points à approfondir) — sans note
chiffrée anxiogène.

Voir `cahier-des-charges-prep-entretiens.md` pour le brief complet.

## Stack

- **Frontend** : Next.js 14 (App Router), React, Tailwind CSS
- **Génération IA** : Groq (`llama-3.3-70b-versatile`) pour les questions et le
  feedback, Whisper (`whisper-large-v3-turbo` via Groq) pour la transcription
- **Persistance** : localStorage pour ce MVP (voir `lib/store.ts`) ; Supabase
  (Postgres + Auth + Storage) est déjà scaffoldé dans `lib/supabase.ts` pour le
  branchement V2
- **Hébergement cible** : Vercel

## État du MVP

Ce qui fonctionne de bout en bout :

- Création d'une session à partir d'un contexte collé (offre, sujet, description libre)
- Génération de 8 à 12 questions classées par thème via Groq
- Réponse écrite ou orale (enregistrement micro + transcription Whisper)
- Retour structuré par question sur 3 axes, avec un exemple de réponse solide, sans note globale
- Avis global une fois la session terminée (points forts, points de vigilance, conseil pour le jour J)
- Analyse de CV (section à part) : import PDF ou texte, conseil de présentation orale par expérience, en lien avec le contexte de la session
- Historique des sessions (persistant en local dans le navigateur)

Ce qui reste à brancher pour la mise en prod :

- Auth Supabase (actuellement pas d'auth — usage local, mono-utilisateur)
- Persistance Supabase à la place de localStorage (les fonctions dans
  `lib/store.ts` ont déjà la forme des tables du CDC : `sessions`, `questions`,
  `reponses`, `feedbacks` — il s'agit de remplacer leur corps par des appels
  `supabase.from(...)`)
- Stockage des fichiers audio dans Supabase Storage avec purge après X jours
  (cf. point d'attention confidentialité du CDC)

Fonctionnalités V2 non démarrées : simulation chronométrée, analyse du ton et
du débit, questions de relance dynamiques, trames STAR/SCQA, partage avec un
mentor, mode multi-langue.

## Setup local

```bash
npm install
cp .env.example .env.local
# renseigner GROQ_API_KEY (obligatoire pour que l'app fonctionne)
npm run dev
```

L'app tourne sans Supabase configuré (les sessions restent dans le
navigateur). `GROQ_API_KEY` est en revanche indispensable : c'est ce qui
génère les questions, le feedback, et les transcriptions.

## Structure

```
app/
  page.tsx                          accueil : création de session + historique
  session/[id]/page.tsx             vue d'ensemble des questions générées
  session/[id]/question/[qid]/      écran de réponse (écrit / oral)
  session/[id]/feedback/            écran de retour structuré
  api/questions/route.ts            génération des questions (Groq)
  api/feedback/route.ts             génération du feedback (Groq)
  api/transcribe/route.ts           transcription audio (Groq Whisper)
lib/
  groq.ts                           appels Groq côté serveur, prompts système
  store.ts                          couche de persistance (localStorage → Supabase)
  supabase.ts                       client Supabase (auth + storage)
  types.ts                          modèle de données partagé
components/
  ProgressPath.tsx                  élément signature : trajet de progression, pas de score
  AudioRecorder.tsx                 enregistrement micro + envoi à la transcription
  FeedbackPanel.tsx                 affichage des 3 axes de retour
```

## Design

Palette bleu profond (confiance) + accent ambre (progression), typographies
Sora (titres) / Inter (texte) / IBM Plex Mono (métadonnées, thèmes). Aucune
couleur rouge/vert de type validation-erreur, aucune note chiffrée : l'app est
pensée pour ne pas ajouter de stress à une situation déjà anxiogène.
