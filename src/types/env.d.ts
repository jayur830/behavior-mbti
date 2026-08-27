declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /**
       * PostgreSQL Connection URL (Pooler 또는 Session 5432)
       */
      DATABASE_URL?: string;

      /**
       * PostgreSQL Direct Connection URL (Session connection 5432)
       */
      DIRECT_URL?: string;

      /**
       * Node.js 실행 환경 ('development' | 'production' | 'test')
       */
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

export {};
