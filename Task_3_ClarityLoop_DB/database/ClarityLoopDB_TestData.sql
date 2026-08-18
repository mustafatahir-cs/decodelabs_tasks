USE ClarityLoopDB;
GO

DECLARE @DecisionId UNIQUEIDENTIFIER = NEWID();

INSERT INTO Decisions
(DecisionId, Title, Context, Reasoning, Confidence, ReviewDate, Status)
VALUES
(@DecisionId,
 'Choose database storage for ClarityLoop',
 'ClarityLoop previously stored decisions in a JSON file and now needs relational persistent storage.',
 'SQL Server provides structured relationships, constraints, and reliable CRUD operations.',
 85, '2026-08-12', 'pending-review');

INSERT INTO DecisionOptions (DecisionId, OptionText, IsSelected)
VALUES
(@DecisionId, 'Use SQL Server with SSMS', 1),
(@DecisionId, 'Continue using JSON file storage', 0);

IF NOT EXISTS (SELECT 1 FROM Tags WHERE TagName = 'database')
    INSERT INTO Tags (TagName) VALUES ('database');

IF NOT EXISTS (SELECT 1 FROM Tags WHERE TagName = 'backend')
    INSERT INTO Tags (TagName) VALUES ('backend');

INSERT INTO DecisionTags (DecisionId, TagId)
SELECT @DecisionId, TagId
FROM Tags
WHERE TagName IN ('database', 'backend');

INSERT INTO Reviews
(DecisionId, Outcome, ActualOutcome, LessonLearned, OutcomeScore)
VALUES
(@DecisionId, 'positive',
 'SQL Server successfully provided structured persistent storage.',
 'Relational databases provide stronger relationships and data integrity than flat-file storage.',
 9);

UPDATE Decisions
SET Status = 'reviewed', UpdatedAt = SYSUTCDATETIME()
WHERE DecisionId = @DecisionId;

SELECT
    d.Title,
    o.OptionText AS SelectedOption,
    d.Confidence,
    d.Status,
    r.Outcome,
    r.OutcomeScore,
    STRING_AGG(t.TagName, ', ') AS Tags
FROM Decisions d
INNER JOIN DecisionOptions o ON d.DecisionId = o.DecisionId AND o.IsSelected = 1
INNER JOIN Reviews r ON d.DecisionId = r.DecisionId
INNER JOIN DecisionTags dt ON d.DecisionId = dt.DecisionId
INNER JOIN Tags t ON dt.TagId = t.TagId
WHERE d.DecisionId = @DecisionId
GROUP BY d.Title, o.OptionText, d.Confidence, d.Status, r.Outcome, r.OutcomeScore;
GO
