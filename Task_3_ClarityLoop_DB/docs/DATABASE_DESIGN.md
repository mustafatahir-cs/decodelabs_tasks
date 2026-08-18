# Database Design

Database: `ClarityLoopDB`

## Tables

### Decisions
Main decision record. `DecisionId` is the primary key. Confidence is constrained to 1–100 and status to `pending-review` or `reviewed`.

### DecisionOptions
One-to-many relationship with Decisions. Duplicate options within the same decision are prevented. A filtered unique index permits only one selected option per decision.

### Reviews
One-to-one relationship with Decisions because `DecisionId` is unique. Outcome is restricted to positive, mixed, or negative. Outcome score is constrained to 1–10.

### Tags
Reusable unique tags.

### DecisionTags
Junction table implementing the many-to-many relationship between Decisions and Tags.

## Integrity Features
- primary keys
- foreign keys
- unique constraints
- check constraints
- default values
- cascading deletes
- filtered unique index
