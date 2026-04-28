'use client';

import { useState, useEffect, useMemo } from 'react';
import { getProductData } from '../utils/products';

interface CategoryCarouselProps {
  className?: string;
  onFiltersChange?: (filters: FilterState) => void;
}

interface FilterState {
  categories: string[];
  brands: string[];
  gender: string[];
  priceRange: { min: number; max: number } | null;
  promotion: boolean;
}

interface FilterOption {
  id: string;
  label: string;
  testId: string;
  options?: Array<{
    value: string;
    label: string;
    count: number;
  }>;
}

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({ 
  className = '', 
  onFiltersChange 
}) => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Categorias em alemão
  const filterOptions: FilterOption[] = useMemo(() => [
    {
      id: 'herren',
      label: 'Herren',
      testId: 'filter-herren',
      options: [{ value: 'men', label: 'Herrendüfte', count: 0 }]
    },
    {
      id: 'damen',
      label: 'Damen',
      testId: 'filter-damen',
      options: [{ value: 'women', label: 'Damendüfte', count: 0 }]
    },
    {
      id: 'paco-rabanne',
      label: 'Paco Rabanne',
      testId: 'filter-paco-rabanne',
      options: [{ value: 'Paco Rabanne', label: 'Paco Rabanne', count: 0 }]
    },
    {
      id: 'dior',
      label: 'Dior',
      testId: 'filter-dior',
      options: [{ value: 'Dior', label: 'Dior', count: 0 }]
    },
    {
      id: '3-fuer-1',
      label: '3 für 1',
      testId: 'filter-3-fuer-1',
      options: [{ value: 'bundle', label: '3 für 1 Sets', count: 0 }]
    }
  ], []);

  useEffect(() => {
    // Calcular contagem de produtos para cada categoria
    const productData = getProductData();
    if (productData) {
      filterOptions.forEach(category => {
        if (category.options) {
          category.options.forEach(option => {
            let count = 0;
            
            // Calcular contagem baseada no tipo de filtro
            if (category.id === 'herren') {
              count = productData.products.filter(p => p.category.gender === 'men').length;
            } else if (category.id === 'damen') {
              count = productData.products.filter(p => p.category.gender === 'women').length;
            } else if (category.id === 'paco-rabanne') {
              count = productData.products.filter(p => p.primary_brand === 'Paco Rabanne').length;
            } else if (category.id === 'dior') {
              count = productData.products.filter(p => p.primary_brand === 'Dior').length;
            } else if (category.id === '3-fuer-1') {
              count = productData.products.filter(p => p.title.toLowerCase().includes('3-piece')).length;
            }
            
            option.count = count;
          });
        }
      });
    }
  }, [filterOptions]);

  const handleCategoryClick = (categoryId: string) => {
    setActiveFilter(categoryId);
    
    const category = filterOptions.find(cat => cat.id === categoryId);
    if (!category || !onFiltersChange) return;

    // Criar novo estado de filtros baseado na categoria selecionada
    const newFilters: FilterState = {
      categories: [],
      brands: [],
      gender: [],
      priceRange: null,
      promotion: false
    };

    if (category.options && category.options.length > 0) {
      if (categoryId === 'herren') {
        newFilters.gender = ['men'];
      } else if (categoryId === 'damen') {
        newFilters.gender = ['women'];
      } else if (categoryId === 'paco-rabanne') {
        newFilters.brands = ['Paco Rabanne'];
      } else if (categoryId === 'dior') {
        newFilters.brands = ['Dior'];
      } else if (categoryId === '3-fuer-1') {
        newFilters.categories = ['bundle'];
      }
    }

    onFiltersChange(newFilters);
  };

  return (
    <div className={`flex gap-1 overflow-x-auto scrollbar-hide ${className}`}>
      {filterOptions.map((category) => {
        const isActive = activeFilter === category.id;
        const count = category.options?.[0]?.count || 0;
        
        return (
          <button
            key={category.id}
            type="button"
            className={`flex items-center gap-1 px-4 py-[1.02rem] text-sm font-thin border transition-all whitespace-nowrap ${
              isActive
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-700 border-black hover:bg-gray-50 hover:border-gray-400'
            }`}
            onClick={() => handleCategoryClick(category.id)}
          >
            <span>{category.label}</span>
            {count > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryCarousel;