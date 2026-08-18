const test = require("node:test");
const assert = require("node:assert/strict");

const {
  validateDecision,
  validateReview,
  filterDecisions,
  calculateInsights
} = require("../src/decisionService");

const validDecision = {
  title: "Choose next backend topic",
  category: "backend",
  context: "Selecting the next topic to study.",
  options: ["Authentication", "Caching"],
  selectedOption: "Authentication",
  reasoning: "Authentication is a logical next step.",
  confidence: 88
};

test("1. accepts a valid decision", () => {
  assert.equal(validateDecision(validDecision).valid, true);
});

test("2. rejects confidence above 100", () => {
  const result = validateDecision({ ...validDecision, confidence: 150 });
  assert.equal(result.valid, false);
});

test("3. rejects fewer than two options", () => {
  const result = validateDecision({
    ...validDecision,
    options: ["Authentication"],
    selectedOption: "Authentication"
  });
  assert.equal(result.valid, false);
});

test("4. rejects a selected option not present in options", () => {
  const result = validateDecision({
    ...validDecision,
    selectedOption: "WebSockets"
  });
  assert.equal(result.valid, false);
});

test("5. accepts a valid outcome review", () => {
  const result = validateReview({
    outcome: "positive",
    outcomeScore: 9,
    actualOutcome: "The choice worked well.",
    lessonLearned: "The reasoning was sound."
  });
  assert.equal(result.valid, true);
});

test("6. rejects invalid outcome score", () => {
  const result = validateReview({
    outcome: "positive",
    outcomeScore: 12,
    actualOutcome: "The choice worked well.",
    lessonLearned: "The reasoning was sound."
  });
  assert.equal(result.valid, false);
});

test("7. filters decisions by category", () => {
  const decisions = [
    { category: "backend", createdAt: "2026-08-07T00:00:00.000Z" },
    { category: "testing", createdAt: "2026-08-08T00:00:00.000Z" }
  ];

  const result = filterDecisions(decisions, { category: "backend" });
  assert.equal(result.length, 1);
  assert.equal(result[0].category, "backend");
});

test("8. calculates confidence-versus-outcome insights", () => {
  const decisions = [
    {
      confidence: 90,
      review: { outcome: "positive", outcomeScore: 8 }
    },
    {
      confidence: 80,
      review: { outcome: "mixed", outcomeScore: 7 }
    }
  ];

  const insights = calculateInsights(decisions);

  assert.equal(insights.reviewedDecisions, 2);
  assert.equal(insights.averageConfidence, 85);
  assert.equal(insights.averageOutcomeScore, 7.5);
  assert.equal(insights.confidenceOutcomeGap, 10);
});
