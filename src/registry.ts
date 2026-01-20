export class Registry<K, V> {
  map = new Map<K, V>()
  parent: Registry<K, V> | null

  constructor(parent: Registry<K, V> | null) {
    this.parent = parent
  }

  clear(): void {
    this.map.clear()
    this.parent = null
  }

  find(key: K, options?: { localOnly?: boolean }): V | null {
    const { localOnly = false } = options ?? {}

    const value = this.map.get(key)
    if (value) {
      return value
    }

    if (localOnly) {
      return null
    }

    return this.parent?.find(key) ?? null
  }
}
