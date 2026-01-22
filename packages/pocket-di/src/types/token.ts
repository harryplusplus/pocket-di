import type { Injectable } from './injectable.ts'

export type Key = string

export interface Token<K extends Key = Key, I extends Injectable = Injectable> {
  key: K
  _type: I
}

export function token<I extends Injectable>(): <K extends Key>(
  key: K,
) => Token<K, I> {
  return (key) => {
    return { key, _type: undefined as unknown as I }
  }
}

export type ExtractKey<T extends Token> = T['key']

export type ExtractType<T extends Token> = T['_type']

export type Tokens = readonly Token[]

export type TypeInfo = Record<Key, Injectable>

export type ToTypeInfo<Ts extends Tokens> = {
  [T in Ts[number] as ExtractKey<T>]: ExtractType<T>
}
