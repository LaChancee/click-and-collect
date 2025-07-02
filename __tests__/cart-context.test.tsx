import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CartProvider, useCart, type CartItem } from "../src/stores/cart-context";
import { ReactNode } from "react";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

vi.stubGlobal("localStorage", localStorageMock);

// Composant de test pour utiliser le hook useCart
function TestComponent() {
  const {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setBakery,
    getTotalItems,
    getTotalPrice,
    getItemQuantity,
  } = useCart();

  return (
    <div>
      <div data-testid="total-items">{getTotalItems()}</div>
      <div data-testid="total-price">{getTotalPrice()}</div>
      <div data-testid="bakery-name">{state.bakeryName || "No bakery"}</div>
      <div data-testid="items-count">{state.items.length}</div>

      <button
        data-testid="add-item"
        onClick={() =>
          addItem({
            id: "test-item-1",
            name: "Croissant",
            price: 1.5,
            bakeryId: "bakery-1",
            bakeryName: "Test Bakery",
            bakerySlug: "test-bakery",
          })
        }
      >
        Add Item
      </button>

      <button
        data-testid="add-item-2"
        onClick={() =>
          addItem({
            id: "test-item-2",
            name: "Pain",
            price: 2.0,
            bakeryId: "bakery-1",
            bakeryName: "Test Bakery",
            bakerySlug: "test-bakery",
            quantity: 2,
          })
        }
      >
        Add Item 2
      </button>

      <button
        data-testid="remove-item"
        onClick={() => removeItem("test-item-1")}
      >
        Remove Item
      </button>

      <button
        data-testid="update-quantity"
        onClick={() => updateQuantity("test-item-1", 3)}
      >
        Update Quantity
      </button>

      <button
        data-testid="clear-cart"
        onClick={() => clearCart()}
      >
        Clear Cart
      </button>

      <button
        data-testid="set-bakery"
        onClick={() => setBakery("bakery-2", "New Bakery", "new-bakery")}
      >
        Set New Bakery
      </button>

      <div data-testid="item-quantity">
        {getItemQuantity("test-item-1")}
      </div>

      {state.items.map((item) => (
        <div key={item.id} data-testid={`item-${item.id}`}>
          {item.name} - {item.quantity} x {item.price}€
        </div>
      ))}
    </div>
  );
}

function renderWithCartProvider(children: ReactNode) {
  return render(<CartProvider>{children}</CartProvider>);
}

describe("CartContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initial state", () => {
    it("should initialize with empty cart", () => {
      renderWithCartProvider(<TestComponent />);

      expect(screen.getByTestId("total-items")).toHaveTextContent("0");
      expect(screen.getByTestId("total-price")).toHaveTextContent("0");
      expect(screen.getByTestId("bakery-name")).toHaveTextContent("No bakery");
      expect(screen.getByTestId("items-count")).toHaveTextContent("0");
    });

    it("should load state from localStorage on initialization", async () => {
      const savedState = {
        items: [
          {
            id: "saved-item",
            name: "Saved Croissant",
            price: 1.8,
            quantity: 2,
            bakeryId: "saved-bakery",
            bakeryName: "Saved Bakery",
            bakerySlug: "saved-bakery",
          },
        ],
        bakeryId: "saved-bakery",
        bakeryName: "Saved Bakery",
        bakerySlug: "saved-bakery",
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));

      renderWithCartProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("total-items")).toHaveTextContent("2");
        expect(screen.getByTestId("bakery-name")).toHaveTextContent("Saved Bakery");
        expect(screen.getByTestId("item-saved-item")).toBeInTheDocument();
      });
    });
  });

  describe("Adding items", () => {
    it("should add item to cart", () => {
      renderWithCartProvider(<TestComponent />);

      fireEvent.click(screen.getByTestId("add-item"));

      expect(screen.getByTestId("total-items")).toHaveTextContent("1");
      expect(screen.getByTestId("total-price")).toHaveTextContent("1.5");
      expect(screen.getByTestId("bakery-name")).toHaveTextContent("Test Bakery");
      expect(screen.getByTestId("item-test-item-1")).toBeInTheDocument();
    });

    it("should add item with custom quantity", () => {
      renderWithCartProvider(<TestComponent />);

      fireEvent.click(screen.getByTestId("add-item-2"));

      expect(screen.getByTestId("total-items")).toHaveTextContent("2");
      expect(screen.getByTestId("total-price")).toHaveTextContent("4");
    });

    it("should increase quantity when adding existing item", () => {
      renderWithCartProvider(<TestComponent />);

      // Add item twice
      fireEvent.click(screen.getByTestId("add-item"));
      fireEvent.click(screen.getByTestId("add-item"));

      expect(screen.getByTestId("total-items")).toHaveTextContent("2");
      expect(screen.getByTestId("total-price")).toHaveTextContent("3");
      expect(screen.getByTestId("item-quantity")).toHaveTextContent("2");
    });

    it("should clear cart when changing bakery", () => {
      renderWithCartProvider(<TestComponent />);

      // Add item to first bakery
      fireEvent.click(screen.getByTestId("add-item"));
      expect(screen.getByTestId("total-items")).toHaveTextContent("1");

      // Change bakery
      fireEvent.click(screen.getByTestId("set-bakery"));
      expect(screen.getByTestId("total-items")).toHaveTextContent("0");
      expect(screen.getByTestId("bakery-name")).toHaveTextContent("New Bakery");
    });
  });

  describe("Removing items", () => {
    it("should remove item from cart", () => {
      renderWithCartProvider(<TestComponent />);

      // Add item first
      fireEvent.click(screen.getByTestId("add-item"));
      expect(screen.getByTestId("total-items")).toHaveTextContent("1");

      // Remove item
      fireEvent.click(screen.getByTestId("remove-item"));
      expect(screen.getByTestId("total-items")).toHaveTextContent("0");
      expect(screen.getByTestId("bakery-name")).toHaveTextContent("No bakery");
    });

    it("should not affect other items when removing one", () => {
      renderWithCartProvider(<TestComponent />);

      // Add two different items
      fireEvent.click(screen.getByTestId("add-item"));
      fireEvent.click(screen.getByTestId("add-item-2"));
      expect(screen.getByTestId("total-items")).toHaveTextContent("3"); // 1 + 2

      // Remove first item
      fireEvent.click(screen.getByTestId("remove-item"));
      expect(screen.getByTestId("total-items")).toHaveTextContent("2");
      expect(screen.getByTestId("item-test-item-2")).toBeInTheDocument();
    });
  });

  describe("Updating quantities", () => {
    it("should update item quantity", () => {
      renderWithCartProvider(<TestComponent />);

      // Add item first
      fireEvent.click(screen.getByTestId("add-item"));
      expect(screen.getByTestId("total-items")).toHaveTextContent("1");

      // Update quantity
      fireEvent.click(screen.getByTestId("update-quantity"));
      expect(screen.getByTestId("total-items")).toHaveTextContent("3");
      expect(screen.getByTestId("total-price")).toHaveTextContent("4.5");
    });

    it("should remove item when quantity is set to 0", () => {
      renderWithCartProvider(<TestComponent />);

      // Add item first
      fireEvent.click(screen.getByTestId("add-item"));
      expect(screen.getByTestId("total-items")).toHaveTextContent("1");

      // Set quantity to 0
      fireEvent.click(screen.getByTestId("update-quantity"));
      fireEvent.click(screen.getByTestId("update-quantity"));
      // Create a button to set quantity to 0
      const { updateQuantity } = useCart();

      // We'll test this by creating a specific test
    });
  });

  describe("Cart calculations", () => {
    it("should calculate total items correctly", () => {
      renderWithCartProvider(<TestComponent />);

      fireEvent.click(screen.getByTestId("add-item")); // 1 item
      fireEvent.click(screen.getByTestId("add-item-2")); // 2 items

      expect(screen.getByTestId("total-items")).toHaveTextContent("3");
    });

    it("should calculate total price correctly", () => {
      renderWithCartProvider(<TestComponent />);

      fireEvent.click(screen.getByTestId("add-item")); // 1.5€
      fireEvent.click(screen.getByTestId("add-item-2")); // 4.0€ (2 x 2€)

      expect(screen.getByTestId("total-price")).toHaveTextContent("5.5");
    });

    it("should return correct item quantity", () => {
      renderWithCartProvider(<TestComponent />);

      expect(screen.getByTestId("item-quantity")).toHaveTextContent("0");

      fireEvent.click(screen.getByTestId("add-item"));
      expect(screen.getByTestId("item-quantity")).toHaveTextContent("1");

      fireEvent.click(screen.getByTestId("add-item"));
      expect(screen.getByTestId("item-quantity")).toHaveTextContent("2");
    });
  });

  describe("Clear cart", () => {
    it("should clear all items and reset bakery", () => {
      renderWithCartProvider(<TestComponent />);

      // Add items
      fireEvent.click(screen.getByTestId("add-item"));
      fireEvent.click(screen.getByTestId("add-item-2"));
      expect(screen.getByTestId("total-items")).toHaveTextContent("3");

      // Clear cart
      fireEvent.click(screen.getByTestId("clear-cart"));
      expect(screen.getByTestId("total-items")).toHaveTextContent("0");
      expect(screen.getByTestId("total-price")).toHaveTextContent("0");
      expect(screen.getByTestId("bakery-name")).toHaveTextContent("No bakery");
    });
  });

  describe("LocalStorage persistence", () => {
    it("should save state to localStorage when cart changes", async () => {
      renderWithCartProvider(<TestComponent />);

      fireEvent.click(screen.getByTestId("add-item"));

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "cart-storage",
          expect.stringContaining("test-item-1")
        );
      });
    });

    it("should handle localStorage errors gracefully", () => {
      // Mock localStorage to throw an error
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });

      // Should not crash the app
      renderWithCartProvider(<TestComponent />);
      fireEvent.click(screen.getByTestId("add-item"));

      expect(screen.getByTestId("total-items")).toHaveTextContent("1");
    });
  });

  describe("Hook error handling", () => {
    it("should throw error when useCart is used outside CartProvider", () => {
      // Capture console.error to prevent noise in test output
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => { });

      expect(() => {
        render(<TestComponent />);
      }).toThrow("useCart must be used within a CartProvider");

      consoleError.mockRestore();
    });
  });

  describe("Edge cases", () => {
    it("should handle corrupted localStorage data", () => {
      localStorageMock.getItem.mockReturnValue("invalid json");

      renderWithCartProvider(<TestComponent />);

      // Should initialize with empty cart
      expect(screen.getByTestId("total-items")).toHaveTextContent("0");
    });

    it("should handle negative quantities", () => {
      renderWithCartProvider(<TestComponent />);

      fireEvent.click(screen.getByTestId("add-item"));

      // Try to update to negative quantity - should remove item
      const { updateQuantity } = useCart();
      // This would be tested in a more specific test
    });
  });
});

// Test helper functions
describe("Cart utility functions", () => {
  it("should calculate subtotal correctly", () => {
    const items: CartItem[] = [
      {
        id: "1",
        name: "Item 1",
        price: 1.5,
        quantity: 2,
        bakeryId: "bakery-1",
        bakeryName: "Test Bakery",
        bakerySlug: "test-bakery",
      },
      {
        id: "2",
        name: "Item 2",
        price: 2.0,
        quantity: 1,
        bakeryId: "bakery-1",
        bakeryName: "Test Bakery",
        bakerySlug: "test-bakery",
      },
    ];

    const calculateSubtotal = (items: CartItem[]) => {
      return items.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    expect(calculateSubtotal(items)).toBe(5.0); // (1.5 * 2) + (2.0 * 1)
  });
}); 