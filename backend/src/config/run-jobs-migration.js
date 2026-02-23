/**
 * Create or ensure the main jobs table exists with required columns.
 * Usage: npm run db:migrate-jobs
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

    console.log(`\n📦 Jobs table migration (database: ${dbName})\n`);

    let sql = readFileSync(join(MIGRATIONS_DIR, 'jobs_table.sql'), 'utf8');
    sql = sql.replace(/^\s*--[^\n]*\n?/gm, '').trim();
    const statements = sql.split(';').map((s) => s.trim()).filter((s) => s.length > 0);

    for (const stmt of statements) {
      try {
        await connection.query(stmt);
        console.log('  ✅ jobs_table.sql');
      } catch (err) {
        if (IGNORABLE.some((c) => err.code === c) || (err.message && err.message.includes('already exists'))) {
          console.log('  ⏭️  Jobs table already exists.');
        } else {
          console.error('  ❌', err.message);
          throw err;
        }
      }
    }

    console.log('\n🎉 Jobs migration finished.\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

run();
