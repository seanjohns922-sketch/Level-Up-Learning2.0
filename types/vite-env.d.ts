// Override ImportMeta.env for the auto-generated Vite-style Supabase client
// The actual Next.js client is in lib/supabase.ts
declare global {
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
    readonly VITE_SUPABASE_PROJECT_ID: string;
  }
}

// Augment ImportMeta to include env
declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
