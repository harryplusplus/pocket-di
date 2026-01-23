import type { Injectable } from '../types/injectable.ts'
import type { Key } from '../types/token.ts'
import type { ContainerImpl } from './impl.ts'

export class ContainerSyncResolver {
  private readonly impl: ContainerImpl

  constructor(impl: ContainerImpl) {
    this.impl = impl
  }

  resolve(key: Key): Injectable {
    throw new Error('Not implemented.')
  }
}
