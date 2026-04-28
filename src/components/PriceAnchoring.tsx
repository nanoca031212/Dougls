"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export default function PriceAnchoring({ onBuyClick }: { onBuyClick?: () => void }) {
  const [carouselOffset, setCarouselOffset] = useState(0)

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselOffset(prev => {
        // Each item is 232px (200px + 32px margin)
        const itemWidth = 232
        // Move by 1px for smooth animation
        const newOffset = prev - 1
        // Reset when we've moved one full cycle
        const totalWidth = itemWidth * 11 // 11 unique images (per1 to per11)
        if (Math.abs(newOffset) >= totalWidth) {
          return 0
        }
        return newOffset
      })
    }, 20) // Update every 20ms for smooth animation

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white px-2 pt-4 pb-4">
      {/* Headline */}
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Sichern Sie sich Ihr exklusives Parfüm-Angebot
        </h2>
        <p className="text-gray-600 text-sm md:text-base">
          Beantworten Sie sechs kurze Fragen und sparen Sie bis zu 120 € — nur online verfügbar, für begrenzte Zeit.
        </p>
      </div>




      {/* New Temu-style Layout */}
      <div className="flex items-center justify-between mb-4">
        <div className="w-20 h-20 rounded-lg overflow-hidden border-1 border-[#20ca97]">
          <Image
            src="/3-caixas.jpg"
            alt="temu box"
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Originalpreis</p>
          <p className="text-lg line-through text-gray-500">€169.99</p>
        </div>
      </div>

      <div className="flex justify-between items-center py-2">
        <span className="text-sm text-gray-900 uppercase tracking-wide font-medium">ENDPREIS</span>
        <div className="text-right">
          <span className="block text-3xl font-semibold text-gray-900">€59.90</span>
          <span className="text-sm text-[#ca0d0d]">Sie sparen €120</span>
        </div>
      </div>

      <div className="border-t-2 border-[#13ce67] pt-6">
        <h3 className="text-center text-[#2c2c2c] text-2xl font-bold font-sans mb-2">Parfüms, die wir noch auf Lager haben:</h3>

        <div className="w-full overflow-hidden pb-4 mb-4">
          <div className="relative">
            <div
              className="flex transition-none"
              style={{
                transform: `translateX(${carouselOffset}px)`,
                width: '7656px' // Adjusted for 11 images: 11 * 232px * 3 cycles = 7656px
              }}
            >
              {/* Create infinite loop by repeating the pattern multiple times */}
              {Array.from({ length: 3 }, (_, cycleIndex) =>
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((item, index) => (
                  <div key={`${cycleIndex}-${index}`} className="flex-shrink-0 mr-8">
                    <div className="w-[200px] h-[200px] md:w-[200px] md:h-[200px] sm:w-[150px] sm:h-[150px]">
                      <Image
                        src={`/per${item}.png`}
                        alt={`Perfume ${item}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </div>
                ))
              ).flat()}
            </div>
          </div>
        </div>
      </div>



      {/* Price Breakdown */}
      <div className="space-y-4 mb-8">

        {/* Buy Now Button */}
        {onBuyClick && (
          <div className="mt-6">
            <button
              onClick={() => onBuyClick()}
              className="w-full bg-[#2ed418] hover:bg-[#33ff00] shadow-xl shadow-gray-500/35 hover:shadow-green-200 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Jetzt kaufen – Holen Sie sich dieses Parfüm-Set
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
