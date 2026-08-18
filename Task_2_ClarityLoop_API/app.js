const express = require("express");
const {
  readDecisions,
  writeDecisions,
  validateDecision,
  validateReview,
  calculateInsights,
  filterDecisions
} = require("./src/decisionService");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    name: "ClarityLoop Decision Journal API",
    project: "DecodeLabs Full Stack Development - Project 2",
    version: "1.0.0"
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ClarityLoop API is healthy.",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/v1/decisions", (req, res) => {
  const decisions = readDecisions();
  const filtered = filterDecisions(decisions, req.query);

  res.status(200).json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

app.get("/api/v1/decisions/:id", (req, res) => {
  const decisions = readDecisions();
  const decision = decisions.find((item) => item.id === req.params.id);

  if (!decision) {
    return res.status(404).json({
      success: false,
      message: "Decision not found."
    });
  }

  res.status(200).json({
    success: true,
    data: decision
  });
});

app.post("/api/v1/decisions", (req, res) => {
  const validation = validateDecision(req.body);

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.message
    });
  }

  const decisions = readDecisions();
  const now = new Date().toISOString();

  const decision = {
    id: `dec_${Date.now()}`,
    title: req.body.title.trim(),
    category: req.body.category.trim().toLowerCase(),
    context: req.body.context.trim(),
    options: req.body.options,
    selectedOption: req.body.selectedOption,
    reasoning: req.body.reasoning.trim(),
    confidence: req.body.confidence,
    createdAt: now,
    review: null
  };

  decisions.push(decision);
  writeDecisions(decisions);

  res.status(201).json({
    success: true,
    message: "Decision recorded successfully.",
    data: decision
  });
});

app.post("/api/v1/decisions/:id/review", (req, res) => {
  const validation = validateReview(req.body);

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.message
    });
  }

  const decisions = readDecisions();
  const index = decisions.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Decision not found."
    });
  }

  const review = {
    outcome: req.body.outcome,
    outcomeScore: req.body.outcomeScore,
    actualOutcome: req.body.actualOutcome.trim(),
    lessonLearned: req.body.lessonLearned.trim(),
    reviewedAt: new Date().toISOString()
  };

  decisions[index].review = review;
  writeDecisions(decisions);

  res.status(200).json({
    success: true,
    message: "Outcome review added successfully.",
    data: decisions[index]
  });
});

app.get("/api/v1/insights", (req, res) => {
  const decisions = readDecisions();

  res.status(200).json({
    success: true,
    data: calculateInsights(decisions)
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found."
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`ClarityLoop API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
