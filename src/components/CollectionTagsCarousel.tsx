'use client';

import { useState, useEffect, useMemo } from 'react';
import { getProductData } from '../utils/products';

interface CollectionTagsCarouselProps {
  className?: string;
  onFilterChange?: (tag: string | null) => void;
}

const CollectionTagsCarousel: React.FC<CollectionTagsCarouselProps> = ({ 
  className = '', 
  onFilterChange 
}) => {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  
  // Mapeamento de tags para exibição em alemão
  const tagDisplayMap: Record<string, string> = useMemo(() => ({
    'herren': 'Herrendüfte',
    'männer': 'Männerdüfte', 
    'herrendüfte': 'Herrendüfte',
    'damen': 'Damendüfte',
    'frauen': 'Frauendüfte',
    'damendüfte': 'Damendüfte',
    'geschenkset': 'Geschenksets',
    'premium': 'Premium',
    'duft-set': 'Duft-Sets',
    'parfüm': 'Parfüms',
    'authentisch': 'Authentisch',
    'kollektion': 'Kollektionen',
    'deutschland': 'Deutschland',
    'geschenk': 'Geschenke',
    'luxus': 'Luxus',
    'bestseller': 'Bestseller',
    'neu': 'Neu',
    'limitiert': 'Limitierte Auflage',
    'unisex': 'Unisex'
  }), []);

  useEffect(() => {
    // Carregar dados dos produtos e extrair tags únicas
    const productData = getProductData();
    if (productData) {
      // Extrair todas as tags dos produtos e separá-las
      const allTagStrings = productData.products.flatMap(product => product.tags);
      const allIndividualTags = allTagStrings.flatMap(tagString => 
        tagString.split('|').map(tag => tag.trim())
      );
      
      // Filtrar tags relevantes para coleções (excluir marcas)
      const collectionTags = allIndividualTags.filter(tag => {
        const tagLower = tag.toLowerCase();
        return tagDisplayMap[tagLower] && 
               !tagLower.includes('-') && // Excluir marcas com hífen
               tagLower !== 'deutschland' && // Excluir tags muito genéricas
               tagLower !== 'authentisch';
      });
      
      const uniqueTags = [...new Set(collectionTags)];
      setTags(uniqueTags);
    }
  }, [tagDisplayMap]);

  const handleTagClick = (tag: string) => {
    const newTag = activeTag === tag ? null : tag;
    setActiveTag(newTag);
    onFilterChange?.(newTag);
  };

  return (
    <div className={`collection-tags-carousel ${className}`}>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {/* Tags de coleção */}
        {tags.map((tag) => {
          const displayName = tagDisplayMap[tag.toLowerCase()] || tag;
          return (
            <button
              key={tag}
              className={`px-4 py-2 whitespace-nowrap text-sm border rounded-md transition-colors ${
                activeTag === tag 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handleTagClick(tag)}
            >
              {displayName}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CollectionTagsCarousel;