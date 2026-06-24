/**
 * initDb.js — utilitário manual para inicializar o banco fora do Docker.
 *
 * Dentro do Docker, o PostgreSQL já executa schema.sql e seeds.sql
 * automaticamente via /docker-entrypoint-initdb.d/.
 *
 * Use este script apenas se quiser resetar o banco manualmente:
 *   npm run db:init
 */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../..', '.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function init() {
  const schemaPath = path.join(__dirname, '../../databse/schema.sql');
  const seedsPath  = path.join(__dirname, '../../databse/seeds.sql');

  console.log('Connecting to database...');

  console.log('Running schema.sql...');
  await pool.query(fs.readFileSync(schemaPath, 'utf8'));
  console.log('Schema applied.');

  console.log('Running seeds.sql...');
  await pool.query(fs.readFileSync(seedsPath, 'utf8'));
  console.log('Seeds inserted.');

  await pool.end();
  console.log('Done.');
}

init().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
