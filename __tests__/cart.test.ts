import { describe, it, expect } from "vitest";

// Types pour le panier
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  categoryId: string;
}

interface Cart {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
}

// Utilitaires pour le panier
export function addItemToCart(
  cart: Cart,
  item: Omit<CartItem, "quantity">,
  quantity: number = 1,
): Cart {
  const existingItemIndex = cart.items.findIndex(
    (cartItem) => cartItem.id === item.id,
  );

  let updatedItems: CartItem[];

  if (existingItemIndex !== -1) {
    // L'article existe déjà, on augmente la quantité
    updatedItems = cart.items.map((cartItem, index) =>
      index === existingItemIndex
        ? { ...cartItem, quantity: cartItem.quantity + quantity }
        : cartItem,
    );
  } else {
    // Nouvel article
    updatedItems = [...cart.items, { ...item, quantity }];
  }

  return {
    items: updatedItems,
    totalQuantity: calculateTotalQuantity(updatedItems),
    totalAmount: calculateTotalAmount(updatedItems),
  };
}

export function removeItemFromCart(cart: Cart, itemId: string): Cart {
  const updatedItems = cart.items.filter((item) => item.id !== itemId);

  return {
    items: updatedItems,
    totalQuantity: calculateTotalQuantity(updatedItems),
    totalAmount: calculateTotalAmount(updatedItems),
  };
}

export function updateItemQuantity(
  cart: Cart,
  itemId: string,
  quantity: number,
): Cart {
  if (quantity <= 0) {
    return removeItemFromCart(cart, itemId);
  }

  const updatedItems = cart.items.map((item) =>
    item.id === itemId ? { ...item, quantity } : item,
  );

  return {
    items: updatedItems,
    totalQuantity: calculateTotalQuantity(updatedItems),
    totalAmount: calculateTotalAmount(updatedItems),
  };
}

export function calculateTotalQuantity(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function calculateTotalAmount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function clearCart(): Cart {
  return {
    items: [],
    totalQuantity: 0,
    totalAmount: 0,
  };
}

export function getItemQuantity(cart: Cart, itemId: string): number {
  const item = cart.items.find((item) => item.id === itemId);
  return item ? item.quantity : 0;
}

export function isCartEmpty(cart: Cart): boolean {
  return cart.items.length === 0;
}

export function getCartItemsByCategory(
  cart: Cart,
  categoryId: string,
): CartItem[] {
  return cart.items.filter((item) => item.categoryId === categoryId);
}

export function calculateCartSummary(cart: Cart) {
  return {
    itemCount: cart.items.length,
    totalQuantity: cart.totalQuantity,
    totalAmount: cart.totalAmount,
    averageItemPrice:
      cart.items.length > 0 ? cart.totalAmount / cart.totalQuantity : 0,
  };
}

// Tests
describe("Cart Utils", () => {
  const sampleItem1: Omit<CartItem, "quantity"> = {
    id: "item-1",
    name: "Croissant",
    price: 1.5,
    categoryId: "cat-viennoiserie",
  };

  const sampleItem2: Omit<CartItem, "quantity"> = {
    id: "item-2",
    name: "Pain de campagne",
    price: 3.2,
    categoryId: "cat-pain",
  };

  const emptyCart: Cart = {
    items: [],
    totalQuantity: 0,
    totalAmount: 0,
  };

  describe("addItemToCart", () => {
    it("should add new item to empty cart", () => {
      const result = addItemToCart(emptyCart, sampleItem1, 2);

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual({ ...sampleItem1, quantity: 2 });
      expect(result.totalQuantity).toBe(2);
      expect(result.totalAmount).toBe(3.0);
    });

    it("should increase quantity for existing item", () => {
      const cartWithItem = addItemToCart(emptyCart, sampleItem1, 1);
      const result = addItemToCart(cartWithItem, sampleItem1, 2);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].quantity).toBe(3);
      expect(result.totalQuantity).toBe(3);
      expect(result.totalAmount).toBe(4.5);
    });

    it("should add multiple different items", () => {
      const cartWithItem1 = addItemToCart(emptyCart, sampleItem1, 1);
      const result = addItemToCart(cartWithItem1, sampleItem2, 1);

      expect(result.items).toHaveLength(2);
      expect(result.totalQuantity).toBe(2);
      expect(result.totalAmount).toBe(4.7);
    });
  });

  describe("removeItemFromCart", () => {
    it("should remove item from cart", () => {
      const cartWithItems = addItemToCart(
        addItemToCart(emptyCart, sampleItem1, 2),
        sampleItem2,
        1,
      );

      const result = removeItemFromCart(cartWithItems, "item-1");

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe("item-2");
      expect(result.totalQuantity).toBe(1);
      expect(result.totalAmount).toBe(3.2);
    });

    it("should handle removing non-existent item", () => {
      const cartWithItem = addItemToCart(emptyCart, sampleItem1, 1);
      const result = removeItemFromCart(cartWithItem, "non-existent");

      expect(result).toEqual(cartWithItem);
    });
  });

  describe("updateItemQuantity", () => {
    it("should update item quantity", () => {
      const cartWithItem = addItemToCart(emptyCart, sampleItem1, 1);
      const result = updateItemQuantity(cartWithItem, "item-1", 3);

      expect(result.items[0].quantity).toBe(3);
      expect(result.totalQuantity).toBe(3);
      expect(result.totalAmount).toBe(4.5);
    });

    it("should remove item when quantity is 0", () => {
      const cartWithItem = addItemToCart(emptyCart, sampleItem1, 1);
      const result = updateItemQuantity(cartWithItem, "item-1", 0);

      expect(result.items).toHaveLength(0);
      expect(result.totalQuantity).toBe(0);
      expect(result.totalAmount).toBe(0);
    });

    it("should remove item when quantity is negative", () => {
      const cartWithItem = addItemToCart(emptyCart, sampleItem1, 1);
      const result = updateItemQuantity(cartWithItem, "item-1", -1);

      expect(result.items).toHaveLength(0);
    });
  });

  describe("calculateTotalQuantity", () => {
    it("should calculate total quantity correctly", () => {
      const items: CartItem[] = [
        { ...sampleItem1, quantity: 2 },
        { ...sampleItem2, quantity: 3 },
      ];

      expect(calculateTotalQuantity(items)).toBe(5);
    });

    it("should return 0 for empty array", () => {
      expect(calculateTotalQuantity([])).toBe(0);
    });
  });

  describe("calculateTotalAmount", () => {
    it("should calculate total amount correctly", () => {
      const items: CartItem[] = [
        { ...sampleItem1, quantity: 2 }, // 1.50 * 2 = 3.00
        { ...sampleItem2, quantity: 1 }, // 3.20 * 1 = 3.20
      ];

      expect(calculateTotalAmount(items)).toBe(6.2);
    });

    it("should return 0 for empty array", () => {
      expect(calculateTotalAmount([])).toBe(0);
    });
  });

  describe("clearCart", () => {
    it("should return empty cart", () => {
      const result = clearCart();

      expect(result.items).toHaveLength(0);
      expect(result.totalQuantity).toBe(0);
      expect(result.totalAmount).toBe(0);
    });
  });

  describe("getItemQuantity", () => {
    it("should return correct quantity for existing item", () => {
      const cartWithItem = addItemToCart(emptyCart, sampleItem1, 3);

      expect(getItemQuantity(cartWithItem, "item-1")).toBe(3);
    });

    it("should return 0 for non-existent item", () => {
      const cartWithItem = addItemToCart(emptyCart, sampleItem1, 1);

      expect(getItemQuantity(cartWithItem, "non-existent")).toBe(0);
    });
  });

  describe("isCartEmpty", () => {
    it("should return true for empty cart", () => {
      expect(isCartEmpty(emptyCart)).toBe(true);
    });

    it("should return false for cart with items", () => {
      const cartWithItem = addItemToCart(emptyCart, sampleItem1, 1);
      expect(isCartEmpty(cartWithItem)).toBe(false);
    });
  });

  describe("getCartItemsByCategory", () => {
    it("should return items from specific category", () => {
      const cartWithItems = addItemToCart(
        addItemToCart(emptyCart, sampleItem1, 1),
        sampleItem2,
        1,
      );

      const viennoiserieItems = getCartItemsByCategory(
        cartWithItems,
        "cat-viennoiserie",
      );

      expect(viennoiserieItems).toHaveLength(1);
      expect(viennoiserieItems[0].id).toBe("item-1");
    });

    it("should return empty array for non-existent category", () => {
      const cartWithItem = addItemToCart(emptyCart, sampleItem1, 1);
      const result = getCartItemsByCategory(cartWithItem, "non-existent");

      expect(result).toHaveLength(0);
    });
  });

  describe("calculateCartSummary", () => {
    it("should calculate summary correctly", () => {
      const cartWithItems = addItemToCart(
        addItemToCart(emptyCart, sampleItem1, 2),
        sampleItem2,
        1,
      );

      const summary = calculateCartSummary(cartWithItems);

      expect(summary.itemCount).toBe(2);
      expect(summary.totalQuantity).toBe(3);
      expect(summary.totalAmount).toBe(6.2);
      expect(summary.averageItemPrice).toBeCloseTo(2.07, 2);
    });

    it("should handle empty cart", () => {
      const summary = calculateCartSummary(emptyCart);

      expect(summary.itemCount).toBe(0);
      expect(summary.totalQuantity).toBe(0);
      expect(summary.totalAmount).toBe(0);
      expect(summary.averageItemPrice).toBe(0);
    });
  });
});
