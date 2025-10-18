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

async function ensureProfileRecord({ client, userId, fullName, role }) {
  if (!userId) {
    return;
  }

  const payload = { id: userId };
  if (typeof fullName === "string" && fullName.trim() !== "") {
    payload.full_name = fullName.trim();
  }
  if (typeof role === "string" && role.trim() !== "") {
    payload.role = role.trim();
  }

  const { error } = await client
    .from("profiles")
    .upsert(payload, { onConflict: "id" });

  if (error) {
    throw error;
  }
}

export async function signUp(email, password, fullName) {
  const client = ensureClient();

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "user",
      },
    },
  });

  if (error) {
    throw error;
  }

  const user = data?.user;

  if (!user) {
    throw new Error("Pendaftaran berhasil namun pengguna tidak ditemukan.");
  }

  const { data: sessionData, error: sessionError } = await client.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  const session = sessionData?.session ?? data.session ?? null;

  if (session) {
    try {
      await ensureProfileRecord({
        client,
        userId: user.id,
        fullName,
        role: "user",
      });
    } catch (profileError) {
      console.error(profileError);
      throw new Error(
        "Pendaftaran berhasil, tetapi kami gagal menyiapkan profilmu. Silakan coba login ulang."
      );
    }
  }

  return {
    user,
    session,
    requiresEmailConfirmation: !session,
  };
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

  const user = data?.user;

  if (user) {
    const fullName = user.user_metadata?.full_name;
    const role = user.user_metadata?.role;

    await ensureProfileRecord({
      client,
      userId: user.id,
      fullName,
      role,
    }).catch((profileError) => {
      console.error(profileError);
      throw new Error("Gagal memastikan profil pengguna. Coba lagi nanti.");
    });
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
