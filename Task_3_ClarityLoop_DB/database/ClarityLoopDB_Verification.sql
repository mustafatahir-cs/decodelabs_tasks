USE ClarityLoopDB;
GO

SELECT COUNT(*) AS TotalDecisions FROM Decisions;
SELECT COUNT(*) AS TotalOptions FROM DecisionOptions;
SELECT COUNT(*) AS TotalReviews FROM Reviews;
SELECT COUNT(*) AS TotalTags FROM Tags;
SELECT COUNT(*) AS TotalDecisionTags FROM DecisionTags;

SELECT
    d.DecisionId,
    d.Title,
    d.Confidence,
    d.Status,
    o.OptionText AS SelectedOption,
    r.Outcome,
    r.OutcomeScore
FROM Decisions d
LEFT JOIN DecisionOptions o
    ON d.DecisionId = o.DecisionId AND o.IsSelected = 1
LEFT JOIN Reviews r
    ON d.DecisionId = r.DecisionId
ORDER BY d.CreatedAt DESC;
GO
