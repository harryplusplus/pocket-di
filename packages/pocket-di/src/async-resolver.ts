import type { AnyDependencies } from '../types/dependency-declaration.ts'
import type { Injectable } from '../types/injectable.ts'
import { isPostConstructable } from '../types/lifecycle-events.ts'
import { isClassProvider } from '../types/provider.ts'
import { postConstruct } from '../types/symbols.ts'
import type { Key } from '../types/token.ts'
import {
  CommonResolver,
  type ProviderHasDependencies,
  providerToDeclaration,
} from './common-resolver.ts'
import type { ContainerImpl } from './impl.ts'

export class ContainerAsyncResolver {
  private readonly impl: ContainerImpl
  private readonly common: CommonResolver

  constructor(impl: ContainerImpl) {
    this.impl = impl
    this.common = new CommonResolver(impl)
  }

  async resolve(key: Key): Promise<Injectable> {
    const { common } = this

    const output = common.resolveInstanceOrProvider(key)
    if (output.kind === 'instance') {
      return output.instance
    }

    const { provider } = output

    const dependencies = await this.resolveDependencies(provider)
    const instance = await this.resolveInstance({ provider, dependencies })

    common.updateSingletonRegistry({ provider, instance })

    return instance
  }

  async resolveDependencies(
    provider: ProviderHasDependencies,
  ): Promise<AnyDependencies> {
    const declaration = providerToDeclaration(provider)
    const dependencies: AnyDependencies = {}
    for (const [name, token] of Object.entries(declaration)) {
      const instance = await this.resolve(token.key)

      dependencies[name] = instance
    }

    return dependencies
  }

  async resolveInstance(input: {
    provider: ProviderHasDependencies
    dependencies: AnyDependencies
  }): Promise<Injectable> {
    const { provider, dependencies } = input

    if (isClassProvider(provider)) {
      const { useClass } = provider
      const instance = new useClass(dependencies)

      if (isPostConstructable(instance)) {
        await instance[postConstruct]()
      }

      return instance
    }

    const { useFactory } = provider
    return await useFactory(dependencies)
  }
}
