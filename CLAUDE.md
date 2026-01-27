# Project Handover Documentation

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Principles](#principles)
  - [Software Development](#software-development)
  - [Testing](#testing)
- [Quick Start](#quick-start)
  - [For New Session](#for-new-session)
  - [Working on a Single File](#working-on-a-single-file)
- [Project Structure](#project-structure)
  - [pocket-di/](#pocket-di)
  - [examples/](#examples)
- [Type Design Patterns](#type-design-patterns)
  - [Provider Variants](#provider-variants)
    - [Inferable Variant (타입 추론)](#inferable-variant-%ED%83%80%EC%9E%85-%EC%B6%94%EB%A1%A0)
    - [Validatable Variant (타입 검증)](#validatable-variant-%ED%83%80%EC%9E%85-%EA%B2%80%EC%A6%9D)
  - [Token Types](#token-types)
  - [DependencyDeclaration Rules](#dependencydeclaration-rules)
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
- [Implementation Workflow](#implementation-workflow)
- [Testing Workflow](#testing-workflow)
  - [Workflow](#workflow)
  - [Test File Structure](#test-file-structure)
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

### Working on a Single File

```bash
# 1. Write source file (src/)
#    - Add JSDoc @file comment
# 2. Write test file (tests/)
# 3. Test single file
pnpm test:item tests/<file>.test.ts

# 4. Lint single file
pnpm lint:item src/<file>.ts

# 5. When done: format, commit, push
pnpm format:all
git add -A && git commit -m "..." && git push
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

#### Inferable Variant (타입 추론)

- `provide`: **PlainToken** (string | symbol)
- 타입은 `useClass`/`useFactory`/`useValue`로부터 추론
- 사용 예: `defineClassProvider({ provide: 'token', useClass: Service })`

#### Validatable Variant (타입 검증)

- `provide`: **HasTypeToken** (TypedToken or Constructor)
- 타입이 명시적으로 지정됨
- 사용 예: `defineClassProvider({ provide: Service, useClass: Service })`
- 사용 예: `defineClassProvider({ provide: defineToken<Service>('token'), useClass: Service })`

### Token Types

- **PlainToken**: `string` | `symbol` - 타입 정보 없는 토큰
- **TypedToken**: `{ token: string | symbol, [type]: T }` - 타입 정보가 있는 토큰
- **Constructor**: 클래스 생성자 - 생성자 자체가 타입 정보를 가짐

### DependencyDeclaration Rules

`inject`는 반드시 **HasTypeToken**만 사용해야 합니다:

```typescript
// ✅ 올바른 사용
inject: { dep: defineToken<DepService>('dep') }
inject: { dep: DepService }

// ❌ 잘못된 사용
inject: { dep: 'string-token' }  // 컴파일 에러!
```

**이유**: `DependencyDeclaration = Record<string, HasTypeToken>`이므로 문자열/심볼은 사용할 수 없습니다.

## Naming Conventions

### Functions

- **define***: 생성 함수 (defineToken, defineClassProvider, defineValueProvider, defineFactoryProvider)
- **is***: 타입 가드 함수 (isTypedToken, isValueProvider, isClassProvider, etc.)

### Type Suffixes

- **Token**: 타입 정보를 가진 객체 (TypedToken, PlainToken, InjectionToken)
- **Provider**: 의존성 제공자 (ValueProvider, ClassProvider, FactoryProvider)
- **Resolver**: 의존성 해석 (SyncResolver, AsyncResolver, CommonResolver)

### Naming Philosophy

- 타입 이름에는 "Token" 접미사를 붙여서 이해하기 쉽게 합니다
  - `TypedToken` (not `TokenWithType`) - 토큰 타입임을 명확히 알 수 있음
  - `InjectionToken` - 의존성 주입용 토큰임을 명확히 알 수 있음

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

### 2. Review source files

Check files in `src/` directory. Read JSDoc @file documentation in each source file for details.

## Implementation Workflow

**TypeScript Configuration:**

- `erasableSyntaxOnly: true` - No constructor parameter properties
- Use field declarations + constructor assignment instead

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

**Providers:**

- ✅ value-provider
- ✅ class-provider
- ✅ factory-provider
- ✅ provider (type guards)

**Container components:**

- ✅ container-initializer
- ✅ container-destroyer
- ✅ container-sync-resolver
- ✅ container-common-resolver

### TODO (Need Implementation)

- ⏳ Container async methods (resolveAsync, destroyAsync, createChildAsync)
- ⏳ Container async-resolver
- ⏳ Lifecycle events (postConstruct, preDestroy)
- ⏳ Error handling & edge cases

### Architecture Overview

**Container Core:**

- **Registry**: Stores all provider registrations
- **SyncResolver**: Synchronous dependency resolution
- **AsyncResolver**: Asynchronous dependency resolution (with AsyncLock)
- **Initializer**: Creates instances from providers
- **Destroyer**: Cleans up container lifecycle

**Resolution Flow:**

1. Provider registration via `ValueProvider`, `ClassProvider`, `FactoryProvider`, or Constructor
2. Normalization to unified `NormalizedProvider` format
3. Dependency injection using `inject` static property
4. Circular dependency detection
5. Instance creation with lifecycle hooks

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
