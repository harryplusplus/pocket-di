import { CircularDependencyChecker } from './circular-dependency-checker.ts'
import type { ContainerContext } from './container-context.ts'
import { type FilledContextOptions } from './types/container-options.ts'
import type { DependencyDeclaration } from './types/dependency-declaration.ts'
import {
  isClassProvider,
  isFactoryProvider,
  type Provider,
} from './types/provider.ts'
import { inject } from './types/symbols.ts'
import type { Key, Token } from './types/token.ts'

export class Initializer {
  context: ContainerContext
  options: FilledContextOptions

  constructor(context: ContainerContext, options: FilledContextOptions) {
    this.context = context
    this.options = options
  }

  init(): void {
    this.parseProviders()
    this.validateDeclarations()
  }

  validateDeclarations(): void {
    const { providerRegistry } = this.context

    for (const provider of providerRegistry.map.values()) {
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

    // TODO: skip visited

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
    const { providerRegistry } = this.context

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
    const { providerRegistry } = this.context
    const { providers } = this.options

    for (const provider of providers) {
      const { key } = provider.token
      this.validateProvider(key)
      providerRegistry.map.set(key, provider)
    }
  }

  validateProvider(key: Key): void {
    const { providerRegistry } = this.context
    const { override } = this.options

    const parentFound = providerRegistry.parent?.find(key)
    if (parentFound && !override) {
      throw new Error(
        `Cannot register key "${key}": already exists in parent container. Use override option to replace.`,
      )
    }

    const localFound = providerRegistry.find(key, { localOnly: true })
    if (localFound) {
      throw new Error(
        `Cannot register key "${key}": duplicate registration in same container.`,
      )
    }
  }
}
