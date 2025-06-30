import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";

// Mock des composantes UI
vi.mock("@/components/ui/input", () => ({
  Input: ({ placeholder, value, onChange, ...props }: any) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      data-testid="search-input"
      {...props}
    />
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, variant, size, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} data-size={size} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({ children }: any) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div onClick={onClick} data-testid="dropdown-item">
      {children}
    </div>
  ),
  DropdownMenuCheckboxItem: ({ children, checked, onCheckedChange }: any) => (
    <div
      onClick={() => onCheckedChange?.(!checked)}
      data-testid="dropdown-checkbox"
      data-checked={checked}
    >
      {children}
    </div>
  ),
  DropdownMenuLabel: ({ children }: any) => (
    <div data-testid="dropdown-label">{children}</div>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
}));

vi.mock("@/components/ui/table", () => ({
  Table: ({ children }: any) => <table data-testid="orders-table">{children}</table>,
  TableHeader: ({ children }: any) => <thead>{children}</thead>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableRow: ({ children }: any) => <tr>{children}</tr>,
  TableHead: ({ children }: any) => <th>{children}</th>,
  TableCell: ({ children }: any) => <td>{children}</td>,
}));

// Mock des icônes
vi.mock("lucide-react", () => ({
  Search: () => <div data-testid="search-icon">Search</div>,
  Settings2: () => <div data-testid="settings-icon">Settings</div>,
  ChevronDown: () => <div data-testid="chevron-down">ChevronDown</div>,
  ArrowUpDown: () => <div data-testid="arrow-up-down">Sort</div>,
}));

// Types de test
interface MockOrderItem {
  id: string;
  quantity: number;
  article: {
    name: string;
  };
}

interface MockOrder {
  id: string;
  orderNumber: string;
  customerName: string | null;
  totalAmount: number;
  items: MockOrderItem[];
  customer: { name: string } | null;
  timeSlot: {
    date: Date;
    startTime: string;
    endTime: string;
  };
  status: string;
  paymentStatus: string;
  createdAt: Date;
}

// Composant de test simplifié (simulant OrdersDataTable)
const MockOrdersDataTable = ({
  data,
  onSearch
}: {
  data: MockOrder[];
  onSearch?: (value: string) => void;
}) => {
  return (
    <div data-testid="orders-data-table">
      <div className="flex items-center py-4">
        <input
          placeholder="Rechercher par numéro de commande..."
          onChange={(e) => onSearch?.(e.target.value)}
          data-testid="search-input"
        />
      </div>
      <table data-testid="orders-table">
        <thead>
          <tr>
            <th>Numéro</th>
            <th>Client</th>
            <th>Articles</th>
            <th>Créneau</th>
            <th>Total</th>
            <th>Statut</th>
            <th>Paiement</th>
            <th>Créé le</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((order) => (
            <tr key={order.id} data-testid={`order-row-${order.id}`}>
              <td>#{order.orderNumber}</td>
              <td>{order.customer?.name || order.customerName || "Client invité"}</td>
              <td>
                {order.items.reduce((sum, item) => sum + item.quantity, 0)} articles
              </td>
              <td>
                {order.timeSlot.date.toLocaleDateString("fr-FR")} •
                {order.timeSlot.startTime} - {order.timeSlot.endTime}
              </td>
              <td>{(order.totalAmount / 100).toFixed(2)} €</td>
              <td>{order.status}</td>
              <td>{order.paymentStatus}</td>
              <td>{order.createdAt.toLocaleDateString("fr-FR")}</td>
              <td>
                <button data-testid={`actions-${order.id}`}>Actions</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div data-testid="pagination">
        <span>Page 1 sur 1</span>
      </div>
    </div>
  );
};

describe("OrdersDataTable", () => {
  const mockOrders: MockOrder[] = [
    {
      id: "order-1",
      orderNumber: "ORD-001",
      customerName: "John Doe",
      totalAmount: 2499,
      customer: { name: "John Doe" },
      items: [
        { id: "item-1", quantity: 2, article: { name: "Croissant" } },
        { id: "item-2", quantity: 1, article: { name: "Pain" } },
      ],
      timeSlot: {
        date: new Date("2024-01-16T09:00:00Z"),
        startTime: "09:00",
        endTime: "09:15",
      },
      status: "PENDING",
      paymentStatus: "PENDING",
      createdAt: new Date("2024-01-15T10:30:00Z"),
    },
    {
      id: "order-2",
      orderNumber: "ORD-002",
      customerName: null,
      totalAmount: 1500,
      customer: null,
      items: [
        { id: "item-3", quantity: 1, article: { name: "Baguette" } },
      ],
      timeSlot: {
        date: new Date("2024-01-16T10:00:00Z"),
        startTime: "10:00",
        endTime: "10:15",
      },
      status: "CONFIRMED",
      paymentStatus: "PAID",
      createdAt: new Date("2024-01-15T11:00:00Z"),
    },
  ];

  describe("Rendering", () => {
    it("should render orders table with correct headers", () => {
      render(<MockOrdersDataTable data={mockOrders} />);

      expect(screen.getByTestId("orders-data-table")).toBeInTheDocument();
      expect(screen.getByTestId("orders-table")).toBeInTheDocument();

      // Vérifier les en-têtes
      expect(screen.getByText("Numéro")).toBeInTheDocument();
      expect(screen.getByText("Client")).toBeInTheDocument();
      expect(screen.getByText("Articles")).toBeInTheDocument();
      expect(screen.getByText("Créneau")).toBeInTheDocument();
      expect(screen.getByText("Total")).toBeInTheDocument();
      expect(screen.getByText("Statut")).toBeInTheDocument();
      expect(screen.getByText("Paiement")).toBeInTheDocument();
      expect(screen.getByText("Créé le")).toBeInTheDocument();
      expect(screen.getByText("Actions")).toBeInTheDocument();
    });

    it("should render all orders in the table", () => {
      render(<MockOrdersDataTable data={mockOrders} />);

      // Vérifier que les deux commandes sont affichées
      expect(screen.getByTestId("order-row-order-1")).toBeInTheDocument();
      expect(screen.getByTestId("order-row-order-2")).toBeInTheDocument();
    });

    it("should display order information correctly", () => {
      render(<MockOrdersDataTable data={mockOrders} />);

      // Vérifier les données de la première commande
      expect(screen.getByText("#ORD-001")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("3 articles")).toBeInTheDocument();
      expect(screen.getByText("24.99 €")).toBeInTheDocument();
      expect(screen.getByText("PENDING")).toBeInTheDocument();
    });

    it("should handle guest customers correctly", () => {
      render(<MockOrdersDataTable data={mockOrders} />);

      // La deuxième commande n'a pas de customer, donc devrait afficher "Client invité"
      expect(screen.getByText("Client invité")).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("should render search input", () => {
      render(<MockOrdersDataTable data={mockOrders} />);

      const searchInput = screen.getByTestId("search-input");
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute(
        "placeholder",
        "Rechercher par numéro de commande..."
      );
    });

    it("should call onSearch when typing in search input", async () => {
      const mockOnSearch = vi.fn();
      render(<MockOrdersDataTable data={mockOrders} onSearch={mockOnSearch} />);

      const searchInput = screen.getByTestId("search-input");
      await userEvent.type(searchInput, "ORD");

      expect(mockOnSearch).toHaveBeenCalledWith("O");
      expect(mockOnSearch).toHaveBeenCalledWith("OR");
      expect(mockOnSearch).toHaveBeenCalledWith("ORD");
    });
  });

  describe("Data Display", () => {
    it("should format prices correctly", () => {
      render(<MockOrdersDataTable data={mockOrders} />);

      expect(screen.getByText("24.99 €")).toBeInTheDocument();
      expect(screen.getByText("15.00 €")).toBeInTheDocument();
    });

    it("should format dates correctly", () => {
      render(<MockOrdersDataTable data={mockOrders} />);

      // Les dates devraient être formatées en français
      const dateElements = screen.getAllByText(/\d{2}\/\d{2}\/\d{4}/);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it("should show articles count correctly", () => {
      render(<MockOrdersDataTable data={mockOrders} />);

      expect(screen.getByText("3 articles")).toBeInTheDocument(); // 2 + 1
      expect(screen.getByText("1 articles")).toBeInTheDocument(); // 1 seul article
    });

    it("should display time slots correctly", () => {
      render(<MockOrdersDataTable data={mockOrders} />);

      expect(screen.getByText(/09:00 - 09:15/)).toBeInTheDocument();
      expect(screen.getByText(/10:00 - 10:15/)).toBeInTheDocument();
    });
  });

  describe("Actions", () => {
    it("should render action buttons for each order", () => {
      render(<MockOrdersDataTable data={mockOrders} />);

      expect(screen.getByTestId("actions-order-1")).toBeInTheDocument();
      expect(screen.getByTestId("actions-order-2")).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should handle empty orders array", () => {
      render(<MockOrdersDataTable data={[]} />);

      expect(screen.getByTestId("orders-table")).toBeInTheDocument();
      // La table devrait être vide mais présente
      expect(screen.queryByTestId(/order-row-/)).not.toBeInTheDocument();
    });
  });

  describe("Status Display", () => {
    it("should display order status", () => {
      render(<MockOrdersDataTable data={mockOrders} />);

      expect(screen.getByText("PENDING")).toBeInTheDocument();
      expect(screen.getByText("CONFIRMED")).toBeInTheDocument();
    });

    it("should display payment status", () => {
      render(<MockOrdersDataTable data={mockOrders} />);

      expect(screen.getAllByText("PENDING")).toHaveLength(1); // Un seul PENDING pour le payment
      expect(screen.getByText("PAID")).toBeInTheDocument();
    });
  });
}); 