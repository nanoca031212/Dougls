/**
 * Utilitários para manipulação de dados de produtos
 * Funções helper para handlers de página de produto
 */

import productsData from '../data/products.json';

// Tipos TypeScript
export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  brands: string[];
  primary_brand: string;
  category: {
    name: string;
    type: string;
    gender: string;
    description: string;
  };
  tags: string[];
  images: string[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  variants: Array<{
    id: string;
    title: string;
    price: number;
    available: boolean;
    inventory: number;
    weight: string;
  }>;
  availability: {
    in_stock: boolean;
    shipping_time: string;
    shipping_countries: string[];
  };
  promotion: {
    type: string;
    description: string;
    discount_percentage: number;
    valid_until: string;
  };
  metafields?: {
    'internal.id'?: string;
    'internal.brands'?: string;
    'internal.primary_brand'?: string;
    'internal.category'?: string;
    'internal.country'?: string;
    'internal.language'?: string;
    'seo.meta_title'?: string;
    'seo.meta_description'?: string;
    'seo.keywords'?: string;
  };
}

export interface ProductsData {
  metadata: {
    generated_at: string;
    total_products: number;
    total_brands: number;
    total_categories: number;
    currency: string;
    country: string;
    language: string;
  };
  products: Product[];
  indexes: {
    by_handle: Record<string, number>;
    by_brand: Record<string, string[]>;
    by_category: Record<string, string[]>;
  };
  categories: string[];
  brands: string[];
}

// Cast dos dados importados
const data = productsData as ProductsData;

/**
 * Busca produto por handle/slug
 */
export function getProductByHandle(handle: string): Product | null {
  const index = data.indexes.by_handle[handle];
  if (index !== undefined && data.products[index]) {
    return data.products[index];
  }
  return null;
}

/**
 * Busca produtos por marca
 */
export function getProductsByBrand(brand: string): Product[] {
  const handles = data.indexes.by_brand[brand];
  if (!handles) return [];
  
  return handles
    .map(handle => getProductByHandle(handle))
    .filter((product): product is Product => product !== null);
}

/**
 * Busca produtos por categoria
 */
export function getProductsByCategory(category: string): Product[] {
  const handles = data.indexes.by_category[category];
  if (!handles) return [];
  
  return handles
    .map(handle => getProductByHandle(handle))
    .filter((product): product is Product => product !== null);
}

/**
 * Busca produtos por gênero
 */
export function getProductsByGender(gender: 'men' | 'women' | 'unisex'): Product[] {
  return data.products.filter(product => 
    product.category.gender === gender
  );
}

/**
 * Busca produtos por tipo
 */
export function getProductsByType(type: 'set' | 'fragrance'): Product[] {
  return data.products.filter(product => 
    product.category.type === type
  );
}

/**
 * Busca produtos por texto (título, descrição, marcas)
 */
export function searchProducts(products: Product[], query: string): Product[] {
  const searchTerm = query.toLowerCase();
  
  return products.filter(product => {
    const searchableText = [
      product.title,
      product.description,
      ...product.brands,
      ...product.tags,
      product.category.name
    ].join(' ').toLowerCase();
    
    return searchableText.includes(searchTerm);
  });
}

/**
 * Obtém produtos relacionados (mesma marca ou categoria)
 */
export function getRelatedProducts(productHandle: string, limit: number = 4): Product[] {
  const product = getProductByHandle(productHandle);
  if (!product) return [];
  
  // Buscar por marca principal primeiro
  let related = getProductsByBrand(product.primary_brand)
    .filter(p => p.handle !== productHandle);
  
  // Se não tiver suficientes, buscar por categoria
  if (related.length < limit) {
    const byCategory = getProductsByCategory(product.category.name)
      .filter(p => p.handle !== productHandle && 
                   !related.some(r => r.handle === p.handle));
    
    related = [...related, ...byCategory];
  }
  
  return related.slice(0, limit);
}

/**
 * Obtém todos os produtos
 */
export function getAllProducts(): Product[] {
  return data.products;
}

/**
 * Obtém todas as marcas
 */
export function getAllBrands(): string[] {
  return data.brands.sort();
}

/**
 * Obtém todas as categorias
 */
export function getAllCategories(): string[] {
  return data.categories;
}

/**
 * Obtém metadados
 */
export function getMetadata() {
  return data.metadata;
}

/**
 * Gera paths estáticos para Next.js
 */
export function getStaticPaths() {
  return data.products.map(product => ({
    params: { handle: product.handle }
  }));
}

/**
 * Formata preço para exibição
 */
export function formatPrice(price: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency
  }).format(price);
}

/**
 * Verifica se produto está em promoção
 */
export function isOnPromotion(product: Product): boolean {
  if (!product.promotion) return false;
  
  const validUntil = new Date(product.promotion.valid_until);
  const now = new Date();
  
  return validUntil > now;
}

// Interface para filtros
export interface FilterState {
  categories: string[];
  brands: string[];
  gender: string[];
  priceRange: { min: number; max: number } | null;
  promotion: boolean;
}

// Função para filtrar produtos baseado nos filtros selecionados
export function filterProducts(products: Product[], filters: FilterState): Product[] {
  return products.filter(product => {
    // Filtro por categoria especial (bundle)
    if (filters.categories.length > 0) {
      if (filters.categories.includes('bundle')) {
        // Para bundles, filtrar produtos que contêm "3-piece", "set", "kit" ou "bundle" no título
        const isBundleProduct = product.title.toLowerCase().includes('3-piece') ||
                               product.title.toLowerCase().includes('set') ||
                               product.title.toLowerCase().includes('kit') ||
                               product.title.toLowerCase().includes('bundle') ||
                               product.category.type === 'set';
        if (!isBundleProduct) {
          return false;
        }
      } else if (!filters.categories.includes(product.category.name)) {
        return false;
      }
    }
    
    // Filtro por marca
    if (filters.brands.length > 0 && !filters.brands.includes(product.primary_brand)) {
      return false;
    }
    
    // Filtro por gênero
    if (filters.gender.length > 0 && !filters.gender.includes(product.category.gender)) {
      return false;
    }
    
    // Filtro por promoção
    if (filters.promotion && !isOnPromotion(product)) {
      return false;
    }
    
    // Filtro por faixa de preço (se implementado)
    if (filters.priceRange && product.price > 0) {
      if (product.price < filters.priceRange.min || product.price > filters.priceRange.max) {
        return false;
      }
    }
    
    return true;
  });
}

// Função para obter valores únicos de uma propriedade dos produtos
export function getUniqueValues(products: Product[], property: string): string[] {
  const values = new Set<string>();
  
  products.forEach(product => {
    const value = getNestedProperty(product, property);
    if (value && typeof value === 'string') {
      values.add(value);
    }
  });
  
  return Array.from(values).sort();
}

// Função auxiliar para acessar propriedades aninhadas
function getNestedProperty(obj: Product | Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    return current && typeof current === 'object' && key in (current as Record<string, unknown>)
      ? (current as Record<string, unknown>)[key]
      : undefined;
  }, obj as Record<string, unknown>);
}

/**
 * Calcula preço com desconto
 */
export function getDiscountedPrice(product: Product): number {
  if (!isOnPromotion(product)) return product.price;
  
  const discount = product.promotion.discount_percentage / 100;
  return product.price * (1 - discount);
}

/**
 * Gera URL canônica do produto
 */
export function getProductUrl(handle: string, baseUrl: string = ''): string {
  return `${baseUrl}/products/${handle}`;
}

/**
 * Gera dados estruturados JSON-LD para SEO
 */
export function generateProductJsonLd(product: Product, baseUrl: string = ''): object {
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.title,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": product.primary_brand
    },
    "category": product.category.description,
    "image": product.images.map(img => `${baseUrl}${img}`),
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": product.currency,
      "availability": product.availability.in_stock 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Piska Perfumes"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127"
    }
  };
}

// Carrega dados dos produtos do JSON
export function loadProductData(): ProductsData | null {
  try {
    return data;
  } catch (error) {
    console.error('Erro ao carregar dados dos produtos:', error);
    return null;
  }
}

// Alias para loadProductData (compatibilidade)
export function getProductData(): ProductsData | null {
  return loadProductData();
}

const productUtils = {
  getProductByHandle,
  getProductsByBrand,
  getProductsByCategory,
  getProductsByGender,
  getProductsByType,
  filterProducts,
  searchProducts,
  getRelatedProducts,
  getAllProducts,
  getAllBrands,
  getAllCategories,
  getMetadata,
  getStaticPaths,
  formatPrice,
  isOnPromotion,
  getDiscountedPrice,
  getProductUrl,
  generateProductJsonLd,
  loadProductData,
  getProductData
};

export default productUtils;