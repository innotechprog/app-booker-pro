/**
 * Run normalized recruiter schema: table_id as CHAR(36) UUID PK (no generic id).
 * DESTRUCTIVE: drops and recreates recruiters, recruiter_jobs, recruiter_job_applications,
 * smart_apply_job_requirement, smart_apply_job_responsibilities. Run only when you can reset recruiter data.
 * Usage: npm run db:migrate-recruiter-normalized
 */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, '../../migrations');

async function run() {
  const dbName = process.env.DB_NAME || 'app_booker_pro';
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: dbName,
      port: Number(process.env.DB_PORT) || 3306,
      multipleStatements: true,
    });

    console.log(`\n📦 Recruiter NORMALIZED migration (database: ${dbName})`);
    console.log('⚠️  This will DROP and recreate recruiter tables. Data will be lost.\n');

    let sql = readFileSync(join(MIGRATIONS_DIR, 'recruiter_tables_normalized.sql'), 'utf8');
    sql = sql.replace(/^\s*--[^\n]*\n?/gm, '').trim();
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      await connection.query(stmt);
      if (stmt.toUpperCase().startsWith('CREATE TABLE')) {
        const m = stmt.match(/CREATE TABLE (\w+)/);
        console.log(`  ✅ ${m ? m[1] : 'table'}`);
      }
    }

    console.log('\n🎉 Normalized recruiter migrations finished.\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

run();
