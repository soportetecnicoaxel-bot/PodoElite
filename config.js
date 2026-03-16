// config.js - VERSIÓN MEJORADA (con manejo de errores)
export const SUPABASE_URL = "https://qagxnpmztawislaehkfa.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_DB1jYqcvoeFZhulwjbRZ5Q_qSZ5dOWw";

// Verificar que Supabase está cargado
if (!window.supabase) {
    console.error("❌ La librería de Supabase no está cargada");
    throw new Error("Supabase no disponible");
}

export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);