const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "decisions.json");

function readDecisions() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeDecisions(decisions) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(decisions, null, 2), "utf8");
}

function validateDecision(body) {
  if (!body || typeof body !== "object") {
    return { valid: false, message: "Request body is required." };
  }

  const requiredTextFields = ["title", "category", "context", "reasoning"];

  for (const field of requiredTextFields) {
    if (typeof body[field] !== "string" || body[field].trim() === "") {
      return { valid: false, message: `${field} is required.` };
    }
  }

  if (!Number.isInteger(body.confidence) || body.confidence < 1 || body.confidence > 100) {
    return {
      valid: false,
      message: "Confidence must be an integer between 1 and 100."
    };
  }

  if (!Array.isArray(body.options) || body.options.length < 2) {
    return {
      valid: false,
      message: "At least two options are required."
    };
  }

  if (!body.options.includes(body.selectedOption)) {
    return {
      valid: false,
      message: "Selected option must exist in the options list."
    };
  }

  return { valid: true };
}

function validateReview(body) {
  if (!body || typeof body !== "object") {
    return { valid: false, message: "Review body is required." };
  }

  if (!["positive", "mixed", "negative"].includes(body.outcome)) {
    return {
      valid: false,
      message: "Outcome must be positive, mixed, or negative."
    };
  }

  if (!Number.isInteger(body.outcomeScore) || body.outcomeScore < 1 || body.outcomeScore > 10) {
    return {
      valid: false,
      message: "Outcome score must be an integer between 1 and 10."
    };
  }

  if (typeof body.actualOutcome !== "string" || body.actualOutcome.trim() === "") {
    return { valid: false, message: "Actual outcome is required." };
  }

  if (typeof body.lessonLearned !== "string" || body.lessonLearned.trim() === "") {
    return { valid: false, message: "Lesson learned is required." };
  }

  return { valid: true };
}

function filterDecisions(decisions, query = {}) {
  let result = [...decisions];

  if (query.category) {
    const category = String(query.category).trim().toLowerCase();
    result = result.filter((item) => item.category === category);
  }

  if (query.from) {
    const from = new Date(query.from);
    if (!Number.isNaN(from.getTime())) {
      result = result.filter((item) => new Date(item.createdAt) >= from);
    }
  }

  if (query.to) {
    const to = new Date(query.to);
    if (!Number.isNaN(to.getTime())) {
      to.setHours(23, 59, 59, 999);
      result = result.filter((item) => new Date(item.createdAt) <= to);
    }
  }

  return result;
}

function calculateInsights(decisions) {
  const reviewed = decisions.filter((item) => item.review);

  if (reviewed.length === 0) {
    return {
      totalDecisions: decisions.length,
      reviewedDecisions: 0,
      averageConfidence: 0,
      averageOutcomeScore: 0,
      confidenceOutcomeGap: 0,
      outcomeBreakdown: {
        positive: 0,
        mixed: 0,
        negative: 0
      }
    };
  }

  const avgConfidence =
    reviewed.reduce((sum, item) => sum + item.confidence, 0) / reviewed.length;

  const avgOutcomeScore =
    reviewed.reduce((sum, item) => sum + item.review.outcomeScore, 0) /
    reviewed.length;

  const normalizedOutcome = avgOutcomeScore * 10;

  const outcomeBreakdown = {
    positive: reviewed.filter((item) => item.review.outcome === "positive").length,
    mixed: reviewed.filter((item) => item.review.outcome === "mixed").length,
    negative: reviewed.filter((item) => item.review.outcome === "negative").length
  };

  return {
    totalDecisions: decisions.length,
    reviewedDecisions: reviewed.length,
    averageConfidence: Number(avgConfidence.toFixed(2)),
    averageOutcomeScore: Number(avgOutcomeScore.toFixed(2)),
    confidenceOutcomeGap: Number((avgConfidence - normalizedOutcome).toFixed(2)),
    outcomeBreakdown
  };
}

module.exports = {
  readDecisions,
  writeDecisions,
  validateDecision,
  validateReview,
  filterDecisions,
  calculateInsights
};
