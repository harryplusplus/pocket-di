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

**CommonResolver** (src/common-resolver.ts)

- resolveInstanceOrProvider() - Check singletonMap, then providerMap
- updateSingletonRegistry() - Store singleton if scope is singleton
- getProviderDependencies() - Extract inject metadata from providers
- Parent container lookup for providers

**SyncResolver** (src/sync-resolver.ts)

- resolve() - Sync resolve with dependency injection
- resolveDependencies() - Resolve deps synchronously
- resolveInstance() - Create instance, call postConstruct (throw if async)
- Recursive dependency resolution

**AsyncResolver** (src/async-resolver.ts)

- resolve() - Async resolve with dependency injection
- resolveDependencies() - Resolve deps asynchronously
- resolveInstance() - Create instance, await postConstruct
- Recursive dependency resolution

**Destroyer** (src/destroyer.ts)

- destroy() - Destroy children, singletons, clear maps
- destroyChildren() - Destroy children in reverse order
- destroySingletons() - Destroy singletons in reverse order
- Call provider preDestroy hook or instance preDestroy method if available

**ContainerImpl** (src/container-impl.ts)

- `resolve<I>(token)` - Async resolve via AsyncResolver
- `resolveSync<I>(token)` - Sync resolve via SyncResolver
- `hasSingleton(token)` - Check singletonMap.has(token)
- `get<I>(token)` - Get singleton from singletonMap (throw if not found)
- `destroy()` - Destroy via Destroyer
- `checkDestroyed()` - Throw error if container is destroyed
- Lazy initialization of resolvers and destroyer

**Tests** (47 tests passing)

- normalized-provider.test.ts (13 tests)
- container-initializer.test.ts (17 tests)
- common-resolver.test.ts (9 tests)
- sync-resolver.test.ts (8 tests)

### 🚧 Next Steps

**Remaining Test Coverage:**

To reach 100% coverage, write tests for:

1. **AsyncResolver** (async-resolver.test.ts)
   - Async resolution with dependencies
   - Async postConstruct handling
   - Async factory handling
   - Error cases (missing deps, etc.)

2. **Destroyer** (destroyer.test.ts)
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

- common-resolver.ts: 80% (some edge cases)
- sync-resolver.ts: 79% (some error paths)
- async-resolver.ts: 0% (needs tests)
- destroyer.ts: 0% (needs tests)
- container-impl.ts: 59% (hasSingleton, get, destroy tested)

## Immutable (Constitution)

NEVER modify without asking:

- `package.json`
- `tsconfig.json`
- `prettier.config.*`
- `eslint.config.*`

## Session Resumption

When handing over to next session or resuming after crash:

1. **Run format:all**: `pnpm format:all`
   - Sort package.json files
   - Update README TOCs
   - Fix markdown linting

2. **Check plan file**: Look at `/Users/harry/.claude/plans/calm-dancing-kahan.md` for the current implementation plan

3. **Use `/context` command**: Check current context usage and memory files

4. **Reference recent work**: The plan file contains detailed implementation steps that can be continued

The plan file is automatically managed by Claude and persists across sessions.
