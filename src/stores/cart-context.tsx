"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState, useCallback, useMemo } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  bakeryId: string;
  bakeryName: string;
}

interface CartState {
  items: CartItem[];
  bakeryId: string | null;
  bakeryName: string | null;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> & { quantity?: number } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_BAKERY"; payload: { bakeryId: string; bakeryName: string } }
  | { type: "LOAD_FROM_STORAGE"; payload: CartState };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setBakery: (bakeryId: string, bakeryName: string) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemQuantity: (itemId: string) => number;
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const item = action.payload;

      // Si c'est une nouvelle boulangerie, vider le panier
      if (state.bakeryId && state.bakeryId !== item.bakeryId) {
        return {
          items: [{ ...item, quantity: item.quantity || 1 }],
          bakeryId: item.bakeryId,
          bakeryName: item.bakeryName,
        };
      }

      // Vérifier si l'article existe déjà
      const existingItemIndex = state.items.findIndex((i) => i.id === item.id);

      if (existingItemIndex >= 0) {
        // Mettre à jour la quantité
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += item.quantity || 1;

        return {
          ...state,
          items: updatedItems,
          bakeryId: item.bakeryId,
          bakeryName: item.bakeryName,
        };
      } else {
        // Ajouter un nouvel article
        return {
          ...state,
          items: [...state.items, { ...item, quantity: item.quantity || 1 }],
          bakeryId: item.bakeryId,
          bakeryName: item.bakeryName,
        };
      }
    }

    case "REMOVE_ITEM": {
      const updatedItems = state.items.filter((item) => item.id !== action.payload);
      return {
        ...state,
        items: updatedItems,
        // Si le panier est vide, réinitialiser la boulangerie
        bakeryId: updatedItems.length === 0 ? null : state.bakeryId,
        bakeryName: updatedItems.length === 0 ? null : state.bakeryName,
      };
    }

    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload;

      if (quantity <= 0) {
        return cartReducer(state, { type: "REMOVE_ITEM", payload: id });
      }

      const updatedItems = state.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );

      return { ...state, items: updatedItems };
    }

    case "CLEAR_CART":
      return {
        items: [],
        bakeryId: null,
        bakeryName: null,
      };

    case "SET_BAKERY": {
      const { bakeryId, bakeryName } = action.payload;

      // Si on change de boulangerie, vider le panier
      if (state.bakeryId && state.bakeryId !== bakeryId) {
        return {
          items: [],
          bakeryId,
          bakeryName,
        };
      }

      return {
        ...state,
        bakeryId,
        bakeryName,
      };
    }

    case "LOAD_FROM_STORAGE":
      return action.payload;

    default:
      return state;
  }
};

const initialState: CartState = {
  items: [],
  bakeryId: null,
  bakeryName: null,
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Charger depuis localStorage au montage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cart-storage");
      if (stored) {
        const parsedState = JSON.parse(stored);
        dispatch({ type: "LOAD_FROM_STORAGE", payload: parsedState });
      }
    } catch (error) {
      console.error("Erreur lors du chargement du panier:", error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Sauvegarder dans localStorage à chaque changement (sauf lors du chargement initial)
  useEffect(() => {
    if (!isInitialized) return;

    try {
      localStorage.setItem("cart-storage", JSON.stringify(state));
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du panier:", error);
    }
  }, [state, isInitialized]);

  // Mémoriser les fonctions pour éviter les re-renders
  const addItem = useCallback((item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: itemId });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id: itemId, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const setBakery = useCallback((bakeryId: string, bakeryName: string) => {
    dispatch({ type: "SET_BAKERY", payload: { bakeryId, bakeryName } });
  }, []);

  const getTotalItems = useCallback(() => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  }, [state.items]);

  const getTotalPrice = useCallback(() => {
    return state.items.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [state.items]);

  const getItemQuantity = useCallback((itemId: string) => {
    const item = state.items.find((i) => i.id === itemId);
    return item ? item.quantity : 0;
  }, [state.items]);

  const value = useMemo(() => ({
    state,
    dispatch,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setBakery,
    getTotalItems,
    getTotalPrice,
    getItemQuantity,
  }), [
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setBakery,
    getTotalItems,
    getTotalPrice,
    getItemQuantity,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}; 