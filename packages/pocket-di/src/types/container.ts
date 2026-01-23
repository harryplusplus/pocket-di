import type { ContainerHandler } from '../container-handler.ts'
import type { ContainerImpl } from '../container-impl.ts'
import type { Injectable } from './injectable.ts'
import type { ExtractTokens, Providers } from './provider.ts'
import type { ExtractKey, ExtractType, Key, Tokens } from './token.ts'

export type ContainerType = Record<Key, Injectable>

export type ToContainerType<Ts extends Tokens> = {
  [T in Ts[number] as ExtractKey<T>]: ExtractType<T>
}

export type ExtractContainerType<Ps extends Providers> = ToContainerType<
  ExtractTokens<Ps>
>

export type ContainerPublicProperties<T extends ContainerType = ContainerType> =
  Pick<ContainerImpl<T>, '$createChild' | '$destroy'>

export type ContainerHandlers<T extends ContainerType = ContainerType> = {
  [K in keyof T]: ContainerHandler<T[K]>
}

export type Container<T extends ContainerType = ContainerType> =
  ContainerPublicProperties<T> & ContainerHandlers<T>
