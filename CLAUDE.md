# Project Setup

- **PM**: pnpm only
- **External deps**: Exact versions only (no `^` or `~`)
- **Monorepo deps**: Use `workspace:*`
- **Install**: `pnpm add <pkg> --save-exact`

## Commands

- **Install**: `pnpm i`
- **Lint**: `pnpm lint`
- **Format markdown**: `pnpm format:md` (run before committing .md changes)
- **Format TOC**: `pnpm format:toc` (update README table of contents)

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
