'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import CollectionTagsCarousel from '../../components/CollectionTagsCarousel';
import FilterButton from '../../components/FilterButton';
import FilterSidebar from '../../components/FilterSidebar';
import PerfumeInfo from '../../components/PerfumeInfo';
import Newsletter from '../../components/Newsletter';
import Footer from '../../components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { getProductData, filterProducts, formatPrice, FilterState, ProductsData, Product } from '../../utils/products';

export default function ProductsPage() {
  const [productData, setProductData] = useState<ProductsData | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    brands: [],
    gender: [],
    priceRange: null,
    promotion: false
  });

  useEffect(() => {
    const data = getProductData();
    if (data) {
      setProductData(data);
      setFilteredProducts(data.products);
    }
  }, []);

  // Função para aplicar todos os filtros (sidebar + tag)
  const applyAllFilters = (currentFilters: FilterState, currentTag: string | null) => {
    if (!productData) return;

    let filtered = productData.products;

    // Primeiro aplicar filtro de tag se houver
    if (currentTag) {
      filtered = filtered.filter(product => product.tags.includes(currentTag));
    }

    // Depois aplicar filtros do sidebar
    filtered = filterProducts(filtered, currentFilters);

    setFilteredProducts(filtered);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    applyAllFilters(newFilters, activeTag);
  };

  const handleTagFilter = (tag: string | null) => {
    setActiveTag(tag);
    applyAllFilters(filters, tag);
  };

  const handleFilterButtonClick = () => {
    setIsFilterSidebarOpen(true);
  };

  const totalProducts = productData ? productData.products.length : 0;
  const filteredCount = filteredProducts.length;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto sm:px-6 lg:px-8 pt-6">
        {/* Product Overview Headline */}
        <div className="product-overview__headline-container mb-6 pl-4">
          <div className="product-overview__headline-wrapper flex items-center gap-1 text-[1.2rem]">
            <div className="sr-only" role="heading" aria-level={1}>
              Parfüm & Düfte {totalProducts}
              <div className="sr-only-translation">ergebnisse</div>
            </div>
            <h1 
              aria-hidden="true" 
              data-testid="product-overview-headline" 
              className="font-thin text-black uppercase"
            >
              Parfüm & Düfte
            </h1>
            <span aria-hidden="true" className="font-thin text-gray-600">
              {filteredCount < totalProducts ? 
                `(${filteredCount.toLocaleString('de-DE')} von ${totalProducts.toLocaleString('de-DE')})` :
                `(${totalProducts.toLocaleString('de-DE')})`
              }
            </span>
          </div>
        </div>

        {/* Collection Tags Carousel with Filter Button */}
        <div className="mb-8 pl-4">
          <div className="flex items-center gap-3 mb-4">
            <CollectionTagsCarousel 
              onFilterChange={handleTagFilter}
            />
            <FilterButton 
              onClick={handleFilterButtonClick}
              className="ml-2"
            />
          </div>
        </div>

        {/* Filter Sidebar */}
        <FilterSidebar 
          isOpen={isFilterSidebarOpen}
          onClose={() => setIsFilterSidebarOpen(false)}
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
        
        {/* Products Grid */}
        <div className="mt-12 mb-8">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <Link 
                  key={product.id} 
                  href={`/products/${product.handle}`}
                  className="group"
                >
                  <div className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    {/* Product Image */}
                    <div className="aspect-square relative overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <div className="text-center p-4">
                            <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <p className="text-xs text-gray-800 font-medium">{product.brands}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Promotion Badge */}
                      {product.promotion && (
                        <div className="absolute top-2 left-2 bg-[#1f1f1f] text-white text-[10px] font-thin py-[0.2rem] px-[0.4rem]">
                          {product.promotion.description}
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-4">
                      {/* Brand */}
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        {product.primary_brand}
                      </p>
                      
                      {/* Title */}
                      <h3 className="font-thin text-[0.8rem] text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {product.title}
                      </h3>
                      
                      {/* Category */}
                      <p className="text-xs text-gray-400 mb-2">
                        {product.category.name}
                      </p>
                      
                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div>
                          {product.price > 0 ? (
                            <span className="text-lg font-thin font-[4px] text-gray-900">
                              {formatPrice(product.price, 'EUR')}
                            </span>
                          ) : (
                            <span className="text-sm font-medium text-green-600">
                              Sonderangebot
                            </span>
                          )}
                        </div>
                        
                        {/* Gender indicator */}
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {product.category.gender === 'unisex' ? 'Unisex' : 
                           product.category.gender === 'men' ? 'Herren' : 'Damen'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Produkte gefunden</h3>
              <p className="text-gray-500">Versuchen Sie, Ihre Filter zu ändern oder zu entfernen.</p>
            </div>
          )}
        </div>
      </main>

      {/* Seções de conteúdo */}
      <PerfumeInfo />
      <Newsletter />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}