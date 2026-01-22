import { ContainerImpl } from './container-impl.ts'
import type { Container, ContainerPublicMethods } from './types/container.ts'
import type { ContainerOptions } from './types/container-options.ts'
import type { ExtractTypeInfo, Providers } from './types/provider.ts'
import type { TypeInfo } from './types/token.ts'

const PUBLIC_METHODS = new Set<string>([
  '$createChild',
  '$destroy',
] satisfies (keyof ContainerPublicMethods)[])

const SKIPS = new Set(['then', 'catch', 'finally'])

export function createContainerProxy<T extends TypeInfo>(
  impl: ContainerImpl<T>,
): Container<T> {
  return new Proxy(impl, {
    get: (target, key) => {
      if (typeof key !== 'string' || SKIPS.has(key)) {
        return undefined
      }

      if (PUBLIC_METHODS.has(key)) {
        return target[key as keyof ContainerPublicMethods]
      }

      return target.$getOrCreateHandler(key)
    },
  }) as Container<T>
}

export function createContainer<const Ps extends Providers>(
  options: ContainerOptions<Ps>,
): Container<ExtractTypeInfo<Ps>> {
  const impl = new ContainerImpl<ExtractTypeInfo<Ps>>(options)

  return createContainerProxy(impl)
}
