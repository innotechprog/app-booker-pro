/**
 * Run Smart Apply database migrations to create/update tables.
 * Safe to run multiple times (skips duplicate column/table errors).
 *
 * Usage: npm run db:migrate-smart-apply
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const MIGRATIONS_DIR = join(__dirname, '../../migrations');

const SMART_APPLY_MIGRATIONS = [
  'smart_apply_tables.sql',
  'smart_apply_add_date_of_birth.sql',
  'smart_apply_add_primary_cv_id.sql',
  'smart_apply_add_personal_fields.sql',
  'smart_apply_addresses_table.sql',
  'smart_apply_add_cvs_table.sql',
  'smart_apply_add_profile_picture.sql',
  'smart_apply_premium.sql',
];

// Errors we can ignore when re-running (already applied)
const IGNORABLE = [
  'ER_DUP_FIELDNAME',   // column already exists
  'ER_DUP_KEYNAME',     // index already exists
  'ER_TABLE_EXISTS_ERROR',
];

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

    console.log(`\n📦 Smart Apply migrations (database: ${dbName})\n`);

    for (const file of SMART_APPLY_MIGRATIONS) {
      const path = join(MIGRATIONS_DIR, file);
      try {
        const sql = readFileSync(path, 'utf8');
        if (!sql.trim()) continue;
        await connection.query(sql);
        console.log(`  ✅ ${file}`);
      } catch (err) {
        if (IGNORABLE.some((c) => err.code === c || (err.message && err.message.includes('Duplicate')))) {
          console.log(`  ⏭️  ${file} (already applied)`);
        } else {
          console.error(`  ❌ ${file}:`, err.message);
          throw err;
        }
      }
    }

    console.log('\n🎉 Smart Apply migrations finished.\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

run();
