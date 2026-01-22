import type { RegistryFindOptions } from '../registry.ts'
import type { Injectable } from './injectable.ts'

export type HasSingletonOptions = RegistryFindOptions

export interface Handler<I extends Injectable = Injectable> {
  resolve(): Promise<I>
  resolveSync(): I
  get(): I
  hasSingleton(options?: HasSingletonOptions): boolean
}
