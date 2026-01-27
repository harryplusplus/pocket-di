# Project Handover Documentation

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Principles](#principles)
  - [Software Development](#software-development)
  - [Testing](#testing)
- [Project Setup](#project-setup)
- [Commands](#commands)
  - [Setup](#setup)
  - [Quality](#quality)
  - [Format](#format)
  - [Test](#test)
- [Structure](#structure)
- [Testing Workflow](#testing-workflow)
- [Test File Structure](#test-file-structure)
- [Implementation Status](#implementation-status)
  - [✅ Completed (2025-01-27)](#-completed-2025-01-27)
  - [🚧 Next Steps](#-next-steps)
- [Immutable (Constitution)](#immutable-constitution)
- [Commit Workflow](#commit-workflow)
- [Session Resumption](#session-resumption)
  - [1. Quick Start (5 minutes)](#1-quick-start-5-minutes)
  - [2. Understand Current State](#2-understand-current-state)
  - [3. Continue Implementation](#3-continue-implementation)
  - [4. File Organization](#4-file-organization)
  - [5. Common Pitfalls](#5-common-pitfalls)
  - [6. Verification Before Commit](#6-verification-before-commit)

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

## Project Setup

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

4. **Verify** (static → dynamic)
   - Check type errors: `pnpm check-types`
   - Run lint: `pnpm lint`
   - Run tests: `pnpm test:ts` or `pnpm test:js`

## Test File Structure

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

- Use `static [inject]` for dependency declarations (not instance properties)
- Use `as any` for token values when type compatibility is an issue
- Nest `describe()` blocks for better organization (feature → scenario → test)

## Implementation Status

### ✅ Completed (2025-01-27)

**Container Architecture:**

All core components implemented and working. 47 tests passing, 64% coverage.

**ContainerContext** (src/container-context.ts)

- `parent?: ContainerImpl` - Parent container reference
- `children: Set<ContainerImpl>` - Child containers
- `providerMap: Map<InjectionToken, NormalizedProvider>` - Provider registry
- `singletonMap: Map<InjectionToken, Injectable>` - Singleton instance registry

**ContainerInitializer** (src/container-initializer.ts)

- Container initialization with parent-child relationship
- Provider registration and validation
- Token uniqueness validation (same container, parent containers)
- Dependency validation (unregistered deps, invalid names, circular dependencies)
- Parent chain dependency lookup
- Initializes singletonMap in context

**CircularDependencyChecker** (src/circular-dependency-checker.ts)

- Push/pop methods for tracking dependency chains
- Circular dependency detection with clear error messages

**NormalizedProvider** (src/normalized-provider.ts)

- Unified provider interface (token, type, scope, value/constructor/factory)
- normalizeProvider() for all provider types
- normalizeToken() for all injection tokens
- Extract inject metadata from constructors using hasOwnProperty

**ContainerCommonResolver** (src/container-common-resolver.ts)

- resolveInstanceOrProvider() - Check singletonMap, then providerMap
- updateSingletonRegistry() - Store singleton if scope is singleton
- getProviderDependencies() - Extract inject metadata from providers
- Parent container lookup for providers

**ContainerSyncResolver** (src/container-sync-resolver.ts)

- resolve() - Sync resolve with dependency injection
- resolveDependencies() - Resolve deps synchronously
- resolveInstance() - Create instance, call postConstruct (throw if async)
- Recursive dependency resolution

**ContainerAsyncResolver** (src/container-async-resolver.ts)

- resolve() - Async resolve with dependency injection
- resolveDependencies() - Resolve deps asynchronously
- resolveInstance() - Create instance, await postConstruct
- Recursive dependency resolution

**ContainerDestroyer** (src/container-destroyer.ts)

- destroy() - Destroy children, singletons, clear maps
- destroyChildren() - Destroy children in reverse order
- destroySingletons() - Destroy singletons in reverse order
- Call provider preDestroy hook or instance preDestroy method if available

**ContainerImpl** (src/container-impl.ts)

- `resolve<I>(token)` - Async resolve via ContainerAsyncResolver
- `resolveSync<I>(token)` - Sync resolve via ContainerSyncResolver
- `hasSingleton(token)` - Check singletonMap.has(token)
- `get<I>(token)` - Get singleton from singletonMap (throw if not found)
- `destroy()` - Destroy via ContainerDestroyer
- `checkDestroyed()` - Throw error if container is destroyed
- Lazy initialization of resolvers and destroyer

**Tests** (47 tests passing)

- normalized-provider.test.ts (13 tests)
- container-initializer.test.ts (17 tests)
- container-common-resolver.test.ts (6 tests)
- container-sync-resolver.test.ts (7 tests)

### 🚧 Next Steps

**Remaining Test Coverage:**

To reach 100% coverage, write tests for:

1. **ContainerAsyncResolver** (container-async-resolver.test.ts)
   - Async resolution with dependencies
   - Async postConstruct handling
   - Async factory handling
   - Error cases (missing deps, etc.)

2. **ContainerDestroyer** (container-destroyer.test.ts)
   - Child container destruction
   - Singleton destruction with preDestroy
   - Provider preDestroy hooks
   - Instance preDestroy methods
   - Reverse order destruction

3. **ContainerImpl** (container-impl.test.ts)
   - hasSingleton() method
   - get() method
   - destroy() method
   - checkDestroyed() behavior
   - Error on destroyed container access

**Key Considerations for Tests:**

- Use `deps: any` and `deps.dep` pattern (dependencies object)
- No constructor parameter properties (erasableSyntaxOnly)
- Class constructors receive full dependencies object
- Example:

  ```typescript
  class Service {
    static [inject] = { dep: Dependency as any }
    dep: any
    constructor(deps: any) {
      this.dep = deps.dep  // Extract from dependencies object
    }
  }
  ```

**Current Coverage by File:**

- container-common-resolver.ts: 80% (some edge cases)
- container-sync-resolver.ts: 79% (some error paths)
- container-async-resolver.ts: 0% (needs tests)
- container-destroyer.ts: 0% (needs tests)
- container-impl.ts: 59% (hasSingleton, get, destroy tested)

## Immutable (Constitution)

NEVER modify without asking:

- `package.json`
- `tsconfig.json`
- `prettier.config.*`
- `eslint.config.*`

## Commit Workflow

CRITICAL: Run `pnpm precommit` from repository ROOT before every commit

```bash
# Always from /Users/harry/repo/pocket-di
cd /Users/harry/repo/pocket-di

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
- DO NOT bypass with `git commit --no-verify`
- Commit should only succeed after clean precommit run

## Session Resumption

For new sessions or resuming after crash, follow this checklist:

### 1. Quick Start (5 minutes)

```bash
# From repository root
cd /Users/harry/repo/pocket-di

# Run full precommit check
pnpm precommit

# Check what's been done
git log --oneline -10
```

### 2. Understand Current State

**Read CLAUDE.md "Implementation Status" section:**

- **Completed Components**: What's already built
- **Test Coverage**: What's tested (47 tests, 64%)
- **Next Steps**: What needs to be done next
- **Key Patterns**: How to write code correctly

**Current Architecture:**

```text
ContainerImpl
  ├── context: ContainerContext
  │   ├── providerMap: Map<token, NormalizedProvider>
  │   ├── singletonMap: Map<token, Injectable>
  │   ├── parent?: ContainerImpl
  │   └── children: Set<ContainerImpl>
  │
  ├── ContainerAsyncResolver → ContainerCommonResolver (lazy init)
  ├── ContainerSyncResolver → ContainerCommonResolver (lazy init)
  └── ContainerDestroyer (lazy init)
```

**Dependency Injection Pattern:**

```typescript
// Declare dependencies with static [inject]
class Service {
  static [inject] = { dep: Dependency as any }
  dep: any
  constructor(deps: any) {
    this.dep = deps.dep  // Extract from dependencies object
  }
}
```

### 3. Continue Implementation

**Next Test Files to Write:**

1. `tests/container-async-resolver.test.ts` (0% coverage)
   - Copy pattern from `container-sync-resolver.test.ts`
   - Change to async/await
   - Test async postConstruct

2. `tests/container-destroyer.test.ts` (0% coverage)
   - Test child container destruction
   - Test preDestroy hooks
   - Test reverse order destruction

3. `tests/container-impl.test.ts` (partial coverage)
   - Test hasSingleton(), get(), destroy()
   - Test destroyed container errors

### 4. File Organization

**Source Files** (`packages/pocket-di/src/`):

- Type definitions: `*.ts` (container, provider, token, etc.)
- Implementation: `*-impl.ts`, `*-resolver.ts`, `*-initializer.ts`
- Utilities: `utils.ts`, `symbols.ts`

**Test Files** (`packages/pocket-di/tests/`):

- One test file per implementation file
- Name: `<feature>.test.ts`
- Use vitest: `describe`, `it`, `expect`

### 5. Common Pitfalls

**TypeScript Configuration:**

- `erasableSyntaxOnly: true` - No constructor parameter properties
- Use field declarations + constructor assignment instead

**Test Patterns:**

- Dependencies are passed as object: `{ dep: Dependency }`
- Constructor receives full object, extract what you need
- Use `as any` for type compatibility issues

**Import Order:**

- Prettier auto-fixes imports (alphabetical, grouped)
- Don't fight the linter

### 6. Verification Before Commit

```bash
# From root - single command that checks everything
pnpm precommit

# Only then commit
git add -A && git commit -m "..."
```

The plan file at `/Users/harry/.claude/plans/calm-dancing-kahan.md` contains old architecture details and should be ignored. Current implementation is documented in this CLAUDE.md file.
