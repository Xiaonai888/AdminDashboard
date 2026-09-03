# Shadow Admin Development Rules

## Scope
These rules apply to the entire `AdminDashboard` repository.

## Mandatory AI Startup Rule
Before creating, modifying, or reviewing Admin code:
1. Read this `AGENTS.md`.
2. Inspect the target page/component.
3. Inspect the exact API request used by that page.
4. Inspect the matching route/controller/query in `Xiaonai888/Shadow-Backend` when the task touches backend data.
5. Inspect similar existing Admin pages before creating duplicate UI or data logic.
6. Preserve existing API, routing, authentication, permissions, and business logic unless the task explicitly requires changing them.
7. Do not mark work complete after checking only UI, Dark Mode, or translations.

## Data Fetch / API Efficiency Standard

Every Admin page or component that displays data which can grow over time must use a bounded data strategy.

This includes:
- users
- stories
- episodes
- comments
- reports
- orders
- products
- publishers
- logs
- notifications
- payments
- transactions
- analytics rows
- histories
- search results
- moderation queues
- any other growing collection

### Pagination and Limit Rules
- Never fetch an unbounded growing collection by default.
- Use pagination, cursor pagination, `limit`, `offset`, `.range()`, or an equivalent bounded strategy.
- Normal first load should be about 30–50 rows.
- Do not request more than 100 rows per page unless the feature has a clear reason.
- Do not fetch all rows and then paginate only in the browser.
- Search, filters, and sorting should preferably be applied on the backend/database when the dataset can grow large.

### Database Select Rules
When Admin work requires backend changes:
- Avoid `select('*')` for list endpoints.
- Avoid unrestricted nested `relation(*)`.
- Select only fields actually needed by the Admin UI or business logic.
- Large nested data must have its own limit or pagination.
- Prefer database-side filtering, sorting, counting, and aggregation.

### Count Rules
- Do not fetch rows only to count them in the browser or Node.
- Use database count queries for dashboard totals, badges, queues, notifications, and summaries when possible.
- Avoid artificial limits such as loading 500 rows just to calculate a count.

### Bulk Action Rules
Admin pages often perform actions on many records.

- Bulk approve, reject, delete, archive, publish, unpublish, update, clear, or similar actions should normally use one backend bulk endpoint.
- Avoid unbounded `Promise.all(items.map(() => fetch(...)))`.
- Do not create one HTTP request per selected row when the backend can process the selected IDs in one request.
- Bulk operations must preserve authentication, admin permission, validation, and audit logging.

### GET Request Rules
- GET endpoints should normally be read-only.
- Do not trigger database cleanup, deletion, archiving, or unrelated updates every time an Admin list is opened.
- Cleanup work should use a deliberate maintenance or scheduled strategy when appropriate.

### Cache Rules
- Consider cache for read-heavy Admin reference data that changes infrequently.
- Do not cache sensitive or highly dynamic Admin data blindly.
- Reuse existing cache patterns before creating a new system.
- Cache never replaces pagination or database limits.
- Mutations must invalidate affected cache when needed.

### Frontend Request Rules
- Avoid duplicate requests for the same resource during one page load.
- Debounce or otherwise control API-backed search inputs when appropriate.
- Do not fire a request on every keystroke without an intentional strategy.
- Cancel or ignore stale search requests when rapid query changes can produce race conditions.
- Avoid repeatedly refetching large datasets when local state or an existing cache is still valid.

### Admin Data State Rules
Every data-driven Admin page must explicitly consider:
- initial loading
- error
- empty result
- loaded content
- loading next page / more rows
- end of results when applicable
- mutation/loading state for actions when applicable

## Cross-Repo Inspection Rule
For every Admin feature that uses Shadow Backend data:
1. Inspect the Admin page/component.
2. Identify the exact API endpoint.
3. Inspect the matching backend route.
4. Inspect the matching backend controller/service/query.
5. Check pagination/limit.
6. Check selected fields.
7. Check nested data size.
8. Check count strategy.
9. Check request count and bulk behavior.
10. Check cache suitability.
11. Preserve Admin authentication and permissions.

If the same backend endpoint is also consumed by `Xiaonai888/Web-React-2`, inspect that consumer before changing the API contract.

## API Compatibility Rule
Before changing an existing Admin API response:
- identify known consumers,
- preserve existing fields unless removal is intentional,
- coordinate pagination parameters and response metadata,
- do not silently break existing Admin or Reader pages,
- preserve authentication and authorization behavior.

## Data Efficiency Completion Checklist
Before marking a new or modified data-driven Admin feature DONE, verify:
- Related Admin and Backend files were inspected.
- Growing lists are bounded.
- Pagination or a safe limit exists.
- Only required fields are selected.
- Nested growing data is bounded.
- Counts are efficient.
- Bulk actions do not create unbounded N-request loops.
- GET requests do not perform unnecessary cleanup mutations.
- Duplicate/refetch behavior is controlled.
- Cache was considered where appropriate.
- Existing API consumers remain compatible.
- Admin permission checks remain intact.
- Existing build/checks pass.

## AI Mandatory Workflow
When asked to create or modify an Admin page:
1. Read `AGENTS.md`.
2. Inspect the target page/component.
3. Inspect relevant existing Admin patterns.
4. Determine whether the feature reads or writes data that can grow.
5. If YES, inspect the matching Shadow Backend route/controller/query.
6. Check limit/pagination.
7. Check selected fields.
8. Check nested data size.
9. Check request count and bulk actions.
10. Check count/aggregation strategy.
11. Check cache suitability.
12. Preserve API compatibility and Admin permissions.
13. Implement the smallest safe change.
14. Run the relevant existing checks/build before calling the task complete.

## Completion Rule
A data-driven Admin feature is NOT complete if:
- a growing list is unbounded,
- the browser downloads the full dataset just to paginate locally,
- unnecessary `select('*')` or unrestricted nested data is used,
- counts are calculated by downloading rows,
- a bulk action sends one request per item,
- a GET request performs unnecessary cleanup mutations,
- API changes break another consumer,
- Admin authorization is weakened,
- or the application build fails.
