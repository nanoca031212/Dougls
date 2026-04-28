'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/utils/products';

interface BundleContextType {
  isBundleActive: boolean;
  bundleSize: number;
  selectedItems: (Product | null)[];
  currentSlot: number | null;
  setCurrentSlot: (slot: number | null) => void;
  returnToHandle: string | null;
  setReturnToHandle: (handle: string | null) => void;
  startBundle: (size: number, initialProduct?: Product) => void;


  selectProduct: (product: Product) => void;
  removeProduct: (index: number) => void;
  clearBundle: () => void;
  isComplete: boolean;
}

const BundleContext = createContext<BundleContextType | undefined>(undefined);

export const BundleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBundleActive, setIsBundleActive] = useState(false);
  const [bundleSize, setBundleSize] = useState(3);
  const [selectedItems, setSelectedItems] = useState<(Product | null)[]>([]);
  const [currentSlot, setCurrentSlot] = useState<number | null>(null);
  const [returnToHandle, setReturnToHandle] = useState<string | null>(null);
  const router = useRouter();


  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('bundleConfig');
    if (saved) {
      const { size, items, active, slot } = JSON.parse(saved);
      setBundleSize(size);
      setSelectedItems(items);
      setIsBundleActive(active);
      setCurrentSlot(slot);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isBundleActive) {
      localStorage.setItem('bundleConfig', JSON.stringify({
        size: bundleSize,
        items: selectedItems,
        active: isBundleActive,
        slot: currentSlot
      }));
    } else {
      localStorage.removeItem('bundleConfig');
    }
  }, [isBundleActive, bundleSize, selectedItems, currentSlot]);

  const startBundle = (size: number, initialProduct?: Product) => {
    setBundleSize(size);
    const items = new Array(size).fill(null);
    if (initialProduct) {
      items[0] = initialProduct;
      setCurrentSlot(1);
    } else {
      setCurrentSlot(0);
    }
    setSelectedItems(items);
    setIsBundleActive(true);
    router.push('/');
  };

  const selectProduct = (product: Product) => {
    if (currentSlot === null) return;

    const newItems = [...selectedItems];
    newItems[currentSlot] = product;
    setSelectedItems(newItems);

    // Se estiver editando o primeiro perfume (slot 0), atualiza o returnToHandle
    if (currentSlot === 0) {
      setReturnToHandle(product.handle);
    }

    // Encontrar o próximo slot vazio
    const nextSlot = newItems.findIndex(item => item === null);
    if (nextSlot !== -1) {
      setCurrentSlot(nextSlot);
      router.push('/'); 
    } else {
      setCurrentSlot(null);
      const targetHandle = (currentSlot === 0 ? product.handle : returnToHandle) || newItems[0]?.handle;
      if (targetHandle) {
        router.push(`/products/${targetHandle}?bundleComplete=true`);
      }
    }
  };



  const removeProduct = (index: number) => {
    const newItems = [...selectedItems];
    newItems[index] = null;
    setSelectedItems(newItems);
    setCurrentSlot(index);
  };

  const clearBundle = () => {
    setIsBundleActive(false);
    setBundleSize(3);
    setSelectedItems([]);
    setCurrentSlot(null);
    localStorage.removeItem('bundleConfig');
  };

  const isComplete = selectedItems.every(item => item !== null);

  return (
    <BundleContext.Provider value={{
      isBundleActive,
      bundleSize,
      selectedItems,
      currentSlot,
      setCurrentSlot,
      returnToHandle,
      setReturnToHandle,
      startBundle,


      selectProduct,
      removeProduct,
      clearBundle,
      isComplete
    }}>
      {children}
    </BundleContext.Provider>
  );
};

export const useBundle = () => {
  const context = useContext(BundleContext);
  if (context === undefined) {
    throw new Error('useBundle must be used within a BundleProvider');
  }
  return context;
};
