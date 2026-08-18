require("dotenv").config();

const express = require("express");
const { getPool, sql } = require("./src/db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

function isValidGuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

// HEALTH CHECK
app.get("/api/health", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        DB_NAME() AS databaseName,
        COUNT(*) AS decisionCount
      FROM Decisions
    `);

    res.status(200).json({
      success: true,
      message: "ClarityLoop DB API is healthy.",
      database: result.recordset[0]
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed."
    });
  }
});

// READ
app.get("/api/v1/decisions", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        DecisionId,
        Title,
        Context,
        Reasoning,
        Confidence,
        ReviewDate,
        Status,
        CreatedAt,
        UpdatedAt
      FROM Decisions
      ORDER BY CreatedAt DESC
    `);

    res.status(200).json({
      success: true,
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (error) {
    console.error("Retrieve decisions error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to retrieve decisions."
    });
  }
});

// CREATE
app.post("/api/v1/decisions", async (req, res) => {
  const {
    title,
    context,
    reasoning,
    confidence,
    reviewDate,
    options,
    selectedOption,
    tags = []
  } = req.body;

  if (!title || !context || !reasoning) {
    return res.status(400).json({
      success: false,
      message: "Title, context, and reasoning are required."
    });
  }

  if (!Number.isInteger(confidence) || confidence < 1 || confidence > 100) {
    return res.status(400).json({
      success: false,
      message: "Confidence must be an integer between 1 and 100."
    });
  }

  if (!Array.isArray(options) || options.length < 2) {
    return res.status(400).json({
      success: false,
      message: "At least two decision options are required."
    });
  }

  if (!options.includes(selectedOption)) {
    return res.status(400).json({
      success: false,
      message: "Selected option must exist in the options list."
    });
  }

  let transaction;

  try {
    const pool = await getPool();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const decisionRequest = new sql.Request(transaction);
    decisionRequest.input("Title", sql.NVarChar(120), title);
    decisionRequest.input("Context", sql.NVarChar(500), context);
    decisionRequest.input("Reasoning", sql.NVarChar(1000), reasoning);
    decisionRequest.input("Confidence", sql.TinyInt, confidence);
    decisionRequest.input("ReviewDate", sql.Date, reviewDate ? new Date(reviewDate) : null);

    const decisionResult = await decisionRequest.query(`
      INSERT INTO Decisions
      (Title, Context, Reasoning, Confidence, ReviewDate)
      OUTPUT INSERTED.DecisionId
      VALUES
      (@Title, @Context, @Reasoning, @Confidence, @ReviewDate)
    `);

    const decisionId = decisionResult.recordset[0].DecisionId;

    for (const option of options) {
      const optionRequest = new sql.Request(transaction);
      optionRequest.input("DecisionId", sql.UniqueIdentifier, decisionId);
      optionRequest.input("OptionText", sql.NVarChar(250), option);
      optionRequest.input("IsSelected", sql.Bit, option === selectedOption);

      await optionRequest.query(`
        INSERT INTO DecisionOptions (DecisionId, OptionText, IsSelected)
        VALUES (@DecisionId, @OptionText, @IsSelected)
      `);
    }

    for (const rawTag of tags) {
      const tag = String(rawTag).trim().toLowerCase();
      if (!tag) continue;

      const tagRequest = new sql.Request(transaction);
      tagRequest.input("TagName", sql.NVarChar(50), tag);

      const tagResult = await tagRequest.query(`
        IF NOT EXISTS (SELECT 1 FROM Tags WHERE TagName = @TagName)
          INSERT INTO Tags (TagName) VALUES (@TagName);

        SELECT TagId FROM Tags WHERE TagName = @TagName;
      `);

      const tagId = tagResult.recordset[0].TagId;

      const decisionTagRequest = new sql.Request(transaction);
      decisionTagRequest.input("DecisionId", sql.UniqueIdentifier, decisionId);
      decisionTagRequest.input("TagId", sql.Int, tagId);

      await decisionTagRequest.query(`
        IF NOT EXISTS (
          SELECT 1 FROM DecisionTags
          WHERE DecisionId = @DecisionId AND TagId = @TagId
        )
          INSERT INTO DecisionTags (DecisionId, TagId)
          VALUES (@DecisionId, @TagId);
      `);
    }

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "Decision created successfully.",
      data: { decisionId, title, confidence, selectedOption, tags }
    });
  } catch (error) {
    if (transaction) {
      try { await transaction.rollback(); } catch {}
    }

    console.error("Create decision error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to create decision."
    });
  }
});

// UPDATE
app.put("/api/v1/decisions/:id", async (req, res) => {
  const { id } = req.params;

  if (!isValidGuid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid decision ID."
    });
  }

  const { title, context, reasoning, confidence, reviewDate } = req.body;

  if (!title || !context || !reasoning) {
    return res.status(400).json({
      success: false,
      message: "Title, context, and reasoning are required."
    });
  }

  if (!Number.isInteger(confidence) || confidence < 1 || confidence > 100) {
    return res.status(400).json({
      success: false,
      message: "Confidence must be an integer between 1 and 100."
    });
  }

  try {
    const pool = await getPool();
    const request = pool.request();

    request.input("DecisionId", sql.UniqueIdentifier, id);
    request.input("Title", sql.NVarChar(120), title);
    request.input("Context", sql.NVarChar(500), context);
    request.input("Reasoning", sql.NVarChar(1000), reasoning);
    request.input("Confidence", sql.TinyInt, confidence);
    request.input("ReviewDate", sql.Date, reviewDate ? new Date(reviewDate) : null);

    const result = await request.query(`
      UPDATE Decisions
      SET
        Title = @Title,
        Context = @Context,
        Reasoning = @Reasoning,
        Confidence = @Confidence,
        ReviewDate = @ReviewDate,
        UpdatedAt = SYSUTCDATETIME()
      WHERE DecisionId = @DecisionId;

      SELECT
        DecisionId, Title, Context, Reasoning, Confidence,
        ReviewDate, Status, CreatedAt, UpdatedAt
      FROM Decisions
      WHERE DecisionId = @DecisionId;
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Decision not found."
      });
    }

    res.status(200).json({
      success: true,
      message: "Decision updated successfully.",
      data: result.recordset[0]
    });
  } catch (error) {
    console.error("Update decision error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to update decision."
    });
  }
});

// DELETE
app.delete("/api/v1/decisions/:id", async (req, res) => {
  const { id } = req.params;

  if (!isValidGuid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid decision ID."
    });
  }

  try {
    const pool = await getPool();
    const request = pool.request();
    request.input("DecisionId", sql.UniqueIdentifier, id);

    const result = await request.query(`
      DELETE FROM Decisions
      OUTPUT DELETED.DecisionId, DELETED.Title
      WHERE DecisionId = @DecisionId;
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Decision not found."
      });
    }

    res.status(200).json({
      success: true,
      message: "Decision deleted successfully.",
      data: result.recordset[0]
    });
  } catch (error) {
    console.error("Delete decision error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to delete decision."
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found."
  });
});

app.listen(PORT, () => {
  console.log(`ClarityLoop DB API running on http://localhost:${PORT}`);
});
