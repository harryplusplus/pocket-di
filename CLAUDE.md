# Project Handover Documentation

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Principles](#principles)
  - [Software Development](#software-development)
  - [Testing](#testing)
- [Project Structure](#project-structure)
  - [pocket-di/](#pocket-di)
  - [examples/](#examples)
- [Commands](#commands)
  - [Format](#format)
  - [Test](#test)
- [Session Resumption](#session-resumption)
  - [1. Check git history](#1-check-git-history)
  - [2. Review source files](#2-review-source-files)
- [Testing Workflow](#testing-workflow)
  - [Workflow](#workflow)
  - [Test File Structure](#test-file-structure)
- [Implementation Workflow](#implementation-workflow)
- [Commit Workflow](#commit-workflow)
- [Immutable (Constitution)](#immutable-constitution)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Principles

### Software Development

- **KISS**: Prefer simple, readable code over clever solutions
- **YAGNI**: Build only what's needed now, not what might be needed later
- **DRY**: Every piece of knowledge should have a single representation (don't over-abstract)
- **SRP**: A class should have one reason to change (one job)
- **OCP**: Open for extension, closed for modification
- **LSP**: Subtypes must be substitutable for their base types
- **ISP**: Prefer many small interfaces over one large interface
- **DIP**: Depend on abstractions, not concretions
- **Source of Truth**: Data should have ONE authoritative source
- **Derive, Don't Store**: Compute values from source of truth, don't cache unless absolutely necessary

### Testing

- **TDD**: Write tests BEFORE implementation (Red → Green → Refactor)
- **Test Isolation**: Each test should be independent (no shared state)
- **Test Coverage**: Cover happy path + edge cases + error cases
- **Unit Tests**: Test individual classes/functions in isolation
- **Integration Tests**: Test component interactions
- **Descriptive Names**: Test names should describe what they test

## Project Structure

```text
packages/
├── pocket-di/
└── examples/
```

### pocket-di/

DI container (0 deps, TS erasableSyntaxOnly)

- Exports ONLY public API (minimal surface) from `src/index.ts`

### examples/

Real-world usage examples

**Why separate packages?**

- Keep imports realistic: `from 'pocket-di'` not `from '../dist'`
- examples verifies public API from `pocket-di/src/index.ts`

## Commands

**Configuration:**

- **PM**: pnpm only
- **External deps**: Exact versions only (no `^` or `~`)
- **Monorepo deps**: Use `workspace:*`

See `package.json` > `scripts` for all available commands.

### Format

- **All**: `pnpm format:all` (run format:md:all + format:package-json in parallel)
  - **MD all**: `pnpm format:md:all` (TOC → MD, serial order)
    - **TOC**: `pnpm format:md:toc` (update README table of contents)
    - **MD**: `pnpm format:md:md` (fix markdown linting)
  - **Package.json**: `pnpm format:package-json` (sort package.json keys)

### Test

- **TypeScript**: `pnpm test:ts` (test src/ .ts files directly with type checking)
- **JavaScript**: `pnpm test:js` (clean → build → test dist/src/ .js files)

## Session Resumption

For new or returning sessions, follow this checklist:

### 1. Check git history

```bash
git log --oneline -10
```

### 2. Review source files

Check files in `src/` directory. Read JSDoc @file documentation in each source file for details.

## Testing Workflow

### Workflow

1. **Single file testing** (Quick feedback loop)
   ```bash
   # Test a single file (TypeScript)
   pnpm test:item src/<file>.ts

   # Lint a single file
   pnpm lint:item src/<file>.ts
   ```

2. **When implementing a feature:**
   - **Write test first** (Red)
     - Create test file: `tests/<feature>.test.ts`
     - Describe expected behavior with test cases

   - **Implement minimal code** (Green)
     - Write just enough to pass tests
     - Don't over-engineer

   - **Refactor** (Refactor)
     - Improve code quality
     - Ensure tests still pass

   - **Verify** (static → dynamic)
     - Check type errors: `pnpm check-types`
     - Run lint: `pnpm lint`
     - Run tests: `pnpm test:ts` or `pnpm test:js`

### Test File Structure

```typescript
// tests/<feature>.test.ts
import { describe, it, expect } from 'vitest'
import { inject } from '../src/symbols.ts'

// Use static [inject] for dependency declarations
class TestService {
  static [inject] = { dep: 'dependency-token' as any }
}

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

**Key Patterns:**

- Nest `describe()` blocks for better organization (feature → scenario → test)

## Implementation Workflow

**TypeScript Configuration:**

- `erasableSyntaxOnly: true` - No constructor parameter properties
- Use field declarations + constructor assignment instead

**Import Order:**

- Auto-fixed on lint

**Documentation:**

Write JSDoc `@file` documentation for each source file.

Example:

```typescript
// src/<implementation>.ts
/**
 * @file Description of what this file does.
 */
```

## Commit Workflow

CRITICAL: Run `pnpm precommit` from repository ROOT before every commit

```bash
# 1. Run precommit (MUST PASS before commit)
pnpm precommit

# 2. Check status
git status

# 3. Stage and commit
git add -A
git commit -m "..."

# 4. Push
git push
```

What `pnpm precommit` runs (in order):

1. `format:all` - TOC update + markdown lint + package.json sort
2. `check-types` - Type check all packages
3. `lint` - Fix ESLint issues
4. `test:ts` - Run TypeScript tests
5. `test:js` - Run JavaScript tests

If precommit fails:

- Fix the reported errors
- Re-run `pnpm precommit`
- Commit should only succeed after clean precommit run

## Immutable (Constitution)

NEVER modify without asking:

- `package.json`
- `tsconfig.json`
- `prettier.config.*`
- `eslint.config.*`
