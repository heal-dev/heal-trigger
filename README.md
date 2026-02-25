# heal-trigger

[![CI](https://github.com/heal-dev/heal-trigger/actions/workflows/ci.yml/badge.svg)](https://github.com/heal-dev/heal-trigger/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A GitHub Action to trigger heal workflows and report results back to GitHub.

## Usage

```yaml
- name: Run heal-trigger
  uses: heal-dev/heal-trigger@v1
  with:
    who-to-greet: "Your Name"
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Full workflow example

```yaml
name: Example

on:
  push:
    branches: [main]

jobs:
  greet:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Run heal-trigger
        id: trigger
        uses: heal-dev/heal-trigger@v1
        with:
          who-to-greet: "World"
          github-token: ${{ secrets.GITHUB_TOKEN }}

      - name: Print greeting
        run: echo "${{ steps.trigger.outputs.greeting }}"
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `who-to-greet` | The name of the person or entity to greet | No | `World` |
| `github-token` | GitHub token for authenticated API calls | No | `${{ github.token }}` |

## Outputs

| Output | Description |
|--------|-------------|
| `greeting` | The greeting message that was generated |

## Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
git clone https://github.com/heal-dev/heal-trigger.git
cd heal-trigger
npm install
```

### Scripts

| Script | Description |
|--------|-------------|
| `npm test` | Run unit tests with Vitest |
| `npm run lint` | Lint source files with OxLint |
| `npm run format` | Format source files with OxFmt |
| `npm run format:check` | Check formatting without writing |
| `npm run build` | Bundle `src/index.js` into `dist/index.js` using ncc |

### Build

The action is bundled with [@vercel/ncc](https://github.com/vercel/ncc) so no `node_modules` are needed at runtime. After making changes to `src/`, always rebuild:

```bash
npm run build
```

### Testing

```bash
npm test
```

Tests use [Vitest](https://vitest.dev/) and live in `__tests__/`.

### Linting & Formatting

```bash
npm run lint          # OxLint
npm run format        # OxFmt (writes changes)
npm run format:check  # OxFmt (read-only check)
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