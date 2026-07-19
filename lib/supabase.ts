import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Client Supabase pour l'auth, le stockage des fichiers audio/PDF et,
 * à terme, la persistance des sessions/questions/réponses/feedbacks
 * (voir lib/store.ts, qui utilise localStorage pour le MVP en attendant
 * ce branchement).
 *
 * Reste `null` tant que les variables d'environnement ne sont pas
 * définies, pour que l'app tourne sans Supabase configuré.
 */
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
