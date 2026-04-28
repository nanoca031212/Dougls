'use client';

import { useState, useEffect } from 'react';
import { getProductData, getUniqueValues, FilterState } from '../utils/products';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export default function FilterSidebar({ isOpen, onClose, filters, onFiltersChange }: FilterSidebarProps) {
  const [availableFilters, setAvailableFilters] = useState({
    categories: [] as string[],
    brands: [] as string[],
    genders: [] as string[],
    types: [] as string[],
    priceRange: { min: 0, max: 1000 }
  });

  useEffect(() => {
    const data = getProductData();
    if (data) {
      const categories = getUniqueValues(data.products, 'category.name');
      const brands = getUniqueValues(data.products, 'primary_brand');
      const genders = getUniqueValues(data.products, 'category.gender');
      const types = getUniqueValues(data.products, 'category.type');
      
      // Calcular faixa de preços
      const prices = data.products.map(p => p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      setAvailableFilters({
        categories,
        brands,
        genders,
        types,
        priceRange: { min: minPrice, max: maxPrice }
      });
    }
  }, []);

  const handleCategoryChange = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleBrandChange = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand];
    
    onFiltersChange({ ...filters, brands: newBrands });
  };

  const handleGenderChange = (gender: string) => {
    const newGenders = filters.gender.includes(gender)
      ? filters.gender.filter(g => g !== gender)
      : [...filters.gender, gender];
    
    onFiltersChange({ ...filters, gender: newGenders });
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    onFiltersChange({ ...filters, priceRange: { min, max } });
  };

  const handlePromotionChange = () => {
    onFiltersChange({ ...filters, promotion: !filters.promotion });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      brands: [],
      gender: [],
      priceRange: null,
      promotion: false
    });
  };

  const getActiveFiltersCount = () => {
    return filters.categories.length + 
           filters.brands.length + 
           filters.gender.length + 
           (filters.priceRange ? 1 : 0) + 
           (filters.promotion ? 1 : 0);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg z-50 overflow-y-auto border-l border-gray-100">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Filter</h2>
              {getActiveFiltersCount() > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {getActiveFiltersCount()} Filter aktiv
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Clear All Filters */}
          {getActiveFiltersCount() > 0 && (
            <button
              onClick={clearAllFilters}
              className="w-full mb-6 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Filter löschen
            </button>
          )}

          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Kategorien</h3>
            <div className="space-y-2">
              {availableFilters.categories.map(category => (
                <label key={category} className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Marken</h3>
            <div className="max-h-48 overflow-y-auto">
              <div className="space-y-2">
                {availableFilters.brands.map(brand => (
                  <label key={brand} className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.brands.includes(brand)}
                      onChange={() => handleBrandChange(brand)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">{brand}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Gender */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Geschlecht</h3>
            <div className="space-y-2">
              {availableFilters.genders.map(gender => (
                <label key={gender} className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.gender.includes(gender)}
                    onChange={() => handleGenderChange(gender)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                    {gender === 'men' ? 'Herren' : gender === 'women' ? 'Damen' : 'Unisex'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Preisspanne</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">Minimum</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={filters.priceRange?.min || availableFilters.priceRange.min}
                      onChange={(e) => handlePriceRangeChange(
                        Number(e.target.value),
                        filters.priceRange?.max || availableFilters.priceRange.max
                      )}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-center w-6 h-6 mt-5">
                  <div className="w-2 h-0.5 bg-gray-400"></div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">Maximum</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                    <input
                      type="number"
                      placeholder="1000"
                      value={filters.priceRange?.max || availableFilters.priceRange.max}
                      onChange={(e) => handlePriceRangeChange(
                        filters.priceRange?.min || availableFilters.priceRange.min,
                        Number(e.target.value)
                      )}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 text-center">
                Bereich: €{availableFilters.priceRange.min} - €{availableFilters.priceRange.max}
              </div>
            </div>
          </div>

          {/* Promotion */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Angebote</h3>
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.promotion}
                onChange={handlePromotionChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">Nur Angebote</span>
            </label>
          </div>

          {/* Apply Button */}
          <div className="sticky bottom-0 bg-white pt-4 -mx-6 px-6 border-t border-gray-100">
            <button
              onClick={onClose}
              className="w-full bg-white text-black border border-black py-3 px-5 font-medium hover:bg-black hover:text-white transition-colors"
            >
              Filter anwenden
            </button>
          </div>
        </div>
      </div>
    </>
  );
}