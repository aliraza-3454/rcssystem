'use strict';
const path = require('path');
const { execFileSync } = require('child_process');
const { Sequelize } = require('sequelize');

// Read from .env
const DB_DIALECT = (process.env.DB_DIALECT || '').trim().toLowerCase();
const DB_HOST     = process.env.DB_HOST     || '127.0.0.1';
const DB_PORT_RAW = process.env.DB_PORT || '';
const DB_PORT     = Number.parseInt(DB_PORT_RAW || '1433', 10);
const DB_NAME     = process.env.DB_NAME     || 'rcs_db';
const DB_USER     = process.env.DB_USER     || 'sa';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_INSTANCE = (process.env.DB_INSTANCE || '').trim();
const HAS_EXPLICIT_PORT = DB_PORT_RAW.trim() !== '';

function hasRunningSqlServer() {
  if (process.platform !== 'win32') {
    return false;
  }

  try {
    const output = execFileSync('powershell.exe', [
      '-NoProfile',
      '-Command',
      "$svc = Get-Service -Name 'MSSQL$SQLEXPRESS','MSSQLSERVER' -ErrorAction SilentlyContinue | Where-Object { $_.Status -eq 'Running' } | Select-Object -First 1; if ($svc) { 'running' }",
    ], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    return output.trim() === 'running';
  } catch {
    return false;
  }
}

const USE_SQLITE = DB_DIALECT === 'sqlite' || (!DB_DIALECT && !hasRunningSqlServer());

const SQLITE_STORAGE = path.join(__dirname, '..', '..', 'rcs-local.sqlite');

const connectionOptions = USE_SQLITE
  ? {
      dialect: 'sqlite',
      storage: SQLITE_STORAGE,
      logging: false,
      pool: { max: 1, min: 0, acquire: 60000, idle: 10000 },
    }
  : {
      host: DB_HOST,
      port: Number.isFinite(DB_PORT) ? DB_PORT : 1433,
      dialect: 'mssql',
      dialectOptions: {
        options: {
          encrypt: false,
          trustServerCertificate: true,
          enableArithAbort: true,
          requestTimeout: 60000,
          connectTimeout: 60000,
          ...((!HAS_EXPLICIT_PORT || DB_PORT === 1433) && DB_INSTANCE ? { instanceName: DB_INSTANCE } : {}),
        },
      },
      logging: false,
      pool: { max: 10, min: 0, acquire: 60000, idle: 10000 },
    };

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, connectionOptions);

const connectDB = async () => {
  try {
    if (USE_SQLITE) {
      console.log('\n Using local SQLite database fallback...');
      console.log('   File:     ' + SQLITE_STORAGE);
      console.log('   Database: ' + DB_NAME + '\n');
    } else {
      console.log('\n Connecting to MS SQL Server Express...');
      console.log('   Host:     ' + DB_HOST);
      console.log('   Port:     ' + (Number.isFinite(DB_PORT) ? DB_PORT : '1433'));
      console.log('   Instance: ' + (((!HAS_EXPLICIT_PORT || DB_PORT === 1433) && DB_INSTANCE) ? DB_INSTANCE : '(not used)'));
      console.log('   Database: ' + DB_NAME);
      console.log('   User:     ' + DB_USER + '\n');
    }

    await sequelize.authenticate();
    console.log(USE_SQLITE ? '✅ SQLite database connected successfully.' : '✅ MS SQL Server Express connected successfully.');
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Sequelize models synced successfully.');

  } catch (error) {
    console.error('\n❌ DATABASE CONNECTION FAILED');
    console.error('   Error: ' + error.message);
    console.error('\n========================================');
    console.error('  FIX CHECKLIST:');
    console.error('========================================');
    console.error('  1. Win+R → services.msc');
    console.error('     - SQL Server (SQLEXPRESS) = RUNNING');
    console.error('     - SQL Server Browser      = RUNNING');
    console.error('  2. SQL Server Configuration Manager:');
    console.error('     - TCP/IP        = ENABLED');
    console.error('     - Named Pipes   = ENABLED');
    console.error('  3. Check backend/.env file:');
    console.error('     - DB_PASSWORD = your real sa password');
    console.error('     - DB_INSTANCE = SQLEXPRESS');
    console.error('  4. In SSMS: rcs_db database must exist');
    console.error('     Run rcs_db_setup.sql if it does not exist');
    console.error('========================================\n');
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };