declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /**
       * Prisma PostgreSQL Connection URL (Supabase Connection Pooler)
       * @example "postgresql://postgres.[REF]:[PW]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
       */
      DATABASE_URL?: string;

      /**
       * Prisma Direct Connection URL (Supabase Direct Session connection for migrations)
       * @example "postgresql://postgres.[REF]:[PW]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
       */
      DIRECT_URL?: string;

      /**
       * Supabase Project URL (e.g. "https://your-project.supabase.co")
       */
      NEXT_PUBLIC_SUPABASE_URL?: string;

      /**
       * Supabase Anonymous (public) API Key
       */
      NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;

      /**
       * Supabase Publishable (public) API Key
       */
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;

      /**
       * Node.js 실행 환경 ('development' | 'production' | 'test')
       */
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

export {};
