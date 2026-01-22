import type { Injectable } from './injectable.ts'
import { postConstruct, preDestroy } from './symbols.ts'
import type { MaybePromise } from './utils.ts'

export interface PostConstructable {
  [postConstruct](): MaybePromise<void>
}

export function isPostConstructable(
  injectable: Injectable,
): injectable is PostConstructable {
  return postConstruct in injectable
}

export interface PreDestroyable {
  [preDestroy](): MaybePromise<void>
}

export function isPreDestroyable(
  injectable: Injectable,
): injectable is PreDestroyable {
  return preDestroy in injectable
}
