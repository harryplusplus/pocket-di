# Project Setup

- **PM**: pnpm only
- **External deps**: Exact versions only (no `^` or `~`)
- **Monorepo deps**: Use `workspace:*`
- **Install**: `pnpm add <pkg> --save-exact`
- **npm-run-all**: `run-p` (parallel), `run-s` (serial) for task composition
  - Namespace with `:` for grouping (e.g., `format:md:toc`)

## Commands

### Setup

- **Install**: `pnpm i`

### Quality

- **Clean**: `pnpm clean` (remove dist/ directories)
- **Check types**: `pnpm check-types` (type check all packages)
- **Lint**: `pnpm lint`

### Format

- **All**: `pnpm format:all` (run format:md:all + format:package-json in parallel)
  - **MD all**: `pnpm format:md:all` (TOC → MD, serial order)
    - **TOC**: `pnpm format:md:toc` (update README table of contents)
    - **MD**: `pnpm format:md:md` (fix markdown linting)
  - **Package.json**: `pnpm format:package-json` (sort package.json keys)

### Test

- **TypeScript**: `pnpm test:ts` (test src/ .ts files directly with type checking)
- **JavaScript**: `pnpm test:js` (clean → build → test dist/src/ .js files)

## Structure

```text
packages/
├── pocket-di/     # DI container (0 deps, TS erasableSyntaxOnly)
│   └── src/index.ts   # Exports ONLY public API (minimal surface)
└── examples/      # Real-world usage examples
```

**Why separate packages?**

- Keep imports realistic: `from 'pocket-di'` not `from '../dist'`
- examples verifies public API from `pocket-di/src/index.ts`

## Immutable (Constitution)

NEVER modify without asking:

- `package.json`
- `tsconfig.json`
- `prettier.config.*`
- `eslint.config.*`
