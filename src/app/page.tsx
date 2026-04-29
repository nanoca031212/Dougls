'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import CategoryCarousel from '../components/CategoryCarousel';
import FilterSidebar from '../components/FilterSidebar';
import PerfumeInfo from '../components/PerfumeInfo';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { getProductData, filterProducts, searchProducts, formatPrice, FilterState, ProductsData, Product } from '../utils/products';
import { useBundle } from '@/contexts/BundleContext';
import { useSearchParams } from 'next/navigation';



export default function Home() {
  const [productData, setProductData] = useState<ProductsData | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const { isBundleActive, bundleSize, selectedItems, currentSlot, setCurrentSlot, setReturnToHandle, selectProduct, removeProduct, clearBundle } = useBundle();

  const searchParams = useSearchParams();

  // Sincronizar slot e returnTo da query string
  useEffect(() => {
    const slot = searchParams.get('bundleSlot');
    const returnTo = searchParams.get('returnTo');
    const bundleActive = searchParams.get('bundleActive');
    
    // Se navegou para a Home sem intenção de bundle, limpa o estado
    if (slot === null && bundleActive === null && isBundleActive) {
      // Pequeno delay para evitar conflito com redirecionamentos imediatos
      const timer = setTimeout(() => {
        clearBundle();
      }, 100);
      return () => clearTimeout(timer);
    }

    if (slot !== null) {
      setCurrentSlot(parseInt(slot));
    }
    if (returnTo !== null) {
      setReturnToHandle(returnTo);
    }
  }, [searchParams, isBundleActive, clearBundle, setCurrentSlot, setReturnToHandle]);




  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    brands: [],
    gender: [],
    priceRange: null,
    promotion: false
  });

  const applyFiltersAndSearch = useCallback((currentFilters: FilterState, query: string) => {
    if (productData) {
      let products = productData.products;

      // Aplicar pesquisa primeiro se houver query
      if (query.trim()) {
        products = searchProducts(products, query);
      }

      // Depois aplicar filtros
      const filtered = filterProducts(products, currentFilters);
      setFilteredProducts(filtered);
    }
  }, [productData]);

  // Load product data once on mount
  useEffect(() => {
    const data = getProductData();
    setProductData(data);
  }, []);

  // Apply filters whenever filters, searchQuery, or productData change
  useEffect(() => {
    applyFiltersAndSearch(filters, searchQuery);
  }, [productData, filters, searchQuery, applyFiltersAndSearch]);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    applyFiltersAndSearch(newFilters, searchQuery);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFiltersAndSearch(filters, query);
  };

  const totalProducts = productData ? productData.products.length : 0;
  const filteredCount = filteredProducts.length;

  return (
    <div className="min-h-screen bg-white">
      <Header
        onSearch={handleSearch}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className=''>
        <Image
          src="/bannersHeader/Banner_1.jpg"
          alt="Promotional banner for perfumes and fragrances"
          width={1200}
          height={400}
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto sm:px-6 lg:px-8 pt-6">

        {/* Product Overview Headline */}
        <div className="product-overview__headline-container mb-6 pl-4 ">
          <div className="product-overview__headline-wrapper flex items-center gap-1 text-[1.2rem]">
            <div className="sr-only" role="heading" aria-level={1}>
              Parfüm & Düfte {totalProducts}
              <div className="sr-only-translation">ergebnisse</div>
            </div>
            <h1
              aria-hidden="true"
              data-testid="product-overview-headline"
              className="font-ultra-thin text-black uppercase"
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

        {/* Category Carousel with Config Button */}
        <div className="mb-8 pl-4">
          <div className="flex items-center gap-1.5 mb-8">
            <button
              aria-haspopup="true"
              type="button"
              className="flex-shrink-0 flex items-center justify-center p-[0.6rem] border border-black hover:bg-gray-50 transition-colors"
              data-testid="menu-button-facets"
              aria-label="Filtros"
              onClick={() => setIsFilterSidebarOpen(true)}
            >
              <svg
                width="25"
                height="25"
                viewBox="0 0 25 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                role="img"
              >
                <path d="M18.95 7H21.5C21.7761 7 22 6.77614 22 6.5C22 6.22386 21.7761 6 21.5 6H18.95C18.7184 4.85888 17.7095 4 16.5 4C15.2905 4 14.2816 4.85888 14.05 6H2.5C2.22386 6 2 6.22386 2 6.5C2 6.77614 2.22386 7 2.5 7H14.05C14.2816 8.14112 15.2905 9 16.5 9C17.7095 9 18.7184 8.14112 18.95 7ZM16.5 8C15.6716 8 15 7.32843 15 6.5C15 5.67157 15.6716 5 16.5 5C17.3284 5 18 5.67157 18 6.5C18 7.32843 17.3284 8 16.5 8Z" fill="black" fillRule="evenodd" clipRule="evenodd" />
                <path d="M9.94999 12H21.5C21.7761 12 22 11.7761 22 11.5C22 11.2239 21.7761 11 21.5 11H9.94999C9.71836 9.85888 8.70948 9 7.5 9C6.29052 9 5.28164 9.85888 5.05001 11H2.5C2.22386 11 2 11.2239 2 11.5C2 11.7761 2.22386 12 2.5 12H5.05001C5.28164 13.1411 6.29052 14 7.5 14C8.70948 14 9.71836 13.1411 9.94999 12ZM7.5 13C6.67157 13 6 12.3284 6 11.5C6 10.6716 6.67157 10 7.5 10C8.32843 10 9 10.6716 9 11.5C9 12.3284 8.32843 13 7.5 13Z" fill="black" fillRule="evenodd" clipRule="evenodd" />
                <path d="M21.5 17H16.95C16.7184 18.1411 15.7095 19 14.5 19C13.2905 19 12.2816 18.1411 12.05 17H2.5C2.22386 17 2 16.7761 2 16.5C2 16.2239 2.22386 16 2.5 16H12.05C12.2816 14.8589 13.2905 14 14.5 14C15.7095 14 16.7184 14.8589 16.95 16H21.5C21.7761 16 22 16.2239 22 16.5C22 16.7761 21.7761 17 21.5 17ZM13 16.5C13 17.3284 13.6716 18 14.5 18C15.3284 18 16 17.3284 16 16.5C16 15.6716 15.3284 15 14.5 15C13.6716 15 13 15.6716 13 16.5Z" fill="black" fillRule="evenodd" clipRule="evenodd" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <CategoryCarousel
                onFiltersChange={handleFiltersChange}
              />
            </div>
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
            <div className="grid grid-cols-2 gap-[1.2px] md:gap-6">
              {filteredProducts.map((product) => {
                const handleProductClick = (e: React.MouseEvent) => {
                  if (isBundleActive) {
                    e.preventDefault();
                    selectProduct(product);
                  }
                };

                return (
                  <Link
                    key={product.id}
                    href={isBundleActive ? "#" : `/products/${product.handle}`}
                    onClick={handleProductClick}
                    className="group"
                  >
                    <div className="overflow-hidden hover:shadow-lg transition-shadow duration-300 relative">
                      {/* Product Image */}
                      <div className="aspect-square w-[100%] relative overflow-hidden">
                        <div className="absolute inset-0 bg-[#f5f5f5]"></div>
                        {product.images && product.images.length > 0 ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-full h-[100%] bg-[#f5f5f5] rounded-lg">
                              <Image
                                src={product.images[0]}
                                alt={product.title}
                                fill
                                sizes="(max-width: 768px) 50vw, 33vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-300 rounded-lg"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-[120%] flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
                              <div className="text-center p-4">
                                <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
                                  <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <p className="text-xs text-gray-800 font-medium">{product.primary_brand}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Bundle Select Overlay */}
                        {isBundleActive && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm uppercase">
                              Auswählen
                            </button>
                          </div>
                        )}

                        {/* Promotion Badge */}
                        {product.promotion && (
                          <div className="absolute top-3 left-3 bg-[#1f1f1f] text-white text-[10px] font-thin py-[0.2rem] px-[0.6rem]">
                            {product.promotion.description}
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="py-2 px-4">
                        {/* Brand */}
                        <p className="text-[14px] text-spacing-[0.01rem] font-spacing-tight font-thin text-gray-700 uppercase tracking-wide my-2">
                          {product.primary_brand}
                        </p>

                        {/* Title */}
                        <h3 className="font-thin text-[0.8rem] text-gray-800 line-clamp-3 group-hover:text-blue-600 transition-colors mt-[1px]">
                          {product.title}
                        </h3>

                        {/* Category */}
                        <p className="font-thin text-xs text-gray-400 mb-16 mt-[2px]">
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

                        <p className="text-xs text-gray-400 my-2">
                          100 ml |  <span className="text-xs text-gray-400 my-2">
                            50 ml / 24 €
                          </span>
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
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

        {/* Bundle Floating Indicator */}
        {isBundleActive && (
          <div className="fixed bottom-4 inset-x-4 md:left-auto md:inset-x-auto md:right-6 z-50 md:w-[320px] bg-white border border-gray-200 shadow-2xl rounded-2xl p-3 md:p-4 animate-slide-up">

            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div className="flex flex-col">
                <span className="text-[10px] md:text-xs font-bold uppercase text-gray-400">Bundle konfigurieren</span>
                <span className="text-xs md:text-sm font-bold text-gray-900">
                  {selectedItems.filter(i => i !== null).length} von {bundleSize} Düften ausgewählt
                </span>
              </div>
              <button 
                onClick={clearBundle}
                className="text-[10px] md:text-xs text-gray-500 underline"
              >
                Abbrechen
              </button>
            </div>
            <div className="flex gap-1.5 md:gap-2">
              {selectedItems.map((item, i) => {
                const firstEmpty = selectedItems.findIndex(item => item === null);
                const activeSlotIndex = firstEmpty !== -1 ? firstEmpty : currentSlot;
                
                return (
                  <div 
                    key={i} 
                    className={`relative flex-1 aspect-square rounded-lg border-2 flex items-center justify-center overflow-hidden ${
                      activeSlotIndex === i ? "border-black bg-gray-50" : "border-gray-100 bg-gray-50"
                    }`}
                  >

                  {item && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeProduct(i);
                      }}
                      className="absolute top-0 left-0 z-10 bg-red-500 shadow-md rounded-full p-0.5 hover:bg-red-600 transition-colors border border-red-700 text-white"
                      title="Entfernen"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  {item ? (
                    <div className="relative w-full h-full">
                      <Image src={item.images[0]} alt={item.title} fill className="object-contain p-1" />
                    </div>
                  ) : (
                    <span className="text-[10px] md:text-xs text-gray-300 font-bold">{i + 1}</span>
                  )}
                </div>

                  );
                })}

            </div>
          </div>
        )}

      </main>

      {/* Seções de conteúdo */}
      <PerfumeInfo />
      <Newsletter />

      {/* Footer */}
      <Footer />
    </div>
  );
}
