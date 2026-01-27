/**
 * @file Interface and utility functions to normalize providers into a unified format
 */

import type { ClassProvider } from './class-provider.ts'
import type { DependencyDeclaration } from './dependency-declaration.ts'
import type { FactoryProvider } from './factory-provider.ts'
import type { Injectable } from './injectable.ts'
import type { InjectableConstructor } from './injectable-constructor.ts'
import {
  isClassProvider,
  isFactoryProvider,
  isValueProvider,
  type Provider,
} from './provider.ts'
import { inject } from './symbols.ts'
import {
  type InjectionToken,
  isPlainToken,
  isTokenWithTypeToken,
} from './token.ts'
import type { MaybePromise } from './utils.ts'
import type { ValueProvider } from './value-provider.ts'

export interface NormalizedProvider {
  token: InjectionToken
  type: 'value' | 'class' | 'factory'
  scope: 'singleton' | 'transient'
  value?: Injectable
  classConstructor?: InjectableConstructor
  factory?: FactoryProvider['useFactory']
  inject?: DependencyDeclaration
  preDestroy?: (instance: Injectable) => MaybePromise<void>
}

export function normalizeProvider(provider: Provider): NormalizedProvider {
  if (isValueProvider(provider)) {
    return normalizeValueProvider(provider)
  }

  if (isClassProvider(provider)) {
    return normalizeClassProvider(provider)
  }

  if (isFactoryProvider(provider)) {
    return normalizeFactoryProvider(provider)
  }

  // Constructor provider (InjectableConstructor)
  return normalizeConstructorProvider(provider)
}

function normalizeValueProvider(provider: ValueProvider): NormalizedProvider {
  return {
    token: normalizeToken(provider.provide),
    type: 'value',
    scope: 'singleton',
    value: provider.useValue,
  }
}

function normalizeClassProvider(provider: ClassProvider): NormalizedProvider {
  const { inject, preDestroy } = extractClassMetadata(provider.useClass)

  return {
    token: normalizeToken(provider.provide),
    type: 'class',
    scope: provider.scope,
    classConstructor: provider.useClass,
    inject,
    preDestroy,
  }
}

function normalizeFactoryProvider(
  provider: FactoryProvider,
): NormalizedProvider {
  return {
    token: normalizeToken(provider.provide),
    type: 'factory',
    scope: provider.scope,
    factory: provider.useFactory,
    inject: provider.inject,
    preDestroy: provider.preDestroy,
  }
}

function normalizeConstructorProvider(
  provider: InjectableConstructor,
): NormalizedProvider {
  const { inject, preDestroy } = extractClassMetadata(provider)

  return {
    token: normalizeToken(provider),
    type: 'class',
    scope: 'singleton',
    classConstructor: provider,
    inject,
    preDestroy,
  }
}

function extractClassMetadata(constructor: InjectableConstructor): {
  inject: DependencyDeclaration
  preDestroy: ((instance: Injectable) => MaybePromise<void>) | undefined
} {
  // Use Object.prototype.hasOwnProperty to check for symbol property
  const hasInject = Object.prototype.hasOwnProperty.call(constructor, inject)
  const declaration = hasInject ? (constructor as any)[inject] : {}

  // preDestroy will be extracted later in lifecycle-events module
  const preDestroy = undefined

  return { inject: declaration, preDestroy }
}

export function normalizeToken(token: InjectionToken): InjectionToken {
  if (isPlainToken(token)) {
    return token
  }

  if (isTokenWithTypeToken(token)) {
    return token.token
  }

  // Constructor tokens are returned as-is
  return token
}
