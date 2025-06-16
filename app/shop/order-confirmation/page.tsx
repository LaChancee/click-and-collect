import { notFound } from "next/navigation";
import { getOrderByNumberAction } from "./_actions/get-order-by-number.action";
import { OrderConfirmationClient } from "./_components/OrderConfirmationClient";
import type { PageParams } from "@/types/next";

export default async function OrderConfirmationPage(props: PageParams) {
  const searchParams = await props.searchParams;
  const orderNumber = searchParams?.orderNumber as string;

  if (!orderNumber) {
    notFound();
  }

  try {
    const order = await getOrderByNumberAction(orderNumber);

    return (
      <OrderConfirmationClient order={order} />
    );
  } catch (error) {
    console.error("Erreur lors du chargement de la commande:", error);
    notFound();
  }
} 