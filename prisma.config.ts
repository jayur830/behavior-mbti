import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';

// .env.local (development) 우선 로드 후 .env (production) 로드
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || '',
  },
});
