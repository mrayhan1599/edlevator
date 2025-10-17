import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

if (!window.supabase || typeof window.supabase.createClient !== "function") {
  console.error("Supabase library belum dimuat. Pastikan CDN @supabase/supabase-js sudah disertakan.");
}

export const supabaseClient = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

function ensureClient() {
  if (!supabaseClient) {
    throw new Error("Supabase client tidak tersedia.");
  }
  return supabaseClient;
}

export async function signUp(email, password, fullName) {
  const client = ensureClient();

  const { data, error } = await client.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  const user = data?.user;

  if (!user) {
    throw new Error("Pendaftaran berhasil namun pengguna tidak ditemukan.");
  }

  const { error: profileError } = await client
    .from("profiles")
    .upsert(
      {
        id: user.id,
        full_name: fullName,
        role: "user",
      },
      { onConflict: "id" }
    );

  if (profileError) {
    throw profileError;
  }

  return { user, session: data.session };
}

export async function signIn(email, password) {
  const client = ensureClient();

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const client = ensureClient();
  const { error } = await client.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getSession() {
  const client = ensureClient();
  const { data, error } = await client.auth.getSession();
  if (error) {
    throw error;
  }
  return data.session ?? null;
}

export async function getUserProfile(userId) {
  if (!userId) {
    return null;
  }
  const client = ensureClient();
  const { data, error } = await client
    .from("profiles")
    .select("id, full_name, role, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}

export function onAuthStateChange(callback) {
  const client = ensureClient();
  return client.auth.onAuthStateChange(callback);
}
