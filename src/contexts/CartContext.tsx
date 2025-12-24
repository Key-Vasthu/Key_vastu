import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Book, CartItem } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addToCart: (book: Book) => void;
  removeFromCart: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (bookId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [lastUserId, setLastUserId] = useState<string | null>(null);

  // Clear cart when user changes (including guest login)
  useEffect(() => {
    if (user) {
      // If user changed, clear the cart
      if (lastUserId !== null && lastUserId !== user.id) {
        setItems([]);
        localStorage.removeItem('keyvasthu_cart');
      }
      // For guest users, always start with empty cart
      if (user.role === 'guest') {
        setItems([]);
        localStorage.removeItem('keyvasthu_cart');
      } else if (lastUserId === null || lastUserId === user.id) {
        // Load cart for this user only if it's the same user
        const stored = localStorage.getItem('keyvasthu_cart');
        if (stored) {
          try {
            setItems(JSON.parse(stored));
          } catch {
            setItems([]);
          }
        }
      }
      setLastUserId(user.id);
    } else {
      // User logged out, clear cart
      setItems([]);
      localStorage.removeItem('keyvasthu_cart');
      setLastUserId(null);
    }
  }, [user, lastUserId]);

  // Persist cart to localStorage (only for non-guest users)
  useEffect(() => {
    if (user && user.role !== 'guest') {
      if (items.length > 0) {
        localStorage.setItem('keyvasthu_cart', JSON.stringify(items));
      } else {
        localStorage.removeItem('keyvasthu_cart');
      }
    }
  }, [items, user]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.book.price * item.quantity, 0);

  const addToCart = useCallback((book: Book) => {
    setItems(prev => {
      const existing = prev.find(item => item.book.id === book.id);
      if (existing) {
        return prev.map(item =>
          item.book.id === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { book, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((bookId: string) => {
    setItems(prev => prev.filter(item => item.book.id !== bookId));
  }, []);

  const updateQuantity = useCallback((bookId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(bookId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.book.id === bookId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback((bookId: string) => {
    return items.some(item => item.book.id === bookId);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalAmount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

