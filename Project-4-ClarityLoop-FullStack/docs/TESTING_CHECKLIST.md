# Project 4 Testing Checklist

## Connection
- [ ] SQL Server is running
- [ ] `npm run db:test` succeeds
- [ ] `GET /api/health` returns HTTP 200
- [ ] Frontend health pill shows API / DB connected

## Create
- [ ] Required title validation works
- [ ] Required context validation works
- [ ] Required reasoning validation works
- [ ] Confidence accepts only 1 to 100
- [ ] At least two options are required
- [ ] Selected option must match an entered option
- [ ] POST creates a SQL Server record
- [ ] Options are stored
- [ ] Selected option is stored
- [ ] Tags are stored
- [ ] Success toast appears

## Read
- [ ] Dashboard loads decisions from SQL Server
- [ ] Options display correctly
- [ ] Selected option displays correctly
- [ ] Tags display correctly
- [ ] Search works
- [ ] Tag filter works
- [ ] Confidence filter works
- [ ] Sort works
- [ ] Grid and list views work

## Update
- [ ] Edit form is pre-populated
- [ ] PUT updates main decision fields
- [ ] PUT updates options
- [ ] PUT updates selected option
- [ ] PUT updates tags
- [ ] PUT updates review status
- [ ] UI refreshes after update

## Delete
- [ ] Delete requires confirmation
- [ ] DELETE removes decision
- [ ] Related options and tags links are removed through database relationships
- [ ] UI refreshes after deletion

## Error Handling
- [ ] Stop backend and confirm offline UI state
- [ ] Retry button works
- [ ] Invalid input displays validation feedback
- [ ] HTTP errors display human-readable messages
- [ ] No raw stack traces appear in the UI

## Responsive
- [ ] Desktop 1440 px
- [ ] Laptop 1280 px
- [ ] Tablet 768 px
- [ ] Mobile 430 px
- [ ] Mobile 390 px
- [ ] Mobile 360 px
- [ ] No horizontal overflow
- [ ] Sidebar drawer works
- [ ] Forms remain usable
- [ ] Modals remain usable

## Evidence Screenshots
- [ ] Dashboard connected to API
- [ ] Decisions list
- [ ] New decision form
- [ ] Validation error
- [ ] Create success
- [ ] Decision detail drawer
- [ ] Edit modal
- [ ] Delete confirmation
- [ ] Insights
- [ ] Activity
- [ ] API / DB connected pill
- [ ] API offline state
- [ ] Mobile dashboard
- [ ] Mobile form
