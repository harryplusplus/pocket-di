import type { Injectable } from './injectable.ts'
import {
  type InferableToken,
  type InferInjectable,
  type InjectionToken,
  isPlainToken,
  type PlainToken,
  token,
  type TypedToken,
} from './token.ts'

export interface ValueProviderInput<
  T extends InjectionToken = InjectionToken,
  I extends Injectable = InferInjectable<T>,
  C extends I = I,
> {
  provide: T
  useValue: C
}

export interface ValueProvider<
  T extends InferableToken = InferableToken,
  I extends Injectable = InferInjectable<T>,
  C extends I = I,
> {
  provide: T
  useValue: C
}

function defineValueProvider<T extends PlainToken, I extends Injectable>(
  provider: ValueProviderInput<T, I, I>,
): ValueProvider<TypedToken<I>, I, I>

function defineValueProvider<
  T extends InferableToken,
  C extends InferInjectable<T>,
>(
  provider: ValueProviderInput<T, InferInjectable<T>, C>,
): ValueProvider<T, InferInjectable<T>, C>

function defineValueProvider(provider: ValueProviderInput): ValueProvider {
  const { provide, ...rest } = provider
  if (isPlainToken(provide)) {
    return { provide: token(provide), ...rest }
  }

  return { provide, ...rest }
}

export { defineValueProvider }
