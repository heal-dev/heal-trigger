# heal-trigger — Agent Practices

## Build

- Bundler: `@vercel/ncc` compiles `src/index.ts` → `dist/index.js` (single file, no node_modules at runtime)
- **Always rebuild and stage dist/ before committing:**
  ```bash
  npm run build && git add dist/
  ```
- The pre-commit hook (lefthook) runs lint, format check, typecheck, and tests — it does **not** rebuild dist/
- CI has a git diff guard on `dist/` that fails if the bundle is stale

## Commands

```bash
npm run build        # bundle src/ → dist/index.js (ncc)
npm test             # vitest
npm run lint         # oxlint
npm run lint:fix     # oxlint (auto-fix)
npm run format       # oxfmt (writes changes)
npm run format:check # oxfmt (read-only check)
npm run typecheck    # tsgo --noEmit
```

## Dependencies

- `@actions/core` must stay at `^1.x` — v3+ is ESM-only and ncc compiles to CJS, causing "Package path . is not exported" errors
- No `@actions/github` — not needed; the action calls the Heal backend directly via `fetch`
- Do not add glob/minimatch libraries — see Glob patterns section below

## API

- Endpoint: `POST https://backend.heal.dev/api/v1/executions/trigger` (overridable via `backend-url` input)
- Auth header: `Authorization: ApiKey <token>` (not Bearer)
- Request body: `TriggerExecutionRequest` (see `src/types.ts`)
- Response: `ExternalExecutionTriggeredResponse` with `executionId` and `healExecutionUrl`

## Glob patterns

The backend filters slugs with PostgreSQL's `~*` operator (case-insensitive POSIX regex). JS regex libraries like minimatch generate syntax PostgreSQL rejects (`(?:...)`, `(?!\.)`, `(?=.)`). Use the custom `globToRegex()` in `src/utils.ts`:

- Bare slug → `^slug$` (exact match)
- `*nance` → `.*nance`
- `*login*` → `.*login.*`
- Regex special chars are escaped before `*` conversion

## Testing

- Framework: Vitest
- Tests live in `__tests__/index.test.ts`
- Mock `fetch` with `vi.stubGlobal` and `@actions/core` with `vi.mock`
- Use `vi.resetModules()` + dynamic `import('../src/index')` per test to re-run `run()`
- Assert glob behavior by testing the regex against slugs (`new RegExp(regex, 'i').test(slug)`) — do not assert exact regex strings since the output is an implementation detail

## Tooling

- Linter: Oxlint (`npm run lint`)
- Formatter: Oxfmt (`npm run format:check` / `npm run format`)
- Type checker: `tsgo --noEmit` (TypeScript native preview)
- Pre-commit: Lefthook — runs lint, format:check, typecheck, test

## Action inputs/outputs

| Input         | Required | Default                  |
| ------------- | -------- | ------------------------ |
| `api-token`   | Yes      |                          |
| `team`        | No       |                          |
| `feature`     | No       |                          |
| `test-case`   | No       |                          |
| `backend-url` | No       | https://backend.heal.dev |

| Output | Description                              |
| ------ | ---------------------------------------- |
| `url`  | `healExecutionUrl` from the API response |
