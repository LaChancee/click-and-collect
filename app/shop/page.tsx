import { notFound } from "next/navigation";
import { getBakeryDataAction } from "./_actions/get-bakery-data.action";
import { ShopClient } from "./_components/ShopClient";
import type { PageParams } from "@/types/next";

export default async function ShopPage(props: PageParams) {
  const searchParams = await props.searchParams;
  const bakerySlug = searchParams?.bakery as string;

  if (!bakerySlug) {
    notFound();
  }

  try {
    const { bakery, categories, articles } = await getBakeryDataAction(bakerySlug);

    return (
      <ShopClient
        bakery={bakery}
        categories={categories}
        articles={articles}
      />
    );
  } catch (error) {
    console.error("Erreur lors du chargement de la boulangerie:", error);
    notFound();
  }
} 