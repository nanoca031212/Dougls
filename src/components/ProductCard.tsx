'use client';

import Link from 'next/link';
import { Product, getDiscountedPrice } from '@/utils/products';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const discountPercentage = product.promotion?.discount_percentage;
  const currentPrice = getDiscountedPrice(product);

  // Safe extraction of size (e.g., "100 ml" from variant title)
  const sizeText = product.variants?.[0]?.title || '100 ml';
  const sizeNumber = parseFloat(sizeText.replace(/[^\d.]/g, '')) || 100;
  const pricePerLiter = (currentPrice / sizeNumber) * 1000;

  const isGift = product.tags?.includes('gift') || false;
  const isNew = product.tags?.includes('new') || false;

  return (
    <div className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 group relative">
      <Link href={`/products/${product.handle}`}>
        <div className="relative">
          {/* Product Image */}
          <div className="aspect-square bg-gray-50 flex items-center justify-center p-6">
            <div className="w-28 h-28 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-xs text-center">
                {product.primary_brand}<br />{product.title}
              </span>
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {discountPercentage && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                -{discountPercentage}%
              </span>
            )}
            {isGift && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                Geschenk
              </span>
            )}
            {/* NEU Badge for new products */}
            {isNew && (
              <span className="bg-black text-white text-xs px-2 py-1 rounded font-medium">
                NEU
              </span>
            )}
          </div>

          {/* Wishlist Button - Always visible */}
          <button className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Gesponsert Badge */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <span>Gesponsert</span>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Product Info */}
        <div className="px-4 pb-4">
          {/* Brand */}
          <div className="text-black font-medium text-sm mb-1">
            {product.primary_brand}
          </div>

          {/* Product Name */}
          <div className="text-gray-700 text-sm mb-1">
            {product.title}
          </div>

          {/* Product Type */}
          <div className="text-gray-500 text-sm mb-3">
            {product.category?.name || 'Fragrance'}
          </div>

          {/* Price */}
          <div className="mb-4">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-black font-medium text-lg">
                {currentPrice.toFixed(2)} €
              </span>
              {product.price !== currentPrice && (
                <span className="text-gray-400 line-through text-sm">
                  {product.price.toFixed(2)} €
                </span>
              )}
            </div>
            <div className="text-gray-500 text-xs">
              {sizeText} ({pricePerLiter.toFixed(2)} € / 1 l)
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;