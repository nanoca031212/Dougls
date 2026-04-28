'use client';

import React from 'react';
import { CartProvider } from '@/contexts/CartContext';
import Header from '@/components/Header';
import CartSidebar from '@/components/CartSidebar';

interface ClientWrapperProps {
  children: React.ReactNode;
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <CartProvider>
      <Header />
      <main>{children}</main>
      <CartSidebar />
    </CartProvider>
  );
}