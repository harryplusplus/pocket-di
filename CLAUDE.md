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

## Software Development Principles

- **KISS**: Prefer simple, readable code over clever solutions
- **YAGNI**: Build only what's needed now, not what might be needed later
- **DRY**: Every piece of knowledge should have a single representation (don't over-abstract)
- **SRP**: A class should have one reason to change (one job)
- **OCP**: Open for extension, closed for modification
- **LSP**: Subtypes must be substitutable for their base types
- **ISP**: Prefer many small interfaces over one large interface
- **DIP**: Depend on abstractions, not concretions
- **Source of Truth**: Data should have ONE authoritative source (e.g., `providerMap.keys()`, not separate `validTokens`)
- **Derive, Don't Store**: Compute values from source of truth, don't cache unless absolutely necessary

## Testing Principles

- **TDD**: Write tests BEFORE implementation (Red → Green → Refactor)
- **Test Isolation**: Each test should be independent (no shared state)
- **Test Coverage**: Cover happy path + edge cases + error cases
- **Unit Tests**: Test individual classes/functions in isolation
- **Integration Tests**: Test component interactions
- **Descriptive Names**: Test names should describe what they test

## Testing Workflow

When implementing a feature:

1. **Write test first** (Red)
   - Create test file: `tests/<feature>.test.ts`
   - Describe expected behavior with test cases

2. **Implement minimal code** (Green)
   - Write just enough to pass tests
   - Don't over-engineer

3. **Refactor** (Refactor)
   - Improve code quality
   - Ensure tests still pass

4. **Verify**
   - Run `pnpm test:ts` or `pnpm test:js`
   - Check type errors: `pnpm check-types`

## Test File Structure

```typescript
// tests/<feature>.test.ts
import { describe, it, expect } from 'vitest'

describe('<Feature>', () => {
  describe('<Scenario>', () => {
    it('should <expected behavior>', () => {
      // Arrange
      const input = ...

      // Act
      const result = ...

      // Assert
      expect(result).toBe(...)
    })
  })
})
```

## Immutable (Constitution)

NEVER modify without asking:

- `package.json`
- `tsconfig.json`
- `prettier.config.*`
- `eslint.config.*`

## Session Resumption

To resume a previous session after a crash or restart:

1. **Check plan file**: Look at `/Users/harry/.claude/plans/calm-dancing-kahan.md` for the current implementation plan
2. **Use `/context` command**: Check current context usage and memory files
3. **Reference recent work**: The plan file contains detailed implementation steps that can be continued

The plan file is automatically managed by Claude and persists across sessions.
