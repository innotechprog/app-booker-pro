/**
 * Run recruiter table migration (recruiters table for recruiter auth).
 * Usage: npm run db:migrate-recruiter
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, '../../migrations');

const IGNORABLE = ['ER_TABLE_EXISTS_ERROR', 'ER_DUP_FIELDNAME', 'ER_DUP_KEYNAME'];

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

    console.log(`\n📦 Recruiter migrations (database: ${dbName})\n`);

    const migrationFiles = [
      'recruiter_tables.sql',
      'recruiter_recruitments.sql',
      'recruiter_jobs_tables.sql',
      'recruiter_jobs_add_fields.sql',
      'recruiter_job_applications_stage.sql',
      'smart_apply_job_requirement_responsibilities.sql',
    ];
    for (const file of migrationFiles) {
      let sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
      sql = sql.replace(/^\s*--[^\n]*\n?/gm, '').trim();
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const stmt of statements) {
        try {
          await connection.query(stmt);
          console.log(`  ✅ ${file}`);
        } catch (err) {
          if (IGNORABLE.some((c) => err.code === c) || (err.message && err.message.includes('already exists'))) {
            console.log(`  ⏭️  ${file} (already applied)`);
          } else {
            console.error('  ❌', err.message);
            throw err;
          }
        }
      }
    }

    console.log('\n🎉 Recruiter migrations finished.\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

run();
