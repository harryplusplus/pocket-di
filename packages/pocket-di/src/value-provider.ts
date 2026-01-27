/**
 * @file Provider that provides a value
 */

import type { Injectable } from './injectable.ts'
import {
  type HasTypeToken,
  type InjectionToken,
  type PlainToken,
} from './token.ts'

export interface ValueProvider<
  I extends Injectable = Injectable,
  C extends I = I,
> {
  provide: InjectionToken<I>
  useValue: C
}

export interface InferableValueProvider<C extends Injectable> {
  provide: PlainToken
  useValue: C
}

export interface ValidatableValueProvider<I extends Injectable, C extends I> {
  provide: HasTypeToken<I>
  useValue: C
}

function defineValueProvider<C extends Injectable>(
  provider: InferableValueProvider<C>,
): ValueProvider<C, C>

function defineValueProvider<I extends Injectable, C extends I>(
  provider: ValidatableValueProvider<I, C>,
): ValueProvider<I, C>

function defineValueProvider<I extends Injectable, C extends I>(
  provider: InferableValueProvider<C> | ValidatableValueProvider<I, C>,
): ValueProvider<I, C> {
  return provider
}

export { defineValueProvider }
