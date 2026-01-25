export type Include = 'local' | 'parent'

export interface FindOptions {
  include?: Include[]
}

const DEFAULT_INCLUDE: Include[] = ['local', 'parent']

export class Registry<K, V> {
  private readonly map = new Map<K, V>()
  private parent: Registry<K, V> | null

  constructor(parent?: Registry<K, V>) {
    this.parent = parent ?? null
  }

  clear(): void {
    this.map.clear()
    this.parent = null
  }

  find(key: K, options?: FindOptions): V | undefined {
    const { include = DEFAULT_INCLUDE } = options ?? {}
    const includeSet = new Set(include)

    if (includeSet.has('local')) {
      const value = this.map.get(key)
      if (value) {
        return value
      }
    }

    if (this.parent && includeSet.has('parent')) {
      const value = this.parent.find(key)
      if (value) {
        return value
      }
    }

    return undefined
  }

  set(key: K, value: V): void {
    this.map.set(key, value)
  }

  entries(): MapIterator<[K, V]> {
    return this.map.entries()
  }

  values(): MapIterator<V> {
    return this.map.values()
  }
}
