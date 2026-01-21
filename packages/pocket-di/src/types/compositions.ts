import type { Registry } from '../registry.ts'
import {
  type ClassProvider,
  classProviderToDeclaration,
} from './class-provider.ts'
import type { DependencyDeclaration } from './dependency-declaration.ts'
import {
  type FactoryProvider,
  factoryProviderToDeclaration,
} from './factory-provider.ts'
import type { Injectable } from './injectable.ts'
import type { InjectableConstructor } from './injectable-constructor.ts'
import { isClassProvider, type Provider } from './provider.ts'
import { plainToken } from './symbols.ts'
import { type InjectionToken, isTypedToken, type PlainToken } from './token.ts'

export type ProviderRegistry = Registry<RegistryKey, Provider>

export type SingletonRegistry = Registry<RegistryKey, Injectable>

export type ProviderHasDependencies = ClassProvider | FactoryProvider

export function providerToDeclaration(
  provider: ProviderHasDependencies,
): DependencyDeclaration {
  return isClassProvider(provider)
    ? classProviderToDeclaration(provider)
    : factoryProviderToDeclaration(provider)
}

export type DependencyRecord = Record<string, Injectable>

export function tokenToRegistryKey(
  token: InjectionToken,
): PlainToken | InjectableConstructor {
  return isTypedToken(token) ? token[plainToken] : token
}

export type RegistryKey = PlainToken | InjectableConstructor
