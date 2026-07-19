# Cahier des charges — Assistant de préparation d'entretiens et d'oraux

## 1. Concept

Une application qui aide à se préparer à n'importe quel oral à enjeu (entretien d'embauche, soutenance, oral d'école, jury) : l'utilisateur uploade le contexte (offre d'emploi, sujet, mémoire), l'app génère des questions probables, l'utilisateur s'entraîne à répondre (à l'écrit ou à l'oral via micro), et reçoit un retour structuré pour progresser avant le jour J.

**Proposition de valeur** : contrairement à une simple banque de questions génériques, l'app génère des questions contextualisées au document fourni, et surtout donne un retour structuré et actionnable — pas juste "bien joué", mais des axes concrets d'amélioration.

## 2. Public cible

- Candidats en recherche d'emploi préparant un entretien
- Étudiants préparant une soutenance de mémoire/thèse ou un oral d'école
- Professionnels préparant une prise de parole à enjeu (jury, pitch investisseurs)

Marché large et récurrent : chaque utilisateur a plusieurs occasions d'usage dans sa vie (pas un one-shot).

## 3. Fonctionnalités — MVP (V1)

| Fonctionnalité | Description |
|---|---|
| Upload de contexte | Offre d'emploi (texte ou PDF), sujet de soutenance, ou description libre de la situation |
| Génération de questions | L'IA (Groq/Claude) génère 8 à 12 questions probables, classées par thème (technique, comportemental, motivation) |
| Réponse à l'écrit | L'utilisateur répond par écrit à chaque question, à son rythme |
| Réponse à l'oral | Enregistrement audio via micro, transcription automatique |
| Retour structuré | Analyse par question sur 3 axes : clarté du propos, structure de la réponse, points à approfondir. Pas de note globale anxiogène, mais un retour qualitatif |
| Historique de session | Reprise d'une session en cours, consultation des sessions passées |

## 4. Fonctionnalités — V2 (post-MVP)

- Analyse du ton et du débit de parole (rythme, hésitations, mots de remplissage) sur les réponses orales
- Mode simulation chronométrée (conditions réelles d'entretien, avec enchaînement des questions sans pause)
- Questions de relance dynamiques : l'IA rebondit sur la réponse donnée, comme un vrai recruteur
- Bibliothèque de trames de réponses (méthode STAR pour le comportemental, structure SCQA pour les soutenances)
- Partage d'une session avec un mentor/coach pour retour humain complémentaire
- Mode multi-langue (entretiens en anglais notamment)

## 5. Architecture technique

**Stack** (cohérente avec l'écosystème existant) :
- Frontend : Next.js 14 (App Router), PWA
- Backend : Supabase (PostgreSQL + Auth + Storage pour les fichiers audio/PDF)
- IA génération de questions et retour : Groq API (`llama-3.3-70b-versatile`, cohérent avec l'existant)
- Transcription audio : Whisper (via Groq, qui propose une API de transcription rapide) ou API dédiée
- Hébergement : Vercel

**Modèle de données (simplifié)**

```
sessions
 - id, user_id, type (entretien/soutenance/oral), contexte_source, cree_le

questions
 - id, session_id, contenu, theme, ordre

reponses
 - id, question_id, type (ecrit/oral), contenu_texte, url_audio, transcription

feedbacks
 - id, reponse_id, clarte, structure, points_a_creuser (texte libre)
```

## 6. Design — direction visuelle

- **Ambiance** : sobre, rassurant, orienté progression plutôt que jugement — l'anxiété de préparation d'entretien ne doit pas être renforcée par une interface stressante (pas de notes chiffrées agressives, pas de rouge/vert façon "faux/vrai")
- **Palette** : bleu profond et neutre pour la confiance, un accent chaleureux (ambre doux) pour les points de progression, gris clair pour le structurel
- **Typo** : sans-serif claire et lisible pour tout le contenu (contexte de lecture rapide sous stress), pas de serif décorative ici — l'app doit inspirer clarté, pas atmosphère
- **Écrans clés** :
  1. Accueil — création de session (upload contexte) + historique des sessions passées
  2. Liste de questions générées — vue d'ensemble par thème avant de commencer
  3. Écran de réponse — question affichée, choix écrit/oral, zone de saisie ou bouton d'enregistrement
  4. Écran de feedback — les 3 axes (clarté, structure, à creuser) présentés clairement par question, navigable

## 7. Roadmap suggérée

1. **Semaine 1-2** : setup Next.js + Supabase, auth, upload de contexte
2. **Semaine 3** : intégration Groq pour génération de questions
3. **Semaine 4-5** : réponse écrite + retour structuré (boucle complète en texte d'abord)
4. **Semaine 6-7** : ajout du mode oral (enregistrement + transcription)
5. **V2** : simulation chronométrée, analyse du ton, questions de relance dynamiques

## 8. Points d'attention

- Le retour de l'IA doit être calibré pour être constructif sans être complaisant ni décourageant — c'est le cœur de la valeur perçue, à travailler particulièrement sur le prompt système
- La transcription audio doit gérer les accents et hésitations naturelles sans dénaturer le contenu de la réponse
- Prévoir un stockage audio limité dans le temps (suppression après X jours) pour maîtriser les coûts Supabase Storage et rassurer sur la confidentialité des enregistrements
- Être transparent sur le fait que les retours sont générés par IA et ne remplacent pas un vrai retour humain (coach, RH) pour les enjeux les plus importants
