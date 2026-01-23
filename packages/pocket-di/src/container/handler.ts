import type { HasSingletonOptions } from '../types/container-context.ts'
import type { Injectable } from '../types/injectable.ts'
import type { Key } from '../types/token.ts'
import type { ContainerImpl } from './impl.ts'

export class ContainerHandler<I extends Injectable = Injectable> {
  private readonly impl: ContainerImpl
  private readonly key: Key

  constructor(impl: ContainerImpl, key: Key) {
    this.impl = impl
    this.key = key
  }

  async resolve(): Promise<I> {
    return await this.impl.$resolve(this.key)
  }

  resolveSync(): I {
    return this.impl.$resolveSync(this.key)
  }

  get(): I {
    return this.impl.$get(this.key)
  }

  hasSingleton(options?: HasSingletonOptions): boolean {
    return this.impl.$hasSingleton(this.key, options)
  }
}
