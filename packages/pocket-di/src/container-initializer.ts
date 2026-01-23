import { CircularDependencyChecker } from './circular-dependency-checker.ts'
import type { ContainerImpl } from './container-impl.ts'
import { type FilledContainerImplOptions } from './types/container-options.ts'
import type { DependencyDeclaration } from './types/dependency-declaration.ts'
import {
  isClassProvider,
  isFactoryProvider,
  type Provider,
} from './types/provider.ts'
import { inject } from './types/symbols.ts'
import type { Key, Token } from './types/token.ts'

export class ContainerInitializer {
  private readonly impl: ContainerImpl
  private readonly options: FilledContainerImplOptions

  constructor(impl: ContainerImpl, options: FilledContainerImplOptions) {
    this.impl = impl
    this.options = options
  }

  init(): void {
    this.parseProviders()
    this.validateDeclarations()
  }

  validateDeclarations(): void {
    const { providerRegistry } = this.impl.context

    for (const provider of providerRegistry.values()) {
      const checker = new CircularDependencyChecker()

      checker.push(provider.token.key)
      this.validateDeclarationRecursive({ provider, checker })
    }
  }

  validateDeclarationRecursive(input: {
    provider: Provider
    checker: CircularDependencyChecker
  }): void {
    const { provider, checker } = input

    if (isClassProvider(provider)) {
      this.validateDeclaration({
        key: provider.token.key,
        declaration: provider.useClass[inject] ?? {},
        className: provider.useClass.name,
        checker,
      })
    } else if (isFactoryProvider(provider)) {
      this.validateDeclaration({
        key: provider.token.key,
        declaration: provider.inject,
        className: null,
        checker,
      })
    }
  }

  validateDeclaration(input: {
    key: Key
    declaration: DependencyDeclaration
    className: string | null
    checker: CircularDependencyChecker
  }): void {
    const { key, declaration, className, checker } = input

    for (const [name, token] of Object.entries(declaration)) {
      this.validateDeclarationName({ key, className, name })
      this.validateDeclarationToken({ key, className, token, checker })
    }
  }

  validateDeclarationToken(input: {
    key: Key
    className: string | null
    token: Token
    checker: CircularDependencyChecker
  }): void {
    const { key, className, token, checker } = input
    const { providerRegistry } = this.impl.context

    const provider = providerRegistry.find(token.key)
    if (!provider) {
      const classInfo = className ? ` (class "${className}")` : ''

      throw new Error(
        `Cannot register key "${key}"${classInfo}: dependency "${token.key}" is not registered.`,
      )
    }

    checker.push(token.key)
    this.validateDeclarationRecursive({ provider, checker })
  }

  validateDeclarationName(input: {
    key: Key
    className: string | null
    name: string
  }): void {
    const { key, className, name } = input

    if (
      !name ||
      name === '__proto__' ||
      name === 'constructor' ||
      name === 'prototype'
    ) {
      const classInfo = className ? ` (class "${className}")` : ''

      throw new Error(
        `Cannot register key "${key}"${classInfo}: invalid dependency property name "${name}".`,
      )
    }
  }

  parseProviders(): void {
    const { providerRegistry } = this.impl.context
    const { providers } = this.options

    for (const provider of providers) {
      const { key } = provider.token
      this.validateProvider(key)
      providerRegistry.set(key, provider)
    }
  }

  validateProvider(key: Key): void {
    const { providerRegistry, validKeySet } = this.impl.context
    const { override } = this.options

    if (override) {
      validKeySet.delete(key)
    }

    if (validKeySet.has(key)) {
      return
    }

    if (providerRegistry.find(key, { exclude: 'local' }) && !override) {
      throw new Error(
        `Cannot register key "${key}": already exists in parent container. Use override option to replace.`,
      )
    }

    if (providerRegistry.find(key, { exclude: 'parent' })) {
      throw new Error(
        `Cannot register key "${key}": duplicate registration in same container.`,
      )
    }

    validKeySet.add(key)
  }
}
