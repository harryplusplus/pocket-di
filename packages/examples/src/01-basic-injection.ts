// packages/examples/src/01-basic-injection.ts

import { createContainer, type InferConstructorParams, inject } from 'pocket-di'

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

// Dependency injection
class ProductService {
  // Declare dependencies using inject symbol (object form)
  static [inject] = { config: ConfigService, cache: CacheService }

  // Type inference works automatically
  constructor({ config, cache }: ProductServiceParams) {
    const apiUrl = config.get('api.url')
    console.log('ProductService initialized with API URL:', apiUrl)

    cache.set('products:init', 'true')
  }

  getProduct(id: number) {
    return { id, name: `Product ${id}` }
  }
}

// Type check
type ProductServiceParams = InferConstructorParams<typeof ProductService>
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
