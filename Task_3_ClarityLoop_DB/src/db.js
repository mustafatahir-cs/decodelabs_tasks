require("dotenv").config();

const sql = require("mssql/msnodesqlv8");

const connectionString =
  process.env.DB_CONNECTION_STRING ||
  "Driver={ODBC Driver 18 for SQL Server};" +
  "Server=localhost;" +
  "Database=ClarityLoopDB;" +
  "Trusted_Connection=Yes;" +
  "Encrypt=Optional;";

const config = {
  connectionString,
  connectionTimeout: 5000,
  requestTimeout: 15000,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool;

async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
    console.log("Connected to ClarityLoopDB successfully.");
  }
  return pool;
}

module.exports = { sql, getPool };
