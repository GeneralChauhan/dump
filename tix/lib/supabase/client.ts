import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"
import { getSupabaseEnv } from "./env"

let client: ReturnType<typeof createSupabaseBrowserClient> | null = null

export function createClient() {
  if (client) return client

  const { url, anonKey } = getSupabaseEnv()
  client = createSupabaseBrowserClient(
    url,
    anonKey,
  )

  return client
}

export { createClient as createBrowserClient }
