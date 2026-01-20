import type { Registry } from '../registry.ts'
import type { InjectDeclaration } from './inject-declaration.ts'
import type { Injectable } from './injectable.ts'
import {
  type ClassProvider,
  classProviderToDeclaration,
  type FactoryProvider,
  factoryProviderToDeclaration,
  isClassProvider,
  type Provider,
} from './provider.ts'
import type { InjectionToken } from './token.ts'

export type ProviderRegistry = Registry<InjectionToken, Provider>

export type SingletonRegistry = Registry<InjectionToken, Injectable>

export type ProviderHasDependencies = ClassProvider | FactoryProvider

export function providerToDeclaration(
  provider: ProviderHasDependencies,
): InjectDeclaration {
  return isClassProvider(provider)
    ? classProviderToDeclaration(provider)
    : factoryProviderToDeclaration(provider)
}

export type DependencyTuple = Injectable[]

export type DependencyRecord = Record<string, Injectable>

export type DependencyTupleOrRecord = DependencyTuple | DependencyRecord
