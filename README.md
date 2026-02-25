# heal-trigger

[![CI](https://github.com/heal-dev/heal-trigger/actions/workflows/ci.yml/badge.svg)](https://github.com/heal-dev/heal-trigger/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A GitHub Action that triggers a [Heal.dev](https://heal.dev) test execution and surfaces the execution URL directly in your workflow run.

## Usage

```yaml
name: Heal.dev CI
on:
  push:

jobs:
  heal-dev:
    name: Heal.dev
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Heal Suite Execution
        uses: heal-dev/heal-trigger@v1
        with:
          api-token: ${{ secrets.HEAL_API_TOKEN }}
```

### Filter examples

Filters accept exact slugs or glob patterns (`*` matches any sequence of characters). The API applies them case-insensitively.

```yaml
# Run every test case in the "finance" team
- uses: heal-dev/heal-trigger@v1
  with:
    api-token: ${{ secrets.HEAL_API_TOKEN }}
    team: finance

# Run teams whose slug ends in "nance" (e.g. "finance")
- uses: heal-dev/heal-trigger@v1
  with:
    api-token: ${{ secrets.HEAL_API_TOKEN }}
    team: '*nance'

# Run a specific feature across all teams
- uses: heal-dev/heal-trigger@v1
  with:
    api-token: ${{ secrets.HEAL_API_TOKEN }}
    feature: decision-analysis

# Run a feature scoped to a team pattern
- uses: heal-dev/heal-trigger@v1
  with:
    api-token: ${{ secrets.HEAL_API_TOKEN }}
    team: '*nan*'
    feature: decision-analysis

# Run test cases whose slug contains "login" in the "finance" team
- uses: heal-dev/heal-trigger@v1
  with:
    api-token: ${{ secrets.HEAL_API_TOKEN }}
    team: finance
    test-case: '*login*'
```

## Inputs

| Input         | Description                                                       | Required | Default                    |
| ------------- | ----------------------------------------------------------------- | -------- | -------------------------- |
| `api-token`   | Your Heal API token                                               | Yes      |                            |
| `team`        | Filter by team slug. Supports glob patterns (e.g. `*nance`)       | No       |                            |
| `feature`     | Filter by feature slug. Supports glob patterns                    | No       |                            |
| `test-case`   | Filter by test case slug. Supports glob patterns (e.g. `*login*`) | No       |                            |
| `backend-url` | Override the Heal backend base URL                                | No       | `https://backend.heal.dev` |

## Outputs

| Output | Description                    |
| ------ | ------------------------------ |
| `url`  | URL of the triggered execution |

## Development

### Prerequisites

- Node.js 24+
- npm

### Setup

```bash
git clone https://github.com/heal-dev/heal-trigger.git
cd heal-trigger
npm install
```

[Lefthook](https://github.com/evilmartians/lefthook) pre-commit hooks are installed automatically and run lint, format check, typecheck, and tests before every commit.

### Scripts

| Script                 | Description                                          |
| ---------------------- | ---------------------------------------------------- |
| `npm test`             | Run unit tests with Vitest                           |
| `npm run lint`         | Lint source files with Oxlint                        |
| `npm run lint:fix`     | Lint and auto-fix source files                       |
| `npm run format`       | Format source files with Oxfmt                       |
| `npm run format:check` | Check formatting without writing                     |
| `npm run typecheck`    | Type-check with TypeScript (no emit)                 |
| `npm run build`        | Bundle `src/index.ts` into `dist/index.js` using ncc |

### Build

The action is bundled with [@vercel/ncc](https://github.com/vercel/ncc) so no `node_modules` are needed at runtime. After making changes to `src/`, always rebuild:

```bash
npm run build
```

Always rebuild before committing so `dist/` stays in sync with your changes.

### Testing

```bash
npm test
```

Tests use [Vitest](https://vitest.dev/) and live in `__tests__/`.

### Linting & Formatting

```bash
npm run lint          # Oxlint
npm run lint:fix      # Oxlint (auto-fix)
npm run format        # Oxfmt (writes changes)
npm run format:check  # Oxfmt (read-only check)
npm run typecheck     # TypeScript type check
```

## Releasing

Push a version tag to trigger the release workflow:

```bash
git tag v1.0.0
git push origin v1.0.0
```

The release workflow will:

1. Build `dist/index.js`
2. Create a GitHub Release with auto-generated notes
3. Update the floating major version tag (e.g. `v1`)

## License

MIT © heal-dev
