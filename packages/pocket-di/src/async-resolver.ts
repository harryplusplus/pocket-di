import type { ContainerContext } from './container-context.ts'
import type { Injectable } from './types/injectable.ts'
import type { Key } from './types/token.ts'

export class AsyncResolver {
  context: ContainerContext

  constructor(context: ContainerContext) {
    this.context = context
  }

  async resolve(key: Key): Promise<Injectable> {
    const { context } = this

    context.$ensureNotDestroyed()
  }
}
