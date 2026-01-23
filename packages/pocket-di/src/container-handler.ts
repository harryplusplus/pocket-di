import type {
  ContainerContext,
  HasSingletonOptions,
} from './container-context.ts'
import type { Injectable } from './types/injectable.ts'
import type { Key } from './types/token.ts'

export class ContainerHandler<I extends Injectable = Injectable> {
  context: ContainerContext
  key: Key

  constructor(context: ContainerContext, key: Key) {
    this.context = context
    this.key = key
  }

  async resolve(): Promise<I> {
    return await this.context.$resolve(this.key)
  }

  resolveSync(): I {
    return this.context.$resolveSync(this.key)
  }

  get(): I {
    return this.context.$get(this.key)
  }

  hasSingleton(options?: HasSingletonOptions): boolean {
    return this.context.$hasSingleton(this.key, options)
  }
}
