import type {
  ChildContainerOptions,
  ContainerOptions,
} from './container-options.ts'
import type { Injectable } from './injectable.ts'
import type { ExtractTypeInfo, Providers } from './provider.ts'
import type { Key, TypeInfo } from './token.ts'

export interface Handler<I extends Injectable = Injectable> {
  resolve(): Promise<I>
  resolveSync(): I
  get(): I
  hasSingleton(): boolean
}

export class ContainerImpl<T extends TypeInfo> {
  handlers: Map<Key, Handler> = new Map()
  _type = undefined as unknown as T

  constructor(options: ContainerOptions<Providers>) {}

  $destroy(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  $createChild<const Ps extends Providers>(
    options: ChildContainerOptions<Ps>,
  ): Container<T & ExtractTypeInfo<Ps>> {
    throw new Error('Method not implemented.')
  }
}

type ContainerPublics<T extends TypeInfo = TypeInfo> = Pick<
  ContainerImpl<T>,
  '$createChild' | '$destroy'
>

type ContainerPublicKeys = keyof ContainerPublics

type ContainerHandlers<T extends TypeInfo> = { [K in keyof T]: Handler<T[K]> }

export type Container<T extends TypeInfo> = ContainerPublics<T> &
  ContainerHandlers<T>

const ALLOW_LIST = new Set<string>([
  '$createChild',
  '$destroy',
] satisfies ContainerPublicKeys[])

const SKIP_LIST = new Set(['then', 'catch', 'finally'])

export function createContainer<const Ps extends Providers>(
  options: ContainerOptions<Ps>,
): Container<ExtractTypeInfo<Ps>> {
  return new Proxy(new ContainerImpl<ExtractTypeInfo<Ps>>(options), {
    get: (target, key) => {
      if (typeof key !== 'string') {
        return undefined
      }

      if (SKIP_LIST.has(key)) {
        return undefined
      }

      if (ALLOW_LIST.has(key)) {
        return target[key as ContainerPublicKeys]
      }

      return target.handlers.get(key)
    },
  }) as Container<ExtractTypeInfo<Ps>>
}

// const a = defineValueProvider({ provide: 'a', useValue: 'a' })
// const b = defineValueProvider({ provide: 'b', useValue: 'b' })

// const container = createContainer({ providers: [a, b] })

// const c = defineValueProvider({ provide: 'c', useValue: 'c' })
// const child = container.$createChild({ providers: [c] })

// const d = defineValueProvider({ provide: 'd', useValue: 'd' })
// const grandChild = child.$createChild({ providers: [d] })

// const d2 = defineValueProvider({ provide: 'd2', useValue: 'd2' })
// const grandChild2 = child.$createChild({ providers: [d2] })
