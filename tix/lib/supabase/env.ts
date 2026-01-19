export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      [
        "Missing Supabase environment variables.",
        "Set these in your `.env.local`:",
        "- NEXT_PUBLIC_SUPABASE_URL",
        "- NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "",
        "Tip: copy `env.local.template` -> `.env.local` and fill the values.",
      ].join("\n"),
    )
  }

  return { url, anonKey }
}


