import OrderConfirmationEmail from './order-confirmation-email';

// Données de test pour prévisualiser l'email
const testData = {
  orderNumber: "CMD-ABC12345",
  customerName: "Marie Dupont",
  bakeryName: "Les délices d'Erwann",
  items: [
    {
      name: "Pain de campagne",
      quantity: 2,
      unitPrice: 3.50,
      image: undefined,
    },
    {
      name: "Croissants",
      quantity: 4,
      unitPrice: 1.20,
      notes: "Bien dorés s'il vous plaît",
    },
    {
      name: "Tarte aux pommes",
      quantity: 1,
      unitPrice: 12.00,
    },
  ],
  totalAmount: 23.80,
  pickupDate: "vendredi 20 décembre 2024",
  pickupTime: "10:00 - 10:15",
  paymentMethod: "Carte en ligne",
  notes: "Merci de bien emballer la tarte",
};

export default function TestEmail() {
  return <OrderConfirmationEmail {...testData} />;
} 