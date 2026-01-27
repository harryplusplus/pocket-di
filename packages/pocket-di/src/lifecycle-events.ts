/**
 * @file injectable class에 전달된 symbol들을 구현하기 위한 interface 및 확인하기 위한 function들이 있습니다.
 */

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
