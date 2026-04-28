'use client';

import React from 'react';

interface FilterButtonProps {
  onClick: () => void;
  className?: string;
}

const FilterButton: React.FC<FilterButtonProps> = ({ onClick, className = '' }) => {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center justify-center p-2 border border-gray-300 rounded-md hover:bg-gray-50 ${className}`}
      aria-label="Filtrar produtos"
    >
      {/* Ícone de filtro */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img">
        <path d="M18.95 7H21.5C21.7761 7 22 6.77614 22 6.5C22 6.22386 21.7761 6 21.5 6H18.95C18.7184 4.85888 17.7095 4 16.5 4C15.2905 4 14.2816 4.85888 14.05 6H2.5C2.22386 6 2 6.22386 2 6.5C2 6.77614 2.22386 7 2.5 7H14.05C14.2816 8.14112 15.2905 9 16.5 9C17.7095 9 18.7184 8.14112 18.95 7ZM16.5 8C15.6716 8 15 7.32843 15 6.5C15 5.67157 15.6716 5 16.5 5C17.3284 5 18 5.67157 18 6.5C18 7.32843 17.3284 8 16.5 8Z" fill="currentColor"/>
        <path d="M9.94999 12H21.5C21.7761 12 22 11.7761 22 11.5C22 11.2239 21.7761 11 21.5 11H9.94999C9.71836 9.85888 8.70948 9 7.5 9C6.29052 9 5.28164 9.85888 5.05001 11H2.5C2.22386 11 2 11.2239 2 11.5C2 11.7761 2.22386 12 2.5 12H5.05001C5.28164 13.1411 6.29052 14 7.5 14C8.70948 14 9.71836 13.1411 9.94999 12ZM7.5 13C6.67157 13 6 12.3284 6 11.5C6 10.6716 6.67157 10 7.5 10C8.32843 10 9 10.6716 9 11.5C9 12.3284 8.32843 13 7.5 13Z" fill="currentColor"/>
        <path d="M21.5 17H16.95C16.7184 18.1411 15.7095 19 14.5 19C13.2905 19 12.2816 18.1411 12.05 17H2.5C2.22386 17 2 16.7761 2 16.5C2 16.2239 2.22386 16 2.5 16H12.05C12.2816 14.8589 13.2905 14 14.5 14C15.7095 14 16.7184 14.8589 16.95 16H21.5C21.7761 16 22 16.2239 22 16.5C22 16.7761 21.7761 17 21.5 17ZM14.5 18C13.6716 18 13 17.3284 13 16.5C13 15.6716 13.6716 15 14.5 15C15.3284 15 16 15.6716 16 16.5C16 17.3284 15.3284 18 14.5 18Z" fill="currentColor"/>
      </svg>
    </button>
  );
};

export default FilterButton;