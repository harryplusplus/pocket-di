# Project Handover Documentation

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Principles](#principles)
  - [Software Development](#software-development)
  - [Testing](#testing)
- [Quick Start](#quick-start)
  - [For New Developers](#for-new-developers)
  - [Working on a Single File](#working-on-a-single-file)
- [Project Structure](#project-structure)
  - [pocket-di/](#pocket-di)
  - [examples/](#examples)
- [Type Design Patterns](#type-design-patterns)
  - [Provider Variants](#provider-variants)
    - [Inferable Variant](#inferable-variant)
    - [Validatable Variant](#validatable-variant)
  - [Token Types](#token-types)
  - [DependencyDeclaration Rules](#dependencydeclaration-rules)
  - [Token Type Decision Tree](#token-type-decision-tree)
- [Common Pitfalls](#common-pitfalls)
  - [1. Using `String(token)` in Error Messages](#1-using-stringtoken-in-error-messages)
  - [2. Using TypedToken as Map Key](#2-using-typedtoken-as-map-key)
  - [3. Forgetting to Normalize Provider](#3-forgetting-to-normalize-provider)
  - [4. Duplicating Provider Logic](#4-duplicating-provider-logic)
  - [5. Not Checking for `undefined` After Map.get()](#5-not-checking-for-undefined-after-mapget)
- [Code Smell Detection](#code-smell-detection)
  - [Pattern 1: Duplicated Provider Logic](#pattern-1-duplicated-provider-logic)
  - [Pattern 2: Manual Token String Conversion](#pattern-2-manual-token-string-conversion)
  - [Pattern 3: Recursive Parent Search Logic](#pattern-3-recursive-parent-search-logic)
  - [Pattern 4: Type Guard Duplication](#pattern-4-type-guard-duplication)
- [Naming Conventions](#naming-conventions)
  - [Functions](#functions)
  - [Type Suffixes](#type-suffixes)
  - [Naming Philosophy](#naming-philosophy)
- [Commands](#commands)
  - [Single File Commands](#single-file-commands)
  - [Format](#format)
  - [Test](#test)
- [Session Resumption](#session-resumption)
  - [1. Check git history](#1-check-git-history)
  - [2. Review source files](#2-review-source-files)
  - [3. Understand the Task](#3-understand-the-task)
- [Implementation Workflow](#implementation-workflow)
- [Testing Workflow](#testing-workflow)
  - [Workflow](#workflow)
  - [Test File Structure](#test-file-structure)
  - [Testing Best Practices](#testing-best-practices)
    - [When to Use `as any` in Tests](#when-to-use-as-any-in-tests)
    - [Type Assertions in Tests](#type-assertions-in-tests)
    - [Test Naming Convention](#test-naming-convention)
- [Commit Workflow](#commit-workflow)
- [Implementation Status](#implementation-status)
  - [Completed with Full Coverage](#completed-with-full-coverage)
  - [TODO (Need Implementation)](#todo-need-implementation)
  - [Architecture Overview](#architecture-overview)
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

## Quick Start

### For New Developers

**Start here:** Read the [Architecture Overview](#architecture-overview) first to understand the big picture.

**Recommended reading order:**

1. [Type Design Patterns](#type-design-patterns) - Understand provider and token types
2. [Common Pitfalls](#common-pitfalls) - Avoid mistakes others made
3. [Code Smell Detection](#code-smell-detection) - Know when to refactor
4. [Project Structure](#project-structure) - Navigate the codebase

### Working on a Single File

```bash
# 1. Write source file (src/)
#    - Add JSDoc @file comment
# 2. Write test file (tests/)
# 3. Test single file
pnpm test:item tests/<file>.test.ts

# 4. Lint single file
pnpm lint:item src/<file>.ts
```

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

## Type Design Patterns

### Provider Variants

All providers have two variants for type safety:

#### Inferable Variant

- `provide`: **PlainToken** (string | symbol)
- Type is inferred from `useClass`/`useFactory`/`useValue`
- Example: `defineClassProvider({ provide: 'token', useClass: Service })`

#### Validatable Variant

- `provide`: **HasTypeToken** (TypedToken or Constructor)
- Type is explicitly specified
- Example: `defineClassProvider({ provide: Service, useClass: Service })`
- Example: `defineClassProvider({ provide: defineToken<Service>('token'), useClass: Service })`

### Token Types

- **PlainToken**: `string` | `symbol` - Token without type information
- **TypedToken**: `{ token: string | symbol, [type]: T }` - Token with type information
- **Constructor**: Class constructor - constructor itself has type information
- **KeyToken**: `PlainToken | Constructor` - Map-compatible token (objects cannot be Map keys)

### DependencyDeclaration Rules

`inject` must only use **HasTypeToken**:

```typescript
// ✅ Correct usage
inject: { dep: defineToken<DepService>('dep') }
inject: { dep: DepService }

// ❌ Incorrect usage
inject: { dep: 'string-token' }  // Compilation error!
```

**Reason**: `DependencyDeclaration = Record<string, HasTypeToken>`, so strings/symbols cannot be used.

### Token Type Decision Tree

```text
Need to use as Map key?
├─ Yes → Use KeyToken (PlainToken | Constructor)
│         NEVER use TypedToken as Map key (object identity issue)
└─ No → Use InjectionToken (PlainToken | TypedToken | Constructor)
         Use TypedToken when you need type safety with string/symbol
```

**Why KeyToken exists:**

JavaScript `Map` uses `SameValueZero` algorithm for key equality. Objects with same content but different identity are different keys:

```typescript
// ❌ WRONG: TypedToken objects have unique identity
const token1 = defineToken<Service>('service')
const token2 = defineToken<Service>('service')
const map = new Map()
map.set(token1, value)  // token1 is used as object
map.get(token2)         // undefined! Different object

// ✅ CORRECT: Use KeyToken (primitive or constructor)
const key = toKeyToken(token)  // extracts 'service' string
map.set(key, value)
map.get(toKeyToken(token))     // works!
```

## Common Pitfalls

### 1. Using `String(token)` in Error Messages

❌ **Wrong:**

```typescript
throw new Error(`Cannot resolve "${String(token)}"`)
```

✅ **Correct:**

```typescript
import { tokenToString } from './token.ts'
throw new Error(`Cannot resolve "${tokenToString(token)}"`)
```

**Why:** `String(token)` doesn't handle TypedToken objects correctly. `tokenToString` properly extracts the primitive token and formats symbols.

### 2. Using TypedToken as Map Key

❌ **Wrong:**

```typescript
const typedToken = defineToken<Service>('service')
providerMap.set(typedToken, provider)  // object identity!
```

✅ **Correct:**

```typescript
import { toKeyToken } from './token.ts'
const key = toKeyToken(typedToken)
providerMap.set(key, provider)
```

### 3. Forgetting to Normalize Provider

When accepting `Provider` type (which includes Constructor), always normalize:

```typescript
import { normalizeProvider, type ConcreteProvider } from './provider-utils.ts'

function register(provider: Provider): void {
  const normalized: ConcreteProvider = normalizeProvider(provider)
  // Now use normalized.provide, etc.
}
```

### 4. Duplicating Provider Logic

Don't implement these yourself - use from `provider-utils.ts`:

- `normalizeProvider()` - Convert Constructor to ClassProvider
- `getProviderDependencies()` - Extract dependencies from provider
- `findProvider()` - Search in container hierarchy

### 5. Not Checking for `undefined` After Map.get()

After `Map.get()`, always check for undefined:

```typescript
const provider = map.get(key)
if (!provider) {
  throw new Error(`Provider not found: ${tokenToString(key)}`)
}
// Safe to use provider now
```

## Code Smell Detection

If you see these patterns, it's time to refactor:

### Pattern 1: Duplicated Provider Logic

**Smell:** Same provider handling code in multiple files

```typescript
// ❌ BAD: Duplicated in 3+ files
if (isFactoryProvider(provider)) {
  return provider.inject ?? {}
} else {
  return provider.useClass[inject] ?? {}
}
```

**Solution:** Move to `provider-utils.ts` as `getProviderDependencies()`

### Pattern 2: Manual Token String Conversion

**Smell:** `String(token)` or manual token property access

```typescript
// ❌ BAD
const str = token.token.toString()
const str = String(token)
```

**Solution:** Use `tokenToString(token)` from `token.ts`

### Pattern 3: Recursive Parent Search Logic

**Smell:** Parent lookup code scattered across resolvers

```typescript
// ❌ BAD: Repeated in multiple files
let current = this.context
while (current) {
  const provider = current.providerMap.get(key)
  if (provider) return provider
  current = current.parent?.context
}
```

**Solution:** Use `findProvider(key, context)` from `provider-utils.ts`

### Pattern 4: Type Guard Duplication

**Smell:** Same type guard implemented multiple times

```typescript
// ❌ BAD: Checking for postConstruct manually
if (
  typeof instance === 'object' &&
  instance !== null &&
  postConstruct in instance &&
  typeof instance[postConstruct] === 'function'
) { ... }
```

**Solution:** Use `isPostConstructable(instance)` from `lifecycle-events.ts`

## Naming Conventions

### Functions

- **define***: Creation functions (defineToken, defineClassProvider, defineValueProvider, defineFactoryProvider)
- **is***: Type guard functions (isTypedToken, isValueProvider, isClassProvider, etc.)

### Type Suffixes

- **Token**: Objects with type information (TypedToken, PlainToken, InjectionToken)
- **Provider**: Dependency providers (ValueProvider, ClassProvider, FactoryProvider)
- **Resolver**: Dependency resolution (SyncResolver, AsyncResolver, CommonResolver)

### Naming Philosophy

- Add "Token" suffix to type names for better understanding
  - `TypedToken` (not `TokenWithType`) - Clearly identifiable as token type
  - `InjectionToken` - Clearly identifiable as injection token

## Commands

**Configuration:**

- **PM**: pnpm only
- **External deps**: Exact versions only (no `^` or `~`)
- **Monorepo deps**: Use `workspace:*`

See `package.json` > `scripts` for all available commands.

### Single File Commands

```bash
# Test a single file
pnpm test:item tests/<file>.test.ts

# Lint a single file
pnpm lint:item src/<file>.ts
```

### Format

- **All**: `pnpm format:all` (run format:md:all + format:package-json in parallel)
  - **MD all**: `pnpm format:md:all` (TOC → MD, serial order)
    - **TOC**: `pnpm format:md:tOC` (update README table of contents)
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

Look for:

- Recent refactors that might affect your work
- Files that were recently modified
- Commit messages describing what changed

### 2. Review source files

**Start here:** The [Architecture Overview](#architecture-overview) shows the big picture.

**File-by-file approach:**

1. **Read JSDoc @file comments first** - Each file has a `@file` comment explaining its purpose
2. **Check exports** - Look at what the file exports to understand its API
3. **Check imports** - See what it depends on

**Key files to understand:**

| File | Purpose | When to modify |
| --- | --- | --- |
| `token.ts` | Token types and utilities | Adding new token types |
| `provider-utils.ts` | Shared provider logic | Adding provider operations |
| `container-*.ts` | Container components | Adding container features |
| `lifecycle-events.ts` | Lifecycle type guards | Adding lifecycle hooks |

### 3. Understand the Task

Before coding, clarify:

- **What** exactly needs to be implemented?
- **Where** should the code go? (Check [Code Smell Detection](#code-smell-detection))
- **How** will it be tested?

Example:

```text
Task: "Fix error handling in container-initializer"

Analysis:
- What: Replace String(token) with tokenToString(token)
- Where: container-initializer.ts, line 73
- Why: String() doesn't handle TypedToken correctly
- Test: Update error message expectations in tests
```

## Implementation Workflow

**TypeScript Configuration:**

- `erasableSyntaxOnly: true` - No constructor parameter properties
- Use field declarations + constructor assignment instead
- **NO definite assignment assertions**: Do not use `!` operator (e.g., `field!: Type`)
  - Use proper initialization, optional types, or assertion functions instead

**Documentation:**

Write JSDoc `@file` documentation for each source file.

Example:

```typescript
// src/<implementation>.ts
/**
 * @file Description of what this file does.
 */
```

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

// Use empty classes for testing
class TestService {}

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
- Use empty classes (no properties) for test fixtures
- Imports are auto-sorted by eslint

### Testing Best Practices

#### When to Use `as any` in Tests

**✅ ACCEPTABLE:** Accessing private members for testing

```typescript
// Testing internal state
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { context } = container as any
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
expect(context.singletonMap.has(token)).toBe(true)
```

**✅ ACCEPTABLE:** Mocking container structure

```typescript
const parent = { context: { children: new Set() } } as any
const initializer = new ContainerInitializer(container, {
  providers: [],
  parent,
})
```

**❌ AVOID:** Using `as any` to hide type errors in production code logic

#### Type Assertions in Tests

When using non-null assertion (`!`), ensure you've checked existence first:

```typescript
expect(context.providerMap.has('my-service')).toBe(true)
const normalized = context.providerMap.get('my-service')!  // Safe!
```

#### Test Naming Convention

```typescript
describe('<Feature>', () => {
  describe('<Scenario>', () => {
    it('should <expected behavior>', () => {
      // test implementation
    })
  })
})
```

Example:

```typescript
describe('container-initializer', () => {
  describe('provider registration', () => {
    it('should register value provider', () => { ... })
    it('should throw when registering duplicate token', () => { ... })
  })
})
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

## Implementation Status

### Completed with Full Coverage

**Core utilities:**

- ✅ async-lock
- ✅ circular-dependency-checker
- ✅ token, symbols
- ✅ provider-utils (normalizeProvider, getProviderDependencies, findProvider)

**Providers:**

- ✅ value-provider
- ✅ class-provider
- ✅ factory-provider
- ✅ provider (type guards)

**Container components:**

- ✅ container-initializer
- ✅ container-destroyer
- ✅ container-sync-resolver
- ✅ container-async-resolver
- ✅ container-common-resolver

**Lifecycle:**

- ✅ lifecycle-events (isPostConstructable, isPreDestroyable)

### TODO (Need Implementation)

- ⏳ Container async methods (resolveAsync, destroyAsync, createChildAsync)
- ⏳ Error handling & edge cases
- ⏳ Integration tests for full container lifecycle

### Architecture Overview

**Container Core:**

- **Registry**: Stores all provider registrations (Map<KeyToken, ConcreteProvider>)
- **CommonResolver**: Shared resolution logic (singleton cache, provider lookup)
- **SyncResolver**: Synchronous dependency resolution
- **AsyncResolver**: Asynchronous dependency resolution (with AsyncLock)
- **Initializer**: Provider registration and validation
- **Destroyer**: Cleanup and lifecycle hooks

**Provider Utilities:**

- **normalizeProvider**: Converts Constructor → ClassProvider
- **getProviderDependencies**: Extracts dependencies from provider
- **findProvider**: Recursive lookup in container hierarchy

**Resolution Flow:**

1. Provider registration via `ValueProvider`, `ClassProvider`, `FactoryProvider`, or Constructor
2. Normalization to `ConcreteProvider` format
3. Dependency validation with circular dependency detection
4. Dependency injection using `inject` static property
5. Instance creation with lifecycle hooks (postConstruct)
6. Singleton caching by scope

**Lifecycle:**

1. **Construction**: Constructor injection + postConstruct hook
2. **Usage**: Resolved instances cached by scope
3. **Destruction**: preDestroy hook when container is destroyed

## Immutable (Constitution)

NEVER modify without asking:

- `package.json`
- `tsconfig.json`
- `prettier.config.*`
- `eslint.config.*`
