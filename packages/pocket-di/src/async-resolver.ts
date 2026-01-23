import type { ContainerImpl } from './container-impl.ts'
import type { Injectable } from './types/injectable.ts'
import type { Key } from './types/token.ts'

export class AsyncResolver {
  private readonly impl: ContainerImpl

  constructor(impl: ContainerImpl) {
    this.impl = impl
  }

  async resolve(key: Key): Promise<Injectable> {}
}
