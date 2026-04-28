'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export default function Header({ onSearch, searchValue: externalSearchValue, onSearchChange }: HeaderProps) {
  const [internalSearchValue, setInternalSearchValue] = useState('');
  const { state, toggleCart } = useCart();
  
  const searchValue = externalSearchValue !== undefined ? externalSearchValue : internalSearchValue;
  
  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setInternalSearchValue(value);
    }
  };
  
  const handleSearch = () => {
    if (onSearch && searchValue.trim()) {
      onSearch(searchValue.trim());
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <header className="w-full">
      {/* Banner Promocional */}
      <div className="bg-[#9bdcd2] text-black text-center py-3 px-9 text-sm relative">
        <span className="font-thin">Sale Sunday: Bis zu -55% auf über 350 Topseller!</span>
        <span className="ml-2 text-xs opacity-75">ℹ️</span>
      </div>

      {/* Header Principal */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Menu Hamburger (Mobile) */}
            <button className="lg:hidden flex items-center text-gray-600 hover:text-black">
              <div className="flex flex-col items-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-xs mt-1">Menü</span>
              </div>
            </button>

            {/* Logo Douglas */}
            <div className="flex-1 flex justify-center lg:flex-none lg:justify-start">
              <Link href="/" className="flex items-center py-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="#000" viewBox="1 0 129 25" className="h-8 w-auto max-w-[130px]">
                  <path fillRule="evenodd" d="M68.201 15.025v-2.14l13.308-.001c.067 6.289-4.57 10.972-11.04 10.972-6.837 0-11.64-4.965-11.64-11.942C58.83 5.156 63.8.038 70.47.038c4.937 0 9.039 2.81 10.44 7.326h-2.435C77.14 4.086 74.138 2.18 70.469 2.18c-5.47 0-9.371 4.08-9.371 9.734 0 5.673 3.835 9.735 9.371 9.735 4.37 0 7.671-2.643 8.505-6.624H68.201Zm-49.06-13.18A11.468 11.468 0 0 1 25.378.04c6.703 0 11.739 5.118 11.739 11.91 0 6.79-5.036 11.909-11.74 11.909-6.77 0-11.672-5.018-11.672-11.91a12.018 12.018 0 0 1 1.767-6.322c.61.444 1.131 1 1.534 1.639a10.62 10.62 0 0 0-1.033 4.683c0 5.654 3.935 9.702 9.405 9.702 5.536 0 9.472-4.048 9.472-9.702 0-5.687-3.936-9.768-9.472-9.768a9.521 9.521 0 0 0-4.703 1.171 9.348 9.348 0 0 0-1.534-1.505Zm34.886 15.523c.25-.927.373-1.884.367-2.844V.508h2.268v14.184c0 1.17-.166 2.609-.467 3.545-1.134 3.48-3.969 5.62-8.238 5.62-4.27 0-7.137-2.074-8.238-5.553a13.001 13.001 0 0 1-.5-3.546V.508h2.268v14.016c-.006.96.117 1.917.366 2.844.8 2.743 3.069 4.282 6.07 4.282 3.035 0 5.304-1.54 6.104-4.282Zm-39.155 2.977a8.705 8.705 0 0 1-1.935.602 17.575 17.575 0 0 1-3.635.302H2.398V2.615h6.904a17.573 17.573 0 0 1 3.635.302c4.37.936 6.77 4.114 6.77 9.032a11.16 11.16 0 0 1-.933 4.683c.408.654.915 1.24 1.5 1.74 1.101-1.807 1.702-4.014 1.702-6.423 0-5.954-3.135-9.902-8.472-11.073A17.67 17.67 0 0 0 9.636.508H.13V23.39h9.506c1.297.03 2.595-.082 3.868-.334a11.244 11.244 0 0 0 2.868-1.037 7.186 7.186 0 0 1-1.5-1.673ZM120.764 9.94l2.402 1.171c2.467 1.204 4.834 2.845 4.834 6.491 0 3.646-2.601 6.256-6.503 6.256-4.002 0-6.87-2.342-7.237-7.393h2.269c.4 3.645 2.335 5.184 5.003 5.184 2.467 0 4.135-1.606 4.135-3.947 0-2.342-1.568-3.647-3.302-4.45l-2.434-1.138c-2.83-1.32-4.636-3.228-4.636-6.22 0-3.28 2.468-5.855 6.037-5.855 3.234 0 5.802 1.974 6.203 6.39H125.4c-.366-2.643-1.701-4.316-4.069-4.316-2.301 0-3.769 1.539-3.769 3.68 0 1.921 1.16 3.152 3.202 4.147ZM103.321.508l-8.838 22.881h2.535l2.701-7.258h9.405l2.735 7.258h2.602L105.589.508h-2.268Zm-2.802 13.48h7.805l-2.602-7.024a81.731 81.731 0 0 1-1.3-3.714c-.4 1.238-.801 2.476-1.268 3.714l-2.635 7.025ZM85.945.509h-2.268v22.881h9.138l.9-2.14h-7.77V.507Z" clipRule="evenodd"/>
                </svg>
              </Link>
            </div>

            {/* Barra de Pesquisa Desktop */}
            <div className="hidden lg:flex flex-1 max-w-xl mx-6">
              <div className="relative w-full">
                <input
                  type="text"
                  className="w-full h-12 px-5 pr-14 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:bg-white focus:border-gray-300 focus:shadow-md text-sm placeholder-gray-500 transition-all duration-300 hover:bg-white hover:shadow-sm"
                  placeholder="Hallo, wonach suchst du?"
                  value={searchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                  onClick={handleSearch}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Ícones do Header */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              
              {/* Ícone de Conta - Hidden on mobile */}
              <button className="hidden lg:flex items-center p-2 text-gray-600 hover:text-black">
                <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.76088 15.9487C6.68441 17.2157 6 19.0932 6 21.5C6 21.7761 5.77614 22 5.5 22C5.22386 22 5 21.7761 5 21.5C5 18.9068 5.73872 16.7843 6.99881 15.3013C8.26296 13.8134 10.0277 13 12 13C13.9723 13 15.737 13.8134 17.0012 15.3013C18.2613 16.7843 19 18.9068 19 21.5C19 21.7761 18.7761 22 18.5 22C18.2239 22 18 21.7761 18 21.5C18 19.0932 17.3156 17.2157 16.2391 15.9487C15.1667 14.6866 13.6815 14 12 14C10.3185 14 8.8333 14.6866 7.76088 15.9487Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
                  <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11ZM17 7C17 9.76142 14.7614 12 12 12C9.23858 12 7 9.76142 7 7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
                </svg>
              </button>

              {/* Ícone de Wishlist */}
              <button className="flex items-center p-1 lg:p-2 text-gray-600 hover:text-black">
                <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.01191 4.24463C8.10537 3.84166 7.10982 3.96757 6.19918 4.42168C4.49786 5.27006 2.66614 8.42121 5.39465 12.7198C6.515 14.4849 7.94078 16.1508 9.24158 17.4684C10.373 18.6144 11.3854 19.4723 12 19.9007C12.6146 19.4723 13.627 18.6144 14.7584 17.4684C16.0592 16.1508 17.485 14.4849 18.6053 12.7198C21.3339 8.42121 19.5021 5.27006 17.8008 4.42168C16.8902 3.96758 15.8947 3.84167 14.9881 4.24463C14.0803 4.64814 13.1486 5.6322 12.4762 7.6379C12.4077 7.84217 12.216 7.97989 12 7.97989C11.784 7.97989 11.5923 7.84217 11.5238 7.6379C10.8514 5.6322 9.91968 4.64814 9.01191 4.24463ZM12 6.12744C11.3129 4.67691 10.4233 3.77549 9.42073 3.32983C8.16614 2.77215 6.84791 2.97842 5.75008 3.52587C3.43449 4.68057 1.55112 8.53702 4.54614 13.2555C5.7152 15.0973 7.19098 16.8188 8.526 18.171C9.85267 19.5148 11.0729 20.5269 11.7409 20.9282C11.9003 21.0239 12.0997 21.0239 12.2591 20.9282C12.927 20.5269 14.1473 19.5148 15.474 18.171C16.809 16.8188 18.2848 15.0973 19.4539 13.2555C22.4489 8.53702 20.5655 4.68057 18.2499 3.52587C17.1521 2.97842 15.8339 2.77216 14.5793 3.32983C13.5767 3.77549 12.6872 4.67691 12 = 6.12744Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
                </svg>
              </button>

              {/* Ícone do Carrinho */}
              <button 
                onClick={toggleCart}
                className="flex items-center p-1 lg:p-2 text-gray-600 hover:text-black relative"
              >
                <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 8.5C10 8.77614 10.2239 9 10.5 9H13.5C13.7761 9 14 = 8.77614 14 8.5C14 8.22386 13.7761 8 13.5 8H10.5C10.2239 8 10 = 8.22386 10 8.5Z" fill="currentColor"/>
                  <path d="M17 8.5C17 8.77614 17.2239 9 17.5 9H18V21H6V9H6.5C6.77614 9 7 = 8.77614 7 8.5C7 8.22386 6.77614 8 6.5 8H6C5.44772 8 5 8.44772 5 9V21C5 21.5523 5.44772 22 6 22H18C18.5523 22 19 = 21.5523 19 21V9C19 8.44771 18.5523 8 18 = 8.5H17.5C17.2239 8 17 = 8.22386 17 8.5Z" fill="currentColor"/>
                  <path d="M8 6C8 3.79086 9.79086 2 12 2C14.2091 2 16 = 3.79086 16 6V12.5C16 12.7761 15.7761 13 15.5 13C15.2239 13 15 = 12.7761 15 12.5V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 = 4.34315 9 6V12.5C9 12.7761 8.77614 13 8.5 13C8.22386 13 8 = 12.7761 8 = 12.5V6Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
                </svg>
                {state.items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {state.items.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Pesquisa Mobile */}
        <div className="lg:hidden border-gray-200">
          <div className="relative">
            <input
              type="text"
              className="w-full h-14 px-6 pr-14 bg-gray-50 border-y border-gray-200 focus:outline-none focus:bg-white focus:border-gray-300 focus:shadow-md text-sm placeholder-gray-500 transition-all duration-300 hover:bg-white hover:shadow-sm"
              placeholder="Hallo, wonach suchst du?"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
              onClick={handleSearch}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Barra de Navegação Secundária */}
        <div className="hidden lg:block bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8 py-3">
              <a href="#" className="text-sm font-medium text-gray-900 hover:text-black border-b-2 border-black pb-3">
                Parfum
              </a>
              <a href="#" className="text-sm font-medium text-gray-700 hover:text-black pb-3">
                Make-up
              </a>
              <a href="#" className="text-sm font-medium text-gray-700 hover:text-black pb-3">
                Pflege
              </a>
              <a href="#" className="text-sm font-medium text-gray-700 hover:text-black pb-3">
                Haare
              </a>
              <a href="#" className="text-sm font-medium text-gray-700 hover:text-black pb-3">
                Apotheke
              </a>
              <a href="#" className="text-sm font-medium text-gray-700 hover:text-black pb-3">
                Marken
              </a>
              <a href="#" className="text-sm font-medium text-gray-700 hover:text-black pb-3">
                Geschenke
              </a>
              <a href="#" className="text-sm font-medium text-red-600 hover:text-red-700 pb-3">
                Sale %
              </a>
            </nav>
          </div>
        </div>
      </header>
  );
}