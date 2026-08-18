require("dotenv").config();

const express = require("express");
const { getPool, sql } = require("./src/db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "1mb" }));

// CORS for the Vite frontend. Set CORS_ORIGIN=* for temporary testing,
// or provide a comma-separated list of allowed origins in .env.
const allowedOrigins = String(
  process.env.CORS_ORIGIN ||
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173"
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (
    origin &&
    (allowedOrigins.includes("*") || allowedOrigins.includes(origin))
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,Accept"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

function isValidGuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "")
  );
}

function normalizeOptions(options) {
  if (!Array.isArray(options)) return [];

  return [
    ...new Set(
      options
        .map((option) => {
          if (typeof option === "string") return option.trim();
          if (option && typeof option === "object") {
            return String(
              option.label ?? option.text ?? option.OptionText ?? ""
            ).trim();
          }
          return "";
        })
        .filter(Boolean)
    )
  ];
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];

  return [
    ...new Set(
      tags
        .map((tag) =>
          typeof tag === "string"
            ? tag.trim().toLowerCase()
            : String(tag?.name ?? tag?.label ?? tag?.TagName ?? "")
                .trim()
                .toLowerCase()
        )
        .filter(Boolean)
    )
  ];
}

function normalizeStatus(value) {
  return String(value || "").toLowerCase() === "reviewed"
    ? "reviewed"
    : "pending-review";
}

function validateDecisionPayload(body) {
  const {
    title,
    context,
    reasoning,
    confidence,
    selectedOption
  } = body;

  const options = normalizeOptions(body.options);

  const cleanTitle = String(title || "").trim();
  const cleanContext = String(context || "").trim();
  const cleanReasoning = String(reasoning || "").trim();

  if (!cleanTitle) return "Title is required.";
  if (cleanTitle.length > 120) return "Title must be 120 characters or fewer.";

  if (!cleanContext) return "Context is required.";
  if (cleanContext.length > 500) return "Context must be 500 characters or fewer.";

  if (!cleanReasoning) return "Reasoning is required.";
  if (cleanReasoning.length > 1000) return "Reasoning must be 1000 characters or fewer.";

  if (!Number.isInteger(confidence) || confidence < 1 || confidence > 100) {
    return "Confidence must be an integer between 1 and 100.";
  }

  if (options.length < 2) {
    return "At least two unique decision options are required.";
  }

  if (options.some((option) => option.length > 250)) {
    return "Each decision option must be 250 characters or fewer.";
  }

  const tags = normalizeTags(body.tags);
  if (tags.some((tag) => tag.length > 50)) {
    return "Each tag must be 50 characters or fewer.";
  }

  if (!selectedOption || !options.includes(String(selectedOption).trim())) {
    return "Selected option must exist in the options list.";
  }

  return null;
}

async function insertDecisionOptions(transaction, decisionId, options, selectedOption) {
  for (const option of options) {
    const request = new sql.Request(transaction);
    request.input("DecisionId", sql.UniqueIdentifier, decisionId);
    request.input("OptionText", sql.NVarChar(250), option);
    request.input("IsSelected", sql.Bit, option === selectedOption);

    await request.query(`
      INSERT INTO DecisionOptions (DecisionId, OptionText, IsSelected)
      VALUES (@DecisionId, @OptionText, @IsSelected);
    `);
  }
}

async function insertDecisionTags(transaction, decisionId, tags) {
  for (const tag of tags) {
    const tagRequest = new sql.Request(transaction);
    tagRequest.input("TagName", sql.NVarChar(50), tag);

    const tagResult = await tagRequest.query(`
      IF NOT EXISTS (SELECT 1 FROM Tags WHERE TagName = @TagName)
        INSERT INTO Tags (TagName) VALUES (@TagName);

      SELECT TagId FROM Tags WHERE TagName = @TagName;
    `);

    const tagId = tagResult.recordset[0].TagId;

    const linkRequest = new sql.Request(transaction);
    linkRequest.input("DecisionId", sql.UniqueIdentifier, decisionId);
    linkRequest.input("TagId", sql.Int, tagId);

    await linkRequest.query(`
      IF NOT EXISTS (
        SELECT 1
        FROM DecisionTags
        WHERE DecisionId = @DecisionId
          AND TagId = @TagId
      )
        INSERT INTO DecisionTags (DecisionId, TagId)
        VALUES (@DecisionId, @TagId);
    `);
  }
}

async function loadDecisionGraph(pool, decisionId = null) {
  const decisionRequest = pool.request();

  let whereClause = "";
  if (decisionId) {
    decisionRequest.input("DecisionId", sql.UniqueIdentifier, decisionId);
    whereClause = "WHERE DecisionId = @DecisionId";
  }

  const decisionsResult = await decisionRequest.query(`
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
    ${whereClause}
    ORDER BY CreatedAt DESC;
  `);

  const rows = decisionsResult.recordset;
  if (!rows.length) return [];

  const [optionsResult, tagsResult, reviewsResult] = await Promise.all([
    pool.request().query(`
      SELECT
        OptionId,
        DecisionId,
        OptionText,
        IsSelected,
        CreatedAt
      FROM DecisionOptions
      ORDER BY CreatedAt ASC;
    `),
    pool.request().query(`
      SELECT
        dt.DecisionId,
        t.TagId,
        t.TagName
      FROM DecisionTags dt
      INNER JOIN Tags t ON t.TagId = dt.TagId
      ORDER BY t.TagName ASC;
    `),
    pool.request().query(`
      SELECT
        ReviewId,
        DecisionId,
        Outcome,
        ActualOutcome,
        LessonLearned,
        OutcomeScore,
        ReviewedAt
      FROM Reviews;
    `)
  ]);

  const optionsByDecision = new Map();
  for (const option of optionsResult.recordset) {
    const key = String(option.DecisionId);
    if (!optionsByDecision.has(key)) optionsByDecision.set(key, []);
    optionsByDecision.get(key).push({
      id: String(option.OptionId),
      label: option.OptionText,
      isSelected: Boolean(option.IsSelected)
    });
  }

  const tagsByDecision = new Map();
  for (const tag of tagsResult.recordset) {
    const key = String(tag.DecisionId);
    if (!tagsByDecision.has(key)) tagsByDecision.set(key, []);
    tagsByDecision.get(key).push(tag.TagName);
  }

  const reviewByDecision = new Map();
  for (const review of reviewsResult.recordset) {
    reviewByDecision.set(String(review.DecisionId), {
      id: String(review.ReviewId),
      outcome: review.Outcome,
      actualOutcome: review.ActualOutcome,
      lessonLearned: review.LessonLearned,
      outcomeScore: review.OutcomeScore,
      reviewedAt: review.ReviewedAt
    });
  }

  return rows.map((row) => {
    const key = String(row.DecisionId);
    const options = optionsByDecision.get(key) || [];
    const selected = options.find((option) => option.isSelected);

    return {
      id: key,
      decisionId: key,
      title: row.Title,
      context: row.Context,
      reasoning: row.Reasoning,
      confidence: Number(row.Confidence),
      reviewDate: row.ReviewDate,
      reviewStatus: row.Status === "reviewed" ? "reviewed" : "pending",
      status: row.Status,
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt,
      options,
      selectedOption: selected?.label || "",
      tags: tagsByDecision.get(key) || [],
      review: reviewByDecision.get(key) || null
    };
  });
}

// HEALTH CHECK
app.get("/api/health", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        DB_NAME() AS databaseName,
        COUNT(*) AS decisionCount
      FROM Decisions;
    `);

    res.status(200).json({
      success: true,
      message: "ClarityLoop DB API is healthy.",
      database: result.recordset[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed."
    });
  }
});

// READ ALL
app.get("/api/v1/decisions", async (req, res) => {
  try {
    const pool = await getPool();
    const decisions = await loadDecisionGraph(pool);

    res.status(200).json({
      success: true,
      count: decisions.length,
      data: decisions
    });
  } catch (error) {
    console.error("Retrieve decisions error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to retrieve decisions."
    });
  }
});

// READ ONE
app.get("/api/v1/decisions/:id", async (req, res) => {
  const { id } = req.params;

  if (!isValidGuid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid decision ID."
    });
  }

  try {
    const pool = await getPool();
    const decisions = await loadDecisionGraph(pool, id);

    if (!decisions.length) {
      return res.status(404).json({
        success: false,
        message: "Decision not found."
      });
    }

    res.status(200).json({
      success: true,
      data: decisions[0]
    });
  } catch (error) {
    console.error("Retrieve decision error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to retrieve decision."
    });
  }
});

// CREATE
app.post("/api/v1/decisions", async (req, res) => {
  const validationError = validateDecisionPayload(req.body);
  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError
    });
  }

  const {
    title,
    context,
    reasoning,
    confidence,
    reviewDate
  } = req.body;

  const options = normalizeOptions(req.body.options);
  const selectedOption = String(req.body.selectedOption).trim();
  const tags = normalizeTags(req.body.tags);
  const status = normalizeStatus(req.body.reviewStatus ?? req.body.status);

  let transaction;

  try {
    const pool = await getPool();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const request = new sql.Request(transaction);
    request.input("Title", sql.NVarChar(120), String(title).trim());
    request.input("Context", sql.NVarChar(500), String(context).trim());
    request.input("Reasoning", sql.NVarChar(1000), String(reasoning).trim());
    request.input("Confidence", sql.TinyInt, confidence);
    request.input("ReviewDate", sql.Date, reviewDate ? new Date(reviewDate) : null);
    request.input("Status", sql.NVarChar(20), status);

    const result = await request.query(`
      INSERT INTO Decisions
        (Title, Context, Reasoning, Confidence, ReviewDate, Status)
      OUTPUT INSERTED.DecisionId
      VALUES
        (@Title, @Context, @Reasoning, @Confidence, @ReviewDate, @Status);
    `);

    const decisionId = result.recordset[0].DecisionId;

    await insertDecisionOptions(
      transaction,
      decisionId,
      options,
      selectedOption
    );
    await insertDecisionTags(transaction, decisionId, tags);

    await transaction.commit();

    const [created] = await loadDecisionGraph(pool, decisionId);

    res.status(201).json({
      success: true,
      message: "Decision created successfully.",
      data: created
    });
  } catch (error) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch {}
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

  const validationError = validateDecisionPayload(req.body);
  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError
    });
  }

  const {
    title,
    context,
    reasoning,
    confidence,
    reviewDate
  } = req.body;

  const options = normalizeOptions(req.body.options);
  const selectedOption = String(req.body.selectedOption).trim();
  const tags = normalizeTags(req.body.tags);
  const status = normalizeStatus(req.body.reviewStatus ?? req.body.status);

  let transaction;

  try {
    const pool = await getPool();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const updateRequest = new sql.Request(transaction);
    updateRequest.input("DecisionId", sql.UniqueIdentifier, id);
    updateRequest.input("Title", sql.NVarChar(120), String(title).trim());
    updateRequest.input("Context", sql.NVarChar(500), String(context).trim());
    updateRequest.input("Reasoning", sql.NVarChar(1000), String(reasoning).trim());
    updateRequest.input("Confidence", sql.TinyInt, confidence);
    updateRequest.input("ReviewDate", sql.Date, reviewDate ? new Date(reviewDate) : null);
    updateRequest.input("Status", sql.NVarChar(20), status);

    const updateResult = await updateRequest.query(`
      UPDATE Decisions
      SET
        Title = @Title,
        Context = @Context,
        Reasoning = @Reasoning,
        Confidence = @Confidence,
        ReviewDate = @ReviewDate,
        Status = @Status,
        UpdatedAt = SYSUTCDATETIME()
      WHERE DecisionId = @DecisionId;

      SELECT @@ROWCOUNT AS affected;
    `);

    if (!updateResult.recordset[0]?.affected) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Decision not found."
      });
    }

    const clearRequest = new sql.Request(transaction);
    clearRequest.input("DecisionId", sql.UniqueIdentifier, id);
    await clearRequest.query(`
      DELETE FROM DecisionTags WHERE DecisionId = @DecisionId;
      DELETE FROM DecisionOptions WHERE DecisionId = @DecisionId;
    `);

    await insertDecisionOptions(
      transaction,
      id,
      options,
      selectedOption
    );
    await insertDecisionTags(transaction, id, tags);

    await transaction.commit();

    const [updated] = await loadDecisionGraph(pool, id);

    res.status(200).json({
      success: true,
      message: "Decision updated successfully.",
      data: updated
    });
  } catch (error) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch {}
    }

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
      OUTPUT
        DELETED.DecisionId,
        DELETED.Title
      WHERE DecisionId = @DecisionId;
    `);

    if (!result.recordset.length) {
      return res.status(404).json({
        success: false,
        message: "Decision not found."
      });
    }

    res.status(200).json({
      success: true,
      message: "Decision deleted successfully.",
      data: {
        id: String(result.recordset[0].DecisionId),
        title: result.recordset[0].Title
      }
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
