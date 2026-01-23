import type { Injectable } from './injectable.ts'
import { type Key, type Token, token } from './token.ts'
import type { Any } from './utils.ts'

export interface ValueProvider<
  K extends Key = Key,
  I extends Injectable = Any,
  C extends I = I,
> {
  token: Token<K, I>
  useValue: C
}

export interface InferableValueProvider<K extends Key, C extends Injectable> {
  provide: K
  useValue: C
}

export interface ValidatableValueProvider<
  K extends Key,
  I extends Injectable,
  C extends I,
> {
  provide: Token<K, I>
  useValue: C
}

function defineValueProvider<const K extends Key, C extends Injectable>(
  provider: InferableValueProvider<K, C>,
): ValueProvider<K, C, C>

function defineValueProvider<
  const K extends Key,
  I extends Injectable,
  C extends I,
>(provider: ValidatableValueProvider<K, I, C>): ValueProvider<K, I, C>

function defineValueProvider<
  const K extends Key,
  I extends Injectable,
  C extends I,
>(
  provider: InferableValueProvider<K, C> | ValidatableValueProvider<K, I, C>,
): ValueProvider<K, I, C> {
  const { provide, ...rest } = provider

  return {
    token: typeof provide === 'string' ? token<I>()(provide) : provide,
    ...rest,
  }
}

export { defineValueProvider }
