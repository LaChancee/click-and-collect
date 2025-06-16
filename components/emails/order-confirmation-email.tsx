import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';

interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  image?: string;
  notes?: string;
}

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  bakeryName: string;
  items: OrderItem[];
  totalAmount: number;
  pickupDate: string;
  pickupTime: string;
  paymentMethod: string;
  notes?: string;
}

export const OrderConfirmationEmail = ({
  orderNumber = "12345",
  customerName = "Client",
  bakeryName = "Les délices d'Erwann",
  items = [],
  totalAmount = 0,
  pickupDate = "Aujourd'hui",
  pickupTime = "10:00 - 10:15",
  paymentMethod = "Carte en ligne",
  notes,
}: OrderConfirmationEmailProps) => {
  const previewText = `Votre commande #${orderNumber} chez ${bakeryName} est confirmée`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>🥖 {bakeryName}</Heading>
            <Text style={headerText}>Confirmation de commande</Text>
          </Section>

          {/* Order Info */}
          <Section style={section}>
            <Heading style={h2}>Bonjour {customerName},</Heading>
            <Text style={text}>
              Votre commande <strong>#{orderNumber}</strong> a été confirmée avec succès !
            </Text>
            <Text style={text}>
              Vous pourrez la récupérer le <strong>{pickupDate}</strong> entre <strong>{pickupTime}</strong>.
            </Text>
          </Section>

          {/* Items */}
          <Section style={section}>
            <Heading style={h3}>Détail de votre commande</Heading>
            {items.map((item, index) => (
              <Row key={index} style={itemRow}>
                <Column style={itemColumn}>
                  <Text style={itemName}>{item.name}</Text>
                  {item.notes && (
                    <Text style={itemNotes}>Note: {item.notes}</Text>
                  )}
                </Column>
                <Column style={quantityColumn}>
                  <Text style={itemQuantity}>{item.quantity}x</Text>
                </Column>
                <Column style={priceColumn}>
                  <Text style={itemPrice}>{item.unitPrice.toFixed(2)}€</Text>
                </Column>
                <Column style={totalColumn}>
                  <Text style={itemTotal}>
                    {(item.quantity * item.unitPrice).toFixed(2)}€
                  </Text>
                </Column>
              </Row>
            ))}

            <Row style={totalRow}>
              <Column style={totalLabelColumn}>
                <Text style={totalLabel}>Total</Text>
              </Column>
              <Column style={totalAmountColumn}>
                <Text style={totalAmountStyle}>{totalAmount.toFixed(2)}€</Text>
              </Column>
            </Row>
          </Section>

          {/* Payment Info */}
          <Section style={section}>
            <Heading style={h3}>Paiement</Heading>
            <Text style={text}>
              Mode de paiement: <strong>{paymentMethod}</strong>
            </Text>
          </Section>

          {/* Notes */}
          {notes && (
            <Section style={section}>
              <Heading style={h3}>Notes pour la boulangerie</Heading>
              <Text style={notesText}>{notes}</Text>
            </Section>
          )}

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Merci de votre confiance !<br />
              L'équipe de {bakeryName}
            </Text>
            <Text style={footerSmall}>
              Cet email a été envoyé automatiquement, merci de ne pas y répondre.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 24px',
  backgroundColor: '#8B5CF6',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px',
  textAlign: 'center' as const,
};

const headerText = {
  color: '#ffffff',
  fontSize: '16px',
  margin: '0',
  textAlign: 'center' as const,
};

const section = {
  padding: '24px',
};

const h2 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const h3 = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 12px',
};

const itemRow = {
  borderBottom: '1px solid #e5e7eb',
  padding: '12px 0',
};

const itemColumn = {
  width: '50%',
  verticalAlign: 'top' as const,
};

const quantityColumn = {
  width: '15%',
  textAlign: 'center' as const,
  verticalAlign: 'top' as const,
};

const priceColumn = {
  width: '15%',
  textAlign: 'right' as const,
  verticalAlign: 'top' as const,
};

const totalColumn = {
  width: '20%',
  textAlign: 'right' as const,
  verticalAlign: 'top' as const,
};

const itemName = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
};

const itemNotes = {
  color: '#6b7280',
  fontSize: '14px',
  fontStyle: 'italic',
  margin: '4px 0 0',
};

const itemQuantity = {
  color: '#374151',
  fontSize: '16px',
  margin: '0',
};

const itemPrice = {
  color: '#374151',
  fontSize: '16px',
  margin: '0',
};

const itemTotal = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
};

const totalRow = {
  borderTop: '2px solid #8B5CF6',
  padding: '16px 0 0',
  marginTop: '12px',
};

const totalLabelColumn = {
  width: '80%',
  textAlign: 'right' as const,
};

const totalAmountColumn = {
  width: '20%',
  textAlign: 'right' as const,
};

const totalLabel = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0',
};

const totalAmountStyle = {
  color: '#8B5CF6',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0',
};

const notesText = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  backgroundColor: '#f3f4f6',
  padding: '12px',
  borderRadius: '6px',
  margin: '0',
};

const footer = {
  padding: '24px',
  backgroundColor: '#f9fafb',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#1f2937',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 12px',
};

const footerSmall = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
};

export default OrderConfirmationEmail; 