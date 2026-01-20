// packages/examples/src/02-basic-record-injection.ts

import { createContainer, type InferDependencies, inject } from 'pocket-di'

// Basic services
class ConfigService {
  get(key: string) {
    return `config-value-for-${key}`
  }
}

class CacheService {
  set(key: string, value: string) {
    console.log(`[CACHE] Set ${key} = ${value}`)
  }

  get(key: string) {
    console.log(`[CACHE] Get ${key}`)
    return null
  }
}

// Record-style dependency injection
class ProductService {
  // Declare dependencies using inject symbol (object form)
  static [inject] = { config: ConfigService, cache: CacheService }

  // Type inference works automatically
  constructor(deps: InferDependencies<typeof ProductService>) {
    const apiUrl = deps.config.get('api.url')
    console.log('ProductService initialized with API URL:', apiUrl)

    deps.cache.set('products:init', 'true')
  }

  getProduct(id: number) {
    return { id, name: `Product ${id}` }
  }
}

// Type check
export type ProductServiceDeps = InferDependencies<typeof ProductService>
// Type: { config: ConfigService; cache: CacheService }

async function main() {
  console.log('=== Record Injection Example ===\n')

  const container = createContainer({
    providers: [ConfigService, CacheService, ProductService],
  })

  console.log('--- Async resolve ---')
  const productService1 = await container.resolve(ProductService)
  console.log('Product:', productService1.getProduct(1))

  console.log('\n--- Sync resolve ---')
  const productService2 = container.resolveSync(ProductService)
  console.log('Product:', productService2.getProduct(2))

  console.log('\nSame instance?', productService1 === productService2)

  await container.destroy()
}

void main()
