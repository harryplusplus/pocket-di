import type { ChildContainerOptions } from './container-options.ts'
import type { Injectable } from './injectable.ts'
import { type InjectionToken } from './token.ts'

export interface Container {
  destroy(): Promise<void>
  resolve<I extends Injectable>(token: InjectionToken<I>): Promise<I>
  resolveSync<I extends Injectable>(token: InjectionToken<I>): I
  createChild(options?: ChildContainerOptions): Container
}
