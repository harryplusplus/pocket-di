import type { ContainerContext } from './container-context.ts'
import type { Injectable } from './types/injectable.ts'
import type { Key } from './types/token.ts'

export class SyncResolver {
  context: ContainerContext

  constructor(context: ContainerContext) {
    this.context = context
  }

  resolve(key: Key): Injectable {
    const { context } = this

    context.$ensureNotDestroyed()
  }
}
