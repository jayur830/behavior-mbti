import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';

// 환경변수에 이미 DATABASE_URL이 지정되어 있지 않은 경우에만 로드
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: '.env.local' });
  dotenv.config({ path: '.env' });
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || '',
  },
});
