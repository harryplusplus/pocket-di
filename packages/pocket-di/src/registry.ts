export interface RegistryFindOptions {
  localOnly?: boolean
}

export class Registry<K, V> {
  map = new Map<K, V>()
  parent: Registry<K, V> | null

  constructor(parent?: Registry<K, V>) {
    this.parent = parent ?? null
  }

  clear(): void {
    this.map.clear()
    this.parent = null
  }

  find(key: K, options?: RegistryFindOptions): V | undefined {
    const { localOnly = false } = options ?? {}

    const value = this.map.get(key)
    if (value) {
      return value
    }

    if (localOnly) {
      return undefined
    }

    return this.parent?.find(key)
  }
}
