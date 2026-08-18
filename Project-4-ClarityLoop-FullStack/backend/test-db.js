const { getPool } = require("./src/db");

async function testConnection() {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        DB_NAME() AS DatabaseName,
        COUNT(*) AS DecisionCount
      FROM Decisions
    `);

    console.log(result.recordset);
    process.exit(0);
  } catch (error) {
    console.error("Database connection failed:");
    console.error(error);
    process.exit(1);
  }
}

testConnection();
