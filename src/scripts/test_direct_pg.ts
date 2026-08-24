import dotenv from 'dotenv';
import { Pool } from 'pg';

async function testDirectPg() {
  const envLocal = dotenv.config({ path: '.env.local', override: true }).parsed || {};
  const envProd = dotenv.config({ path: '.env', override: true }).parsed || {};

  console.log('Testing .env (Production) DIRECT connection:');
  const prodUrl = envProd.DIRECT_URL || envProd.DATABASE_URL?.replace(':6543', ':5432').replace('?pgbouncer=true&', '?').replace('?pgbouncer=true', '');
  
  if (prodUrl) {
    try {
      const pool = new Pool({ connectionString: prodUrl });
      const client = await pool.connect();
      console.log('✅ Connected to Production DB!');

      // Insert test row into persona.mbti_results
      const testId = 'test_' + Math.random().toString(36).substring(2, 12);
      await client.query(`
        INSERT INTO persona.mbti_results (id, mbti, persona_code, overall_certainty, result_data)
        VALUES ($1, $2, $3, $4, $5);
      `, [testId, 'ENTJ', 'THE_DECISIVE', 90, JSON.stringify({ test: true })]);
      console.log('✅ INSERT INTO persona.mbti_results SUCCESSFUL! id:', testId);

      // Select test row
      const res = await client.query('SELECT * FROM persona.mbti_results WHERE id = $1', [testId]);
      console.log('✅ SELECT FROM persona.mbti_results SUCCESSFUL! Row:', res.rows[0]);

      // Delete test row
      await client.query('DELETE FROM persona.mbti_results WHERE id = $1', [testId]);
      console.log('✅ DELETE FROM persona.mbti_results SUCCESSFUL!');

      client.release();
      await pool.end();
    } catch (e: any) {
      console.error('❌ Production direct PG error:', e.message);
    }
  }

  console.log('\nTesting .env.local (Development) connection:');
  const localUrl = envLocal.DIRECT_URL || envLocal.DATABASE_URL?.replace(':6543', ':5432').replace('?pgbouncer=true&', '?').replace('?pgbouncer=true', '');
  if (localUrl) {
    try {
      const pool = new Pool({ connectionString: localUrl });
      const client = await pool.connect();
      console.log('✅ Connected to Development DB!');

      // Check if schema persona exists
      await client.query('CREATE SCHEMA IF NOT EXISTS persona;');

      // Create table if not exists in persona
      await client.query(`
        CREATE TABLE IF NOT EXISTS persona.mbti_results (
          id text PRIMARY KEY,
          mbti text NOT NULL,
          persona_code text NOT NULL,
          overall_certainty int NOT NULL,
          result_data jsonb NOT NULL,
          created_at timestamptz DEFAULT now() NOT NULL
        );
      `);

      // Insert test row
      const testId = 'test_' + Math.random().toString(36).substring(2, 12);
      await client.query(`
        INSERT INTO persona.mbti_results (id, mbti, persona_code, overall_certainty, result_data)
        VALUES ($1, $2, $3, $4, $5);
      `, [testId, 'ENTJ', 'THE_DECISIVE', 90, JSON.stringify({ test: true })]);
      console.log('✅ INSERT INTO persona.mbti_results on Dev SUCCESSFUL! id:', testId);

      // Delete test row
      await client.query('DELETE FROM persona.mbti_results WHERE id = $1', [testId]);
      console.log('✅ DELETE FROM persona.mbti_results on Dev SUCCESSFUL!');

      client.release();
      await pool.end();
    } catch (e: any) {
      console.error('❌ Development PG error:', e.message);
    }
  }
}

testDirectPg();
